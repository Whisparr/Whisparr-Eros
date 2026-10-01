using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Datastore.Events;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Qualities;
using NzbDrone.SignalR;
using Whisparr.Http;
using Whisparr.Http.Extensions;
using Whisparr.Http.REST;
using Whisparr.Http.REST.Attributes;

namespace Whisparr.Api.V3.Review
{
    [V3ApiController]
    public class ReviewController : RestControllerWithSignalR<ReviewResource, ReviewItem>,
                                    IHandle<ReviewQueueUpdatedEvent>
    {
        private readonly IReviewService _reviewService;
        private readonly IMovieService _movieService;

        public ReviewController(IBroadcastSignalRMessage signalRBroadcaster,
                                IReviewService reviewService,
                                IMovieService movieService)
            : base(signalRBroadcaster)
        {
            _reviewService = reviewService;
            _movieService = movieService;
        }

        protected override ReviewResource GetResourceById(int id)
        {
            var item = _reviewService.Get(id);

            return item.ToResource(GetMovies(new[] { item }));
        }

        [HttpGet]
        [Produces("application/json")]
        public PagingResource<ReviewResource> GetReview([FromQuery] PagingRequestResource paging)
        {
            var pagingResource = new PagingResource<ReviewResource>(paging);
            var pagingSpec = pagingResource.MapToPagingSpec<ReviewResource, ReviewItem>(
                new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "added",
                    "indexer",
                    "movieMetadata.sortTitle",
                    "size",
                    "title"
                },
                "added",
                SortDirection.Descending);

            pagingSpec.FilterExpressions.Add(r => r.Status == ReviewItemStatus.Pending);

            IReadOnlyDictionary<int, Movie> movies = null;

            return pagingSpec.ApplyToPage(
                spec =>
                {
                    var page = _reviewService.Paged(spec);
                    movies = GetMovies(page.Records);

                    return page;
                },
                r => r.ToResource(movies));
        }

        [HttpGet("status")]
        [Produces("application/json")]
        public ReviewStatusResource GetStatus()
        {
            return new ReviewStatusResource
            {
                Count = _reviewService.PendingCount()
            };
        }

        [HttpPost("approve")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public async Task<ReviewActionResultResource> Approve([FromBody] ReviewApproveResource resource)
        {
            var ids = resource.Ids ?? new List<int>();
            var items = resource.Items ?? new List<ReviewApproveItemResource>();

            if (ids.Count == 0 && items.Count == 0)
            {
                throw new BadRequestException("ids or items must be provided");
            }

            if (resource.MovieId.HasValue && ids.Count > 1)
            {
                throw new BadRequestException("movieId can only be given when approving a single release, use items to choose a scene per release");
            }

            if (resource.ForeignId.IsNotNullOrWhiteSpace() && ids.Count > 1)
            {
                throw new BadRequestException("foreignId can only be given when approving a single release, use items to choose a scene per release");
            }

            if (resource.ManualMatch && !resource.MovieId.HasValue && resource.ForeignId.IsNullOrWhiteSpace())
            {
                throw new BadRequestException("movieId or foreignId must be given with manualMatch");
            }

            if (items.Any(i => i.ManualMatch && !i.MovieId.HasValue && i.ForeignId.IsNullOrWhiteSpace()))
            {
                throw new BadRequestException("movieId or foreignId must be given for every item with manualMatch");
            }

            var quality = GetQuality(resource.QualityId, resource.Quality);

            // A release listed in items uses its own choices, the ones listed in ids share the top level ones
            var requests = items.Select(i => new ApproveRequest(i.Id, i.MovieId, i.ForeignId, i.ManualMatch, GetQuality(i.QualityId, i.Quality) ?? quality))
                                .Concat(ids.Select(id => new ApproveRequest(id, resource.MovieId, resource.ForeignId, resource.ManualMatch, quality)))
                                .DistinctBy(r => r.Id)
                                .ToList();

            var result = new ReviewActionResultResource();

            // A single release reports why it couldn't be grabbed as the response, a bulk approval carries on and lists the failures
            if (requests.Count == 1)
            {
                var request = requests[0];

                await _reviewService.Approve(request.Id, request.MovieId, request.Quality, request.ManualMatch, request.ForeignId);
                result.Approved.Add(request.Id);

                return result;
            }

            // A grab only shows in the queue once the download client reports it, so a batch keeps its own tally
            var grabbedMovieIds = new HashSet<int>();
            var grabbedForeignIds = new HashSet<string>();

            foreach (var request in requests)
            {
                try
                {
                    var item = _reviewService.Get(request.Id);
                    var isForeign = request.ForeignId.IsNotNullOrWhiteSpace();
                    var movieId = request.MovieId ?? item.MovieId;

                    if (isForeign ? grabbedForeignIds.Contains(request.ForeignId) : grabbedMovieIds.Contains(movieId))
                    {
                        result.Failed.Add(new ReviewActionFailureResource { Id = request.Id, Message = $"Another selected release was already grabbed for the scene of '{item.Title}'" });
                        continue;
                    }

                    var grabbedMovieId = await _reviewService.Approve(request.Id, request.MovieId, request.Quality, request.ManualMatch, request.ForeignId);

                    if (isForeign)
                    {
                        grabbedForeignIds.Add(request.ForeignId);
                    }
                    else
                    {
                        grabbedMovieIds.Add(movieId);
                    }

                    if (grabbedMovieId > 0)
                    {
                        grabbedMovieIds.Add(grabbedMovieId);
                    }

                    result.Approved.Add(request.Id);
                }
                catch (Exception ex)
                {
                    result.Failed.Add(new ReviewActionFailureResource { Id = request.Id, Message = ex.Message });
                }
            }

            return result;
        }

        [HttpGet("{id:int}/scenes")]
        [Produces("application/json")]
        public List<ReviewCandidateResource> GetScenes(int id, [FromQuery] string query, [FromQuery] bool allStudios = false, [FromQuery] int limit = 100)
        {
            return _reviewService.FindScenes(id, query, allStudios, Math.Clamp(limit, 1, 500))
                                 .Select(m => m.ToSceneResource())
                                 .ToList();
        }

        // Scenes on the metadata source (StashDB), for a release whose scene isn't in the library yet
        [HttpGet("{id:int}/lookup")]
        [Produces("application/json")]
        public List<ReviewCandidateResource> LookupScenes(int id, [FromQuery] string term)
        {
            return _reviewService.LookupScenes(id, term)
                                 .Select(m => m.ToSceneResource())
                                 .ToList();
        }

        [HttpPost("reject")]
        [Consumes("application/json")]
        public void Reject([FromBody] ReviewBulkResource resource)
        {
            if (resource.Ids == null || resource.Ids.Count == 0)
            {
                throw new BadRequestException("ids must be provided");
            }

            _reviewService.Reject(resource.Ids);
        }

        [RestDeleteById]
        public void DeleteReviewItem(int id)
        {
            _reviewService.Delete(id);
        }

        [HttpDelete("bulk")]
        [Consumes("application/json")]
        public void Remove([FromBody] ReviewBulkResource resource)
        {
            if (resource.Ids == null || resource.Ids.Count == 0)
            {
                throw new BadRequestException("ids must be provided");
            }

            _reviewService.Delete(resource.Ids);
        }

        [NonAction]
        public void Handle(ReviewQueueUpdatedEvent message)
        {
            BroadcastResourceChange(ModelAction.Sync);
        }

        private static Quality GetQuality(int? qualityId, string qualityName)
        {
            if (qualityId.HasValue)
            {
                var byId = Quality.All.FirstOrDefault(q => q.Id == qualityId.Value);

                return byId ?? throw new BadRequestException($"Unknown quality id {qualityId}");
            }

            if (qualityName.IsNotNullOrWhiteSpace())
            {
                var byName = Quality.All.FirstOrDefault(q => q.Name.Equals(qualityName, StringComparison.OrdinalIgnoreCase));

                return byName ?? throw new BadRequestException($"Unknown quality '{qualityName}'");
            }

            return null;
        }

        private record ApproveRequest(int Id, int? MovieId, string ForeignId, bool ManualMatch, Quality Quality);

        private IReadOnlyDictionary<int, Movie> GetMovies(IEnumerable<ReviewItem> items)
        {
            var ids = items.SelectMany(i => i.CandidateMovieIds).Distinct().ToList();

            if (ids.Empty())
            {
                return new Dictionary<int, Movie>();
            }

            return (_movieService.FindByIds(ids) ?? new List<Movie>()).ToDictionary(m => m.Id);
        }
    }
}
