using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.Download;
using NzbDrone.Core.History;
using NzbDrone.Core.Movies;
using Whisparr.Api.V3.Movies;
using Whisparr.Http;
using Whisparr.Http.Extensions;

namespace Whisparr.Api.V3.History
{
    [V3ApiController]
    public class HistoryController : Controller
    {
        private readonly IHistoryService _historyService;
        private readonly IMovieService _movieService;
        private readonly ICustomFormatCalculationService _formatCalculator;
        private readonly IUpgradableSpecification _upgradableSpecification;
        private readonly IFailedDownloadService _failedDownloadService;

        public HistoryController(IHistoryService historyService,
                             IMovieService movieService,
                             ICustomFormatCalculationService formatCalculator,
                             IUpgradableSpecification upgradableSpecification,
                             IFailedDownloadService failedDownloadService)
        {
            _historyService = historyService;
            _movieService = movieService;
            _formatCalculator = formatCalculator;
            _upgradableSpecification = upgradableSpecification;
            _failedDownloadService = failedDownloadService;
        }

        protected HistoryResource MapToResource(MovieHistory model, bool includeMovie)
        {
            if (model.Movie == null)
            {
                model.Movie = _movieService.GetMovie(model.MovieId);
            }

            var resource = model.ToResource(_formatCalculator);

            if (includeMovie)
            {
                resource.Movie = model.Movie.ToResource(0);
            }

            if (model.Movie != null)
            {
                resource.QualityCutoffNotMet = _upgradableSpecification.QualityCutoffNotMet(model.Movie.QualityProfile, model.Quality);
            }

            return resource;
        }

        [HttpGet]
        [Produces("application/json")]
        public PagingResource<HistoryResource> GetHistory([FromQuery] PagingRequestResource paging, bool includeMovie, [FromQuery(Name = "eventType")] int[] eventTypes, string downloadId, [FromQuery] int[] movieIds = null, [FromQuery] int[] languages = null, [FromQuery] int[] quality = null)
        {
            var pagingResource = new PagingResource<HistoryResource>(paging);
            var pagingSpec = pagingResource.MapToPagingSpec<HistoryResource, MovieHistory>(
                new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "date",
                    "languages",
                    "movieMetadata.sortTitle",
                    "quality"
                },
                "date",
                SortDirection.Descending);

            if (eventTypes != null && eventTypes.Any())
            {
                pagingSpec.FilterExpressions.Add(BuildOrEventTypeFilter(eventTypes));
            }

            if (downloadId.IsNotNullOrWhiteSpace())
            {
                pagingSpec.FilterExpressions.Add(h => h.DownloadId == downloadId);
            }

            if (movieIds != null && movieIds.Any())
            {
                pagingSpec.FilterExpressions.Add(BuildOrMovieIdFilter(movieIds));
            }

            return pagingSpec.ApplyToPage(h => _historyService.Paged(pagingSpec, languages, quality), h => MapToResource(h, includeMovie));
        }

        // Helper methods for OR-ed filter expressions
        private static Expression<Func<MovieHistory, bool>> BuildOrEventTypeFilter(int[] eventTypes)
        {
            var param = Expression.Parameter(typeof(MovieHistory), "v");
            Expression body = null;
            foreach (var eventType in eventTypes)
            {
                var left = Expression.Convert(Expression.Property(param, "EventType"), typeof(int));
                var right = Expression.Constant(eventType);
                var eq = Expression.Equal(left, right);
                body = body == null ? eq : Expression.OrElse(body, eq);
            }

            if (body == null)
            {
                body = Expression.Constant(true);
            }

            return Expression.Lambda<Func<MovieHistory, bool>>(body, param);
        }

        private static Expression<Func<MovieHistory, bool>> BuildOrMovieIdFilter(int[] movieIds)
        {
            var param = Expression.Parameter(typeof(MovieHistory), "h");
            Expression body = null;
            foreach (var movieId in movieIds)
            {
                var left = Expression.Property(param, "MovieId");
                var right = Expression.Constant(movieId);
                var eq = Expression.Equal(left, right);
                body = body == null ? eq : Expression.OrElse(body, eq);
            }

            if (body == null)
            {
                body = Expression.Constant(true);
            }

            return Expression.Lambda<Func<MovieHistory, bool>>(body, param);
        }

        [HttpGet("since")]
        [Produces("application/json")]
        public List<HistoryResource> GetHistorySince(DateTime date, MovieHistoryEventType? eventType = null, bool includeMovie = false)
        {
            return _historyService.Since(date, eventType).Select(h => MapToResource(h, includeMovie)).ToList();
        }

        [HttpGet("movie")]
        [Produces("application/json")]
        public List<HistoryResource> GetMovieHistory(int movieId, MovieHistoryEventType? eventType = null, bool includeMovie = false)
        {
            return _historyService.GetByMovieId(movieId, eventType).Select(h => MapToResource(h, includeMovie)).ToList();
        }

        [HttpPost("failed/{id}")]
        public object MarkAsFailed([FromRoute] int id)
        {
            _failedDownloadService.MarkAsFailed(id);
            return new { };
        }
    }
}
