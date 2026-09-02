using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;
using NzbDrone.Core.MovieStats;
using NzbDrone.SignalR;
using Whisparr.Api.V3.Movies;
using Whisparr.Http;
using Whisparr.Http.Extensions;

namespace Whisparr.Api.V3.Wanted
{
    [V3ApiController("wanted/cutoff")]
    public class CutoffController : MovieControllerWithSignalR
    {
        private readonly IMovieCutoffService _movieCutoffService;

        public CutoffController(IMovieCutoffService movieCutoffService,
                            IMovieService movieService,
                            IMovieStatisticsService movieStatisticsService,
                            IUpgradableSpecification upgradableSpecification,
                            ICustomFormatCalculationService formatCalculator,
                            IConfigService configService,
                            IMapCoversToLocal coverMapper,
                            IBroadcastSignalRMessage signalRBroadcaster)
            : base(movieService, movieStatisticsService, upgradableSpecification, formatCalculator, configService, coverMapper, signalRBroadcaster)
        {
            _movieCutoffService = movieCutoffService;
        }

        [NonAction]
        public override ActionResult<MovieResource> GetResourceByIdWithErrorHandler(int id)
        {
            throw new NotImplementedException();
        }

        [HttpGet]
        [Produces("application/json")]
        public PagingResource<MovieResource> GetCutoffUnmetMovies([FromQuery] PagingRequestResource paging, bool monitored = true, [FromQuery] List<int> movieIds = null, [FromQuery] List<int> qualityProfileIds = null, [FromQuery] List<int> movieTags = null, [FromQuery] List<int> quality = null)
        {
            var pagingResource = new PagingResource<MovieResource>(paging);
            var pagingSpec = pagingResource.MapToPagingSpec<MovieResource, Movie>(
                new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "movieMetadata.sortTitle",
                    "movieMetadata.year",
                    "movieMetadata.releaseDate",
                    "movies.lastSearchTime"
                },
                "movieMetadata.sortTitle",
                SortDirection.Ascending);

            pagingSpec.FilterExpressions.Add(v => v.Monitored == monitored);

            if (movieIds?.Any() == true)
            {
                pagingSpec.FilterExpressions.Add(m => movieIds.Contains(m.Id));
            }

            if (qualityProfileIds?.Any() == true)
            {
                pagingSpec.FilterExpressions.Add(m => qualityProfileIds.Contains(m.QualityProfileId));
            }

            var tags = movieTags?.Any() == true ? new HashSet<int>(movieTags) : null;

            var resource = pagingSpec.ApplyToPage(spec => _movieCutoffService.MoviesWhereCutoffUnmet(spec, tags, quality), v => MapToResource(v));

            return resource;
        }
    }
}
