using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using DryIoc.ImTools;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Datastore.Events;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Movies.Studios.Events;
using NzbDrone.Core.MovieStats;
using NzbDrone.SignalR;
using Whisparr.Api.V3.Movies;
using Whisparr.Http;
using Whisparr.Http.Extensions;
using Whisparr.Http.REST;
using Whisparr.Http.REST.Attributes;

namespace Whisparr.Api.V3.Studios
{
    [V3ApiController]
    public class StudioController : RestControllerWithSignalR<StudioResource, Studio>, IHandle<StudioUpdatedEvent>
    {
        private static readonly HashSet<string> _allowedStudioSortKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "title",
                "sortTitle",
                "status",
                "qualityProfileId",
                "rootFolderPath",
                "totalMovieCount",
                "totalSceneCount",
                "sizeOnDisk"
            };

        private readonly IStudioService _studioService;
        private readonly IAddStudioService _addStudioService;
        private readonly IMapCoversToLocal _coverMapper;
        private readonly IMovieService _moviesService;
        private readonly IMovieStatisticsService _movieStatisticsService;
        private readonly IImportListExclusionService _exclusionService;
        private readonly ICached<StudioResource> _studioResourceCache;
        private readonly bool _useCache;
        private readonly Logger _logger;

        public StudioController(IStudioService studioService,
                                IAddStudioService addStudioService,
                                IMapCoversToLocal coverMapper,
                                IMovieService moviesService,
                                IMovieStatisticsService movieStatisticsService,
                                IImportListExclusionService exclusionService,
                                ICacheManager cacheManager,
                                IConfigService configService,
                                Logger logger,
                                IBroadcastSignalRMessage signalRBroadcaster)
        : base(signalRBroadcaster)
        {
            _studioService = studioService;
            _addStudioService = addStudioService;
            _coverMapper = coverMapper;
            _moviesService = moviesService;
            _movieStatisticsService = movieStatisticsService;
            _exclusionService = exclusionService;
            _useCache = configService.WhisparrCacheStudioAPI;
            _studioResourceCache = cacheManager.GetCache<StudioResource>(typeof(StudioResource), "studioResources");
            _logger = logger;

            if (configService.WhisparrMovieMetadataSource == MovieMetadataType.TMDB)
            {
                SharedValidator.RuleFor(s => s.MoviesMonitored)
                    .Must((s, monitored) => !monitored || s.TmdbId > 0)
                    .WithMessage("Requires a TMDB link to be added to the Studio on StashDB.org");
            }

            if (configService.WhisparrMovieMetadataSource == MovieMetadataType.TPDB)
            {
                SharedValidator.RuleFor(s => s.MoviesMonitored)
                    .Must((s, monitored) => !monitored || !string.IsNullOrWhiteSpace(s.TpdbId))
                    .WithMessage("Requires a TPDB link to be added to the Studio on StashDB.org");
            }
        }

        protected StudioResource MapToResource(Studio studio)
        {
            var resource = studio.ToResource();

            MapCoversToLocal(studio);

            return resource;
        }

        protected override StudioResource GetResourceById(int id)
        {
            var resource = MapToResource(_studioService.GetById(id));

            FetchAndLinkMovies(resource);

            return resource;
        }

        /// <summary>Retrieves a single studio by their external foreign ID (e.g., from StashDb)</summary>
        /// <returns>Studio details with associated movies and local cover URLs</returns>
        /// <response code="200">Studio found and returned</response>
        /// <response code="404">Studio with the specified foreign ID not found</response>
        [HttpGet("{studioForeignId}")]
        [Produces("application/json")]
        public ActionResult<StudioResource> GetStudioByForeignId(string studioForeignId)
        {
            var studioResource = GetCachedStudioResource(studioForeignId);
            if (studioResource == null || studioResource.ForeignId != studioForeignId)
            {
                return NotFound();
            }

            return studioResource;
        }

        /// <summary>Retrieves all movies associated with a studio by their external foreign ID (e.g., from StashDb)</summary>
        /// <returns>List of movies associated with the studio</returns>
        /// <response code="200">Movies found and returned</response>
        /// <response code="404">Studio with the specified foreign ID not found</response>
        [HttpGet("{studioForeignId}/works")]
        public ActionResult<List<MovieResource>> GetMoviesByStudioForeignId(string studioForeignId)
        {
            var studio = GetCachedStudioResource(studioForeignId);
            if (studio == null || studio.ForeignId != studioForeignId)
            {
                return NotFound();
            }

            var movies = _moviesService.GetByStudioForeignId(studioForeignId);
            var movieResources = movies
                .Select(m => MovieResourceMapper.ToResource(m, 0))
                .Where(r => r != null)
                .ToList();

            var movieIds = movieResources.Select(r => r.Id).ToList();
            var movieStats = _movieStatisticsService.MovieStatistics(movieIds);
            foreach (var resource in movieResources)
            {
                var stats = movieStats.FirstOrDefault(s => s.MovieId == resource.Id);
                if (stats != null)
                {
                    resource.SizeOnDisk = stats.SizeOnDisk;
                    resource.HasFile = stats.SizeOnDisk > 0;
                }
            }

            return movieResources;
        }

        /// <summary>Retrieves a paged list of studios with advanced filtering options</summary>
        /// <param name="request">Paging and filtering parameters</param>
        /// <returns>Paged list of studios matching the specified criteria</returns>
        [HttpPost("paged")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<PagingResource<StudioResource>> GetStudiosPagedPost([FromBody] StudioPagingRequestResource request)
        {
            if (request == null)
            {
                _logger.Error("Paged studio request is null. Check the request body and route.");
                return BadRequest("Request body is null or invalid.");
            }

            var pagingResource = new PagingResource<StudioResource>(request);
            var pageSpec = pagingResource.MapToPagingSpec<StudioResource, Studio>(
                _allowedStudioSortKeys,
                "sortTitle",
                SortDirection.Ascending);

            // Get file info once for bulk operation
            var coverFileInfos = _coverMapper.GetStudioCoverFileInfos();

            return pageSpec.ApplyToPage(_studioService.Paged, studio =>
            {
                var studioResource = studio.ToResource();
                _coverMapper.ConvertToLocalStudioUrls(studioResource.Id, studioResource.Images, coverFileInfos);
                FetchAndLinkMovies(studioResource);
                return studioResource;
            });
        }

        [HttpGet]
        public List<StudioResource> GetStudios(string stashId)
        {
            var studioResources = new List<StudioResource>();

            if (_useCache)
            {
                if (stashId.IsNotNullOrWhiteSpace())
                {
                    studioResources.AddIfNotNull(GetStudioResource(stashId));
                }
                else
                {
                    studioResources = GetStudioResources();
                }
            }
            else
            {
                if (stashId.IsNotNullOrWhiteSpace())
                {
                    var studio = _studioService.FindByForeignId(stashId);

                    if (studio != null)
                    {
                        studioResources.AddIfNotNull(MapToResource(studio));
                    }
                }
                else
                {
                    studioResources = _studioService.GetAllStudios().ToResource();
                }

                var coverFileInfos = _coverMapper.GetStudioCoverFileInfos();

                _coverMapper.ConvertToLocalStudioUrls(studioResources.Select(x => Tuple.Create(x.Id, x.Images.AsEnumerable())), coverFileInfos);

                LinkMovies(studioResources);
            }

            return studioResources;
        }

        [RestPostById]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<StudioResource> AddStudio([FromBody] StudioResource studioResource)
        {
            var studio = _addStudioService.AddStudio(studioResource.ToModel());

            return Created(studio.Id);
        }

        [RestPutById]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<StudioResource> Update([FromBody] StudioResource resource)
        {
            var studio = _studioService.GetById(resource.Id);

            var updatedStudio = _studioService.Update(resource.ToModel(studio));

            _studioResourceCache.Remove(updatedStudio.ForeignId);

            return Accepted(updatedStudio);
        }

        [RestDeleteById]
        public void DeleteStudio(int id, bool deleteFiles = false, bool addImportExclusion = false)
        {
            var studio = _studioService.GetById(id);

            if (studio == null)
            {
                return;
            }

            // Get the scenes for the studio
            var scenes = _moviesService.GetByStudioForeignId(studio.ForeignId);
            var sceneIds = scenes.Map(x => x.Id).ToList();
            _moviesService.DeleteMovies(sceneIds, deleteFiles);

            if (addImportExclusion)
            {
                var exclusion = new ImportListExclusion();
                exclusion.ForeignId = studio.ForeignId;
                exclusion.MovieTitle = studio.Title;
                exclusion.Type = ImportExclusionType.Studio;
                exclusion.Reason = ImportExclusionReason.DuringDelete;

                _exclusionService.AddExclusion(exclusion);
            }

            // Remove the studio now that the associated scenes have been removed
            _studioResourceCache.Remove(studio.ForeignId);
            _studioService.RemoveStudio(studio);
        }

        private void MapCoversToLocal(Studio studio)
        {
            _coverMapper.ConvertToLocalStudioUrls(studio.Id, studio.Images);
        }

        [NonAction]
        public void Handle(StudioUpdatedEvent message)
        {
            var resource = MapToResource(message.Studio);

            _studioResourceCache.Remove(resource.ForeignId);
            FetchAndLinkMovies(resource);
            BroadcastResourceChange(ModelAction.Updated, resource);
        }

        private void FetchAndLinkMovies(StudioResource resource)
        {
            LinkMovies(resource, _moviesService.GetByStudioForeignId(resource.ForeignId));
        }

        private void LinkMovies(List<StudioResource> resources)
        {
            foreach (var performer in resources)
            {
                FetchAndLinkMovies(performer);
            }
        }

        private void LinkMovies(StudioResource resource, List<Movie> movies)
        {
            var scenes = movies.Where(x => x.MovieMetadata.Value.ItemType == ItemType.Scene);
            resource.HasScenes = scenes.Any();
            resource.HasMovies = movies.Where(x => x.MovieMetadata.Value.ItemType == ItemType.Movie).Any();

            resource.Years = movies.OrderBy(x => x.Year).Map(x => x.Year).Distinct().ToList();

            resource.MovieCount = movies.Where(x => x.HasFile && x.MovieMetadata.Value.ItemType == ItemType.Movie).Count();
            resource.TotalMovieCount = movies.Where(x => x.MovieMetadata.Value.ItemType == ItemType.Movie).Count();
            resource.SceneCount = movies.Where(x => x.HasFile && x.MovieMetadata.Value.ItemType == ItemType.Scene).Count();
            resource.TotalSceneCount = movies.Where(x => x.MovieMetadata.Value.ItemType == ItemType.Scene).Count();

            var ids = movies.Map(x => x.Id).ToList();
            var movieStats = _movieStatisticsService.MovieStatistics(ids);
            resource.SizeOnDisk = movieStats.Sum(x => x.SizeOnDisk);
        }

        private StudioResource GetCachedStudioResource(string studioForeignId)
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            _logger.Trace($"GetCachedStudioResource: {studioForeignId}");

            var studioResource = _studioResourceCache.Find(studioForeignId);
            if (studioResource != null)
            {
                return studioResource;
            }

            var studio = _studioService.FindByForeignId(studioForeignId);
            if (studio == null)
            {
                return null;
            }

            studioResource = MapToResource(studio);
            var coverFileInfos = _coverMapper.GetStudioCoverFileInfos();
            _coverMapper.ConvertToLocalStudioUrls(studioResource.Id, studioResource.Images);
            FetchAndLinkMovies(studioResource);

            _studioResourceCache.Set(studioForeignId, studioResource);

            if (stopwatch.Elapsed.TotalSeconds > 1)
            {
                _logger.Warn($"Processed studio cache for {studioForeignId} after {stopwatch.Elapsed.TotalSeconds} seconds");
            }

            return studioResource;
        }

        private StudioResource GetStudioResource(string studioForeignId)
        {
            var studioIds = new List<string> { studioForeignId };
            return GetStudioResources(studioIds).FirstOrDefault();
        }

        private List<StudioResource> GetStudioResources()
        {
            var allStudioForeignIds = _studioService.AllStudioForeignIds();
            return GetStudioResources(allStudioForeignIds);
        }

        private List<StudioResource> GetStudioResources(List<string> studioForeignIds)
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            _logger.Trace($"GetStudioResources: {studioForeignIds.Count} studios");

            var studioResources = new List<StudioResource>();

            var missingIds = new List<string>();
            foreach (var id in studioForeignIds)
            {
                var studioResource = _studioResourceCache.Find(id);
                if (studioResource == null)
                {
                    missingIds.Add(id);
                }
                else
                {
                    studioResources.AddIfNotNull(studioResource);
                }
            }

            if (missingIds.Count > 0)
            {
                var releaseLock = false;
                var getIds = new List<string>();

                try
                {
                    _logger.Info($"Caching {missingIds.Count} studios with {_studioResourceCache.Lock.CurrentCount} available threads.");

                    // If there are a large number of missing IDs, acquire the lock to prevent cache stampede
                    if (missingIds.Count > 100)
                    {
                        _studioResourceCache.Lock.Wait();
                        releaseLock = true;
                        if (stopwatch.Elapsed.TotalSeconds > 2)
                        {
                            _logger.Warn($"Locked studio cache for {stopwatch.Elapsed.TotalSeconds} seconds");
                        }

                        // Re-check missing IDs after acquiring the lock
                        foreach (var id in missingIds)
                        {
                            var studioResource = _studioResourceCache.Find(id);
                            if (studioResource == null)
                            {
                                getIds.Add(id);
                            }
                            else
                            {
                                studioResources.AddIfNotNull(studioResource);
                            }
                        }
                    }
                    else
                    {
                        getIds = missingIds;
                    }

                    if (getIds.Count > 0)
                    {
                        var studios = _studioService.FindByForeignIds(getIds);

                        foreach (var studio in studios)
                        {
                            studioResources.AddIfNotNull(MapToResource(studio));
                        }

                        var coverFileInfos = _coverMapper.GetStudioCoverFileInfos();

                        _coverMapper.ConvertToLocalStudioUrls(studioResources.Select(x => Tuple.Create(x.Id, x.Images.AsEnumerable())), coverFileInfos);

                        LinkMovies(studioResources);

                        foreach (var studioResource in studioResources)
                        {
                            _studioResourceCache.Set(studioResource.ForeignId, studioResource);
                        }
                    }
                }
                finally
                {
                    stopwatch.Stop();
                    if (releaseLock)
                    {
                        _studioResourceCache.Lock.Release();
                    }
                }
            }

            if (stopwatch.Elapsed.TotalSeconds > 60)
            {
                _logger.Warn($"Processed studio cache for {studioForeignIds.Count} after {stopwatch.Elapsed.TotalSeconds} seconds");
            }

            return studioResources;
        }
    }
}
