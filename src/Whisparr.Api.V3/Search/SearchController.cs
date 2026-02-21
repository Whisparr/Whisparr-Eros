using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Organizer;
using Whisparr.Api.V3.Movies;
using Whisparr.Api.V3.Performers;
using Whisparr.Api.V3.Studios;
using Whisparr.Http;

namespace Whisparr.Api.V3.Search
{
    [V3ApiController("lookup")]
    public class SearchController : Controller
    {
        private readonly ISearchForNewMovie _searchProxy;
        private readonly IBuildFileNames _fileNameBuilder;
        private readonly INamingConfigService _namingService;
        private readonly IMapCoversToLocal _coverMapper;
        private readonly IConfigService _configService;
        private readonly IImportListExclusionService _exclusionService;
        private readonly IMovieService _movieService;

        public SearchController(ISearchForNewMovie searchProxy,
                                IBuildFileNames fileNameBuilder,
                                INamingConfigService namingService,
                                IMapCoversToLocal coverMapper,
                                IConfigService configService,
                                IImportListExclusionService exclusionService,
                                IMovieService movieService)
        {
            _searchProxy = searchProxy;
            _fileNameBuilder = fileNameBuilder;
            _namingService = namingService;
            _coverMapper = coverMapper;
            _configService = configService;
            _exclusionService = exclusionService;
            _movieService = movieService;
        }

        [HttpGet("scene")]
        public object SearchScene([FromQuery] string term)
        {
            var searchResults = _searchProxy.SearchForNewEntity(term, ItemType.Scene);
            var searchResources = MapToResource(searchResults).ToList();
            MapToExistingMovies(searchResources);
            return searchResources;
        }

        [HttpGet("movie")]
        public object SearchMovie([FromQuery] string term)
        {
            var searchResults = _searchProxy.SearchForNewEntity(term, ItemType.Movie);
            var searchResources = MapToResource(searchResults).ToList();
            MapToExistingMovies(searchResources);
            return searchResources;
        }

        [HttpGet("studio")]
        public object SearchStudio([FromQuery] string term)
        {
            var searchResults = _searchProxy.SearchForNewStudio(term);
            return MapToResource(searchResults).ToList();
        }

        [HttpGet("performer")]
        public object SearchPerformer([FromQuery] string term)
        {
            var searchResults = _searchProxy.SearchForNewPerformer(term);
            return MapToResource(searchResults).ToList();
        }

        private void MapToExistingMovies(List<SearchResource> searchResources)
        {
            var matches = _movieService.FindByForeignIds(searchResources.Select(m => m.ForeignId).ToList());
            foreach (var s in searchResources)
            {
                var match = matches.Where(m => m.ForeignId == s.ForeignId);
                if (match.Any())
                {
                    s.isExisting = true;
                }
            }
        }

        private IEnumerable<SearchResource> MapToResource(IEnumerable<object> results)
        {
            var id = 1;
            var availDelay = _configService.AvailabilityDelay;
            var namingConfig = _namingService.GetConfig();
            var exclusions = _exclusionService.GetAllExclusions();

            foreach (var result in results)
            {
                var resource = new SearchResource();
                resource.Id = id++;

                if (result is Movie)
                {
                    var movie = (Movie)result;
                    var movieResource = movie.ToResource(availDelay);

                    _coverMapper.ConvertToLocalUrls(movieResource.Id, movieResource.Images);

                    var poster = movie.MovieMetadata.Value.Poster;
                    if (poster != null)
                    {
                        movieResource.RemotePoster = poster.RemoteUrl;
                    }

                    movieResource.Folder = _fileNameBuilder.GetMovieFolder(movie, namingConfig);
                    resource.Movie = movieResource;

                    // Set IsExcluded to show warning badge in search results
                    resource.Movie.IsExcluded = exclusions.Any(e =>
                        string.Equals(e.ForeignId, resource.Movie.ForeignId, StringComparison.OrdinalIgnoreCase));

                    resource.ForeignId = movie.ForeignId;
                }
                else if (result is Performer)
                {
                    var performer = (Performer)result;
                    var performerResource = performer.ToResource();
                    _coverMapper.ConvertToLocalUrls(performerResource.Id, performerResource.Images);

                    var cover = performer.Images.FirstOrDefault(c => c.CoverType == MediaCoverTypes.Headshot);
                    if (cover != null)
                    {
                        performerResource.RemotePoster = cover.RemoteUrl;
                    }

                    resource.Performer = performerResource;
                    resource.ForeignId = performer.ForeignId;
                }
                else if (result is Studio)
                {
                    var studio = (Studio)result;
                    var studioResource = studio.ToResource();
                    _coverMapper.ConvertToLocalUrls(studioResource.Id, studioResource.Images);

                    var cover = studio.Images.FirstOrDefault();
                    if (cover != null)
                    {
                        studioResource.RemotePoster = cover.RemoteUrl;
                    }

                    resource.Studio = studioResource;
                    resource.ForeignId = studio.ForeignId;
                }
                else
                {
                    throw new NotImplementedException("Bad response from search all proxy");
                }

                yield return resource;
            }
        }
    }
}
