using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.LibrarySearch;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.MovieStats;
using Whisparr.Api.V3.Movies;
using Whisparr.Api.V3.Performers;
using Whisparr.Api.V3.Studios;
using Whisparr.Http;

namespace Whisparr.Api.V3.LibrarySearch
{
    /// <summary>Searches the local library. Nothing here looks anything up remotely or changes state.</summary>
    [V3ApiController("library/search")]
    public class LibrarySearchController : Controller
    {
        private const int MaxPageSize = 100;

        private readonly ILibrarySearchService _librarySearchService;
        private readonly IMovieStatisticsService _movieStatisticsService;
        private readonly IMapCoversToLocal _coverMapper;
        private readonly IConfigService _configService;
        private readonly IUpgradableSpecification _qualityUpgradableSpecification;

        public LibrarySearchController(ILibrarySearchService librarySearchService,
                                       IMovieStatisticsService movieStatisticsService,
                                       IMapCoversToLocal coverMapper,
                                       IConfigService configService,
                                       IUpgradableSpecification qualityUpgradableSpecification)
        {
            _librarySearchService = librarySearchService;
            _movieStatisticsService = movieStatisticsService;
            _coverMapper = coverMapper;
            _configService = configService;
            _qualityUpgradableSpecification = qualityUpgradableSpecification;
        }

        /// <summary>The best matches of each type, with the total number of matches for each.</summary>
        /// <param name="term">The search text, matched against clean titles and names (or an exact foreign ID)</param>
        /// <param name="limit">How many matches to return for each type</param>
        [HttpGet]
        [Produces("application/json")]
        public LibrarySearchResource Search([FromQuery] string term, [FromQuery] int limit = 4)
        {
            var result = _librarySearchService.Search(term, Math.Clamp(limit, 1, MaxPageSize));

            return new LibrarySearchResource
            {
                Performers = ToSection(result.Performers, MapPerformers),
                Studios = ToSection(result.Studios, MapStudios),
                Scenes = ToSection(result.Scenes, MapMovies),
                Movies = ToSection(result.Movies, MapMovies)
            };
        }

        /// <summary>A page of matching scenes.</summary>
        [HttpGet("scene")]
        [Produces("application/json")]
        public PagingResource<MovieResource> SearchScenes([FromQuery] string term, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            return ToPage(_librarySearchService.SearchMovies(term, ItemType.Scene, page, ClampPageSize(pageSize)), page, pageSize, MapMovies);
        }

        /// <summary>A page of matching movies.</summary>
        [HttpGet("movie")]
        [Produces("application/json")]
        public PagingResource<MovieResource> SearchMovies([FromQuery] string term, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            return ToPage(_librarySearchService.SearchMovies(term, ItemType.Movie, page, ClampPageSize(pageSize)), page, pageSize, MapMovies);
        }

        /// <summary>A page of matching performers.</summary>
        [HttpGet("performer")]
        [Produces("application/json")]
        public PagingResource<PerformerResource> SearchPerformers([FromQuery] string term, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            return ToPage(_librarySearchService.SearchPerformers(term, page, ClampPageSize(pageSize)), page, pageSize, MapPerformers);
        }

        /// <summary>A page of matching studios.</summary>
        [HttpGet("studio")]
        [Produces("application/json")]
        public PagingResource<StudioResource> SearchStudios([FromQuery] string term, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            return ToPage(_librarySearchService.SearchStudios(term, page, ClampPageSize(pageSize)), page, pageSize, MapStudios);
        }

        private static int ClampPageSize(int pageSize) => Math.Clamp(pageSize, 1, MaxPageSize);

        private static LibrarySearchSectionResource<TResource> ToSection<TModel, TResource>(LibrarySearchPage<TModel> page, Func<List<TModel>, List<TResource>> map)
        {
            return new LibrarySearchSectionResource<TResource>
            {
                TotalRecords = page.TotalRecords,
                Records = map(page.Records)
            };
        }

        private static PagingResource<TResource> ToPage<TModel, TResource>(LibrarySearchPage<TModel> result, int page, int pageSize, Func<List<TModel>, List<TResource>> map)
        {
            return new PagingResource<TResource>
            {
                Page = Math.Max(page, 1),
                PageSize = ClampPageSize(pageSize),
                TotalRecords = result.TotalRecords,
                Records = map(result.Records)
            };
        }

        private List<MovieResource> MapMovies(List<Movie> movies)
        {
            var availDelay = _configService.AvailabilityDelay;
            var stats = _movieStatisticsService.MovieStatistics(movies.Select(m => m.Id).ToList()).ToDictionary(s => s.MovieId);
            var resources = movies.Select(m => m.ToResource(availDelay, _qualityUpgradableSpecification)).ToList();

            foreach (var resource in resources)
            {
                if (stats.TryGetValue(resource.Id, out var stat))
                {
                    resource.Statistics = stat.ToResource();
                    resource.HasFile = stat.MovieFileCount > 0;
                    resource.SizeOnDisk = stat.SizeOnDisk;
                }

                _coverMapper.ConvertToLocalUrls(resource.Id, resource.Images, resource.Added);
            }

            return resources;
        }

        private List<PerformerResource> MapPerformers(List<Performer> performers)
        {
            return performers.Select(p =>
            {
                var resource = p.ToResource();
                _coverMapper.ConvertToLocalPerformerUrls(resource.Id, resource.Images, resource.Added);
                return resource;
            }).ToList();
        }

        private List<StudioResource> MapStudios(List<Studio> studios)
        {
            return studios.Select(s =>
            {
                var resource = s.ToResource();
                _coverMapper.ConvertToLocalStudioUrls(resource.Id, resource.Images);
                return resource;
            }).ToList();
        }
    }
}
