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
            if (resource.Ids == null || resource.Ids.Count == 0)
            {
                throw new BadRequestException("ids must be provided");
            }

            if (resource.MovieId.HasValue && resource.Ids.Count > 1)
            {
                throw new BadRequestException("movieId can only be given when approving a single release");
            }

            var quality = GetQuality(resource);
            var result = new ReviewActionResultResource();

            // A grab only shows in the queue once the download client reports it, so a batch keeps its own tally
            var grabbedMovieIds = new HashSet<int>();

            foreach (var id in resource.Ids.Distinct())
            {
                // A single release reports why it couldn't be grabbed as the response, a bulk approval carries on and lists the failures
                if (resource.Ids.Count == 1)
                {
                    await _reviewService.Approve(id, resource.MovieId, quality);
                    result.Approved.Add(id);

                    continue;
                }

                try
                {
                    var item = _reviewService.Get(id);

                    if (!grabbedMovieIds.Add(item.MovieId))
                    {
                        result.Failed.Add(new ReviewActionFailureResource { Id = id, Message = $"Another selected release was already grabbed for the scene of '{item.Title}'" });
                        continue;
                    }

                    await _reviewService.Approve(id, resource.MovieId, quality);
                    result.Approved.Add(id);
                }
                catch (Exception ex)
                {
                    result.Failed.Add(new ReviewActionFailureResource { Id = id, Message = ex.Message });
                }
            }

            return result;
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

        private static Quality GetQuality(ReviewApproveResource resource)
        {
            if (resource.QualityId.HasValue)
            {
                var byId = Quality.All.FirstOrDefault(q => q.Id == resource.QualityId.Value);

                return byId ?? throw new BadRequestException($"Unknown quality id {resource.QualityId}");
            }

            if (resource.Quality.IsNotNullOrWhiteSpace())
            {
                var byName = Quality.All.FirstOrDefault(q => q.Name.Equals(resource.Quality, StringComparison.OrdinalIgnoreCase));

                return byName ?? throw new BadRequestException($"Unknown quality '{resource.Quality}'");
            }

            return null;
        }

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
