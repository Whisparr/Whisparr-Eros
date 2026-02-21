using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Organizer;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Movies
{
    /// <summary>
    /// Controller that exposes endpoints to lookup movie metadata from external sources
    /// and search for new movies that can be added to the system.
    /// </summary>
    [V3ApiController("movie/lookup")]
    public class MovieLookupController : RestController<MovieResource>
    {
        private readonly ISearchForNewMovie _searchProxy;
        private readonly IProvideMovieInfo _movieInfo;
        private readonly IBuildFileNames _fileNameBuilder;
        private readonly INamingConfigService _namingService;
        private readonly IMapCoversToLocal _coverMapper;
        private readonly IConfigService _configService;
        private readonly IImportListExclusionService _importListExclusionService;
        private readonly IMovieService _movieService;

        /// <summary>
        /// Creates a new instance of <see cref="MovieLookupController"/>.
        /// </summary>
        /// <param name="searchProxy">Search service for finding new movies.</param>
        /// <param name="movieInfo">Provider for movie metadata.</param>
        /// <param name="fileNameBuilder">Filename/folder builder used to compute movie folder names.</param>
        /// <param name="namingService">Service that provides naming configuration.</param>
        /// <param name="coverMapper">Mapper to convert remote cover urls to local urls.</param>
        /// <param name="configService">Application configuration service.</param>
        /// <param name="importListExclusionService">Service for import list exclusions.</param>
        /// <param name="movieService">Service to work with raw Movie objects</param>
        public MovieLookupController(ISearchForNewMovie searchProxy,
                                 IProvideMovieInfo movieInfo,
                                 IBuildFileNames fileNameBuilder,
                                 INamingConfigService namingService,
                                 IMapCoversToLocal coverMapper,
                                 IConfigService configService,
                                 IImportListExclusionService importListExclusionService,
                                 IMovieService movieService)
        {
            _movieInfo = movieInfo;
            _searchProxy = searchProxy;
            _fileNameBuilder = fileNameBuilder;
            _namingService = namingService;
            _coverMapper = coverMapper;
            _configService = configService;
            _importListExclusionService = importListExclusionService;
            _movieService = movieService;
        }

        /// <summary>Not implemented for lookup controller; required by base type.</summary>
        /// <param name="id">The id of the movie resource.</param>
        /// <returns>An <see cref="ActionResult{MovieResource}"/> representing the resource.</returns>
        [NonAction]
        public override ActionResult<MovieResource> GetResourceByIdWithErrorHandler(int id)
        {
            throw new NotImplementedException();
        }

        /// <summary>Not implemented for lookup controller; required by base type.</summary>
        /// <param name="id">The movie id.</param>
        /// <returns>The <see cref="MovieResource"/>.</returns>
        protected override MovieResource GetResourceById(int id)
        {
            throw new NotImplementedException();
        }

        /// <summary>Lookup movie metadata by TMDB id.</summary>
        /// <param name="tmdbId">TMDB identifier.</param>
        /// <returns>A <see cref="MovieResource"/> populated with metadata for the TMDB id.</returns>
        [HttpGet("tmdb")]
        [Produces("application/json")]
        public MovieResource SearchByTmdbId(int tmdbId)
        {
            var availDelay = _configService.AvailabilityDelay;
            var result = new Movie { MovieMetadata = _movieInfo.GetMovieInfo(tmdbId).Item1 };
            return result.ToResource(availDelay);
        }

        /// <summary>Lookup movie metadata by TPDB id.</summary>
        /// <param name="tpdbId">TPDB identifier.</param>
        /// <returns>A <see cref="MovieResource"/> populated with metadata for the TPDB id.</returns>
        [HttpGet("tpdb")]
        [Produces("application/json")]
        public MovieResource SearchByTpdbId(string tpdbId)
        {
            var availDelay = _configService.AvailabilityDelay;
            var result = new Movie { MovieMetadata = _movieInfo.GetTpdbMovieInfo(tpdbId).Item1 };
            return result.ToResource(availDelay);
        }

        /// <summary>Lookup movie metadata by IMDB id.</summary>
        /// <param name="imdbId">IMDB identifier.</param>
        /// <returns>A <see cref="MovieResource"/> populated with metadata for the IMDB id.</returns>
        [HttpGet("imdb")]
        [Produces("application/json")]
        public MovieResource SearchByImdbId(string imdbId)
        {
            var result = new Movie { MovieMetadata = _movieInfo.GetMovieByImdbId(imdbId) };

            var availDelay = _configService.AvailabilityDelay;
            return result.ToResource(availDelay);
        }

        /// <summary>Search for movies by free-text term. Returns candidates suitable for adding.</summary>
        /// <param name="term">Search term (title, partial title, etc.).</param>
        /// <param name="itemType">Optional item type filter.</param>
        /// <returns>Sequence of matching <see cref="MovieResource"/> objects.</returns>
        [HttpGet]
        [Produces("application/json")]
        public IEnumerable<MovieResource> Search([FromQuery] string term, [FromQuery] ItemType? itemType = null)
        {
            var searchResults = new List<Movie>();

            var results = _searchProxy.SearchForNewEntity(term, itemType);

            if (results == null || !results.Any())
            {
                return Enumerable.Empty<MovieResource>();
            }

            foreach (var result in results)
            {
                if (result is Movie)
                {
                    searchResults.Add((Movie)result);
                }
            }

            var resources = MapToResource(searchResults).ToList();
            MapToExistingMovies(resources);
            return resources;
        }

        /// <summary>Marks resources that already exist in the local database by setting
        /// <see cref="MovieResource.IsExisting"/>.</summary>
        /// <param name="resources">Resources to annotate.</param>
        private void MapToExistingMovies(List<MovieResource> resources)
        {
            var matches = _movieService.FindByForeignIds(resources.Select(r => r.ForeignId).ToList());
            foreach (var r in resources)
            {
                if (matches.Any(m => m.ForeignId == r.ForeignId))
                {
                    r.IsExisting = true;
                }
            }
        }

        /// <summary>Maps internal <see cref="Movie"/> instances to API resources, applying cover mapping,
        /// folder name building and import-list exclusion checks.</summary>
        /// <param name="movies">Movies to map.</param>
        /// <returns>Sequence of <see cref="MovieResource"/> objects.</returns>
        private IEnumerable<MovieResource> MapToResource(IEnumerable<Movie> movies)
        {
            var availDelay = _configService.AvailabilityDelay;
            var namingConfig = _namingService.GetConfig();

            var listExclusions = _importListExclusionService.GetAllExclusions();

            foreach (var currentMovie in movies)
            {
                var resource = currentMovie.ToResource(availDelay);

                _coverMapper.ConvertToLocalUrls(resource.Id, resource.Images);

                var poster = currentMovie.MovieMetadata.Value.Poster;
                if (poster != null)
                {
                    resource.RemotePoster = poster.RemoteUrl;
                }

                resource.Folder = _fileNameBuilder.GetMovieFolder(currentMovie, namingConfig);

                resource.IsExcluded = listExclusions.Any(e => string.Equals(e.ForeignId, resource.ForeignId, StringComparison.OrdinalIgnoreCase));

                yield return resource;
            }
        }
    }
}
