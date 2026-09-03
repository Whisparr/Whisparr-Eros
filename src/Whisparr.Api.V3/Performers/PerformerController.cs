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
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Performers.Events;
using NzbDrone.Core.MovieStats;
using NzbDrone.Core.Validation;
using NzbDrone.Core.Validation.Paths;
using NzbDrone.SignalR;
using Whisparr.Api.V3.Movies;
using Whisparr.Api.V3.Performers.Helpers;
using Whisparr.Http;
using Whisparr.Http.Extensions;
using Whisparr.Http.REST;
using Whisparr.Http.REST.Attributes;

namespace Whisparr.Api.V3.Performers
{
    /// <summary>Controller for managing performers in Whisparr</summary>
    [V3ApiController]
    public class PerformerController : RestControllerWithSignalR<PerformerResource, Performer>, IHandle<PerformerUpdatedEvent>, IHandle<PerformersDeletedEvent>
    {
        private static readonly HashSet<string> _allowedPerformerSortKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "age",
                "careerStart",
                "careerEnd",
                "country",
                "status",
                "sortName",
                "gender",
                "hairColor",
                "ethnicity",
                "qualityProfileId",
                "rootFolderPath",
                "totalMovieCount",
                "totalSceneCount",
                "sizeOnDisk"
            };
        private readonly IPerformerService _performerService;
        private readonly IAddPerformerService _addPerformerService;
        private readonly IMapCoversToLocal _coverMapper;
        private readonly IMovieService _moviesService;
        private readonly IMovieStatisticsService _movieStatisticsService;
        private readonly IImportListExclusionService _exclusionService;
        private readonly IConfigService _configService;
        private readonly bool _useCache;
        private readonly ICached<PerformerResource> _performerResourceCache;
        private readonly Logger _logger;

        public PerformerController(IPerformerService performerService,
                                   IAddPerformerService addPerformerService,
                                   IMapCoversToLocal coverMapper,
                                   IMovieService moviesService,
                                   IMovieStatisticsService movieStatisticsService,
                                   IImportListExclusionService exclusionService,
                                   ICacheManager cacheManager,
                                   IConfigService configService,
                                   QualityProfileExistsValidator<PerformerResource> qualityProfileExistsValidator,
                                   RootFolderExistsValidator<PerformerResource> rootFolderExistsValidator,
                                   Logger logger,
                                   IBroadcastSignalRMessage signalRBroadcaster)
        : base(signalRBroadcaster)
        {
            _performerService = performerService;
            _addPerformerService = addPerformerService;
            _configService = configService;
            _coverMapper = coverMapper;
            _moviesService = moviesService;
            _movieStatisticsService = movieStatisticsService;
            _exclusionService = exclusionService;
            _useCache = _configService.WhisparrCachePerformerAPI;
            _performerResourceCache = cacheManager.GetCache<PerformerResource>(typeof(PerformerResource), "performerResources");
            _logger = logger;

            SharedValidator.RuleFor(s => s.QualityProfileId).Cascade(CascadeMode.Stop)
                .ValidId()
                .SetValidator(qualityProfileExistsValidator);

            SharedValidator.RuleFor(s => s.RootFolderPath).Cascade(CascadeMode.Stop)
                .IsValidPath()
                .SetValidator(rootFolderExistsValidator)
                .When(s => s.RootFolderPath.IsNotNullOrWhiteSpace());

            if (configService.WhisparrMovieMetadataSource == MovieMetadataType.TMDB)
            {
                SharedValidator.RuleFor(s => s.MoviesMonitored)
                    .Must((s, monitored) => !monitored || s.TmdbId > 0)
                    .WithMessage("Requires a TMDB link to be added to the Performer on StashDB.org");
            }

            if (configService.WhisparrMovieMetadataSource == MovieMetadataType.TPDB)
            {
                SharedValidator.RuleFor(s => s.MoviesMonitored)
                    .Must((s, monitored) => !monitored || !string.IsNullOrWhiteSpace(s.TpdbId))
                    .WithMessage("Requires a TPDB link to be added to the Performer on StashDB.org");
            }
        }

        /// <summary>Retrieves a performer by their Whisparr (local)internal ID</summary>
        /// <param name="id">The internal ID of the performer</param>
        /// <returns>Performer details with associated movies and local cover URLs</returns>
        /// <response code="200">Performer found and returned</response>
        /// <response code="404">Performer with the specified ID not found</response>
        [HttpGet("{id:int}")]
        [Produces("application/json")]
        protected override PerformerResource GetResourceById(int id)
        {
            var resource = _performerService.GetById(id).ToResource();

            _coverMapper.ConvertToLocalPerformerUrls(resource.Id, resource.Images);

            return resource;
        }

        /// <summary>Retrieves a single performer by their external foreign ID (e.g., from StashDb)</summary>
        /// <returns>Performer details with associated movies and local cover URLs</returns>
        /// <response code="200">Performer found and returned</response>
        /// <response code="404">Performer with the specified foreign ID not found</response>
        [HttpGet("{performerForeignId}")]
        [Produces("application/json")]
        public ActionResult<PerformerResource> GetPerformerByForeignId(string performerForeignId)
        {
            var performerResource = GetCachedPerformerResource(performerForeignId);
            if (performerResource == null || performerResource.ForeignId != performerForeignId)
            {
                return NotFound();
            }

            return performerResource;
        }

        /// <summary>Retrieves a list of performers by their external foreign ID (e.g., from StashDb)</summary>
        /// <returns>Performer details</returns>
        /// <remarks>If a foreign Id does not exist in Whisparr, it does not query StashDB on demand</remarks>
        /// <response code="200">Performers found and returned, or an empty array</response>
        [HttpPost("list")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<PerformerResource> GetPerformerByForeignIds([FromBody] List<string> performerForeignIds)
        {
            var performerResources = GetCachedPerformerResources(performerForeignIds);
            if (performerResources == null || !performerResources.Any())
            {
                return Ok(new List<PerformerResource>());
            }

            return Ok(performerResources);
        }

        /// <summary>Retrieves all movies associated with a performer by their external foreign ID (e.g., from StashDb)</summary>
        /// <returns>List of movies associated with the performer</returns>
        /// <response code="200">Movies found and returned</response>
        /// <response code="404">Performer with the specified foreign ID not found</response>
        [HttpGet("{performerForeignId}/works")]
        public ActionResult<List<MovieResource>> GetMoviesByPerformerForeignId(string performerForeignId)
        {
            var performer = GetCachedPerformerResource(performerForeignId);
            if (performer == null || performer.ForeignId != performerForeignId)
            {
                return NotFound();
            }

            var movies = _moviesService.GetByPerformerForeignId(performerForeignId);
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

            var coverFileInfos = _coverMapper.GetMovieCoverFileInfos();
            _coverMapper.ConvertToLocalUrls(
                movieResources.Select(x => Tuple.Create(x.Id, x.Images.AsEnumerable())),
                coverFileInfos);

            return movieResources;
        }

        /// <summary>Retrieves full list of performers</summary>
        /// <returns>Performer details with associated movies and local cover URLs</returns>
        /// <response code="200">Performer found and returned</response>
        /// <response code="404">Performer with the specified foreign ID not found</response>
        [HttpGet]
        [Produces("application/json")]
        public List<PerformerResource> GetPerformers()
        {
            var performerResources = new List<PerformerResource>();

            if (_useCache)
            {
                performerResources = GetPerformerResources();
                return performerResources;
            }
            else
            {
                performerResources = _performerService.GetAllPerformers().ToResource();
            }

            var coverFileInfos = _coverMapper.GetPerformerCoverFileInfos();

            _coverMapper.ConvertToLocalPerformerUrls(performerResources.Select(x => Tuple.Create(x.Id, x.Images.AsEnumerable())), coverFileInfos);

            return performerResources;
        }

        /// <summary>Adds a new performer to Whisparr</summary>
        /// <param name="performerResource">The performer details to add</param>
        /// <returns>The newly added performer details</returns>
        /// <response code="201">Performer successfully added</response>
        /// <response code="400">Invalid performer details provided</response>
        [RestPostById]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<PerformerResource> AddPerformer([FromBody] PerformerResource performerResource)
        {
            var performer = _addPerformerService.AddPerformer(performerResource.ToModel());

            return Created(performer.Id);
        }

        /// <summary>Updates an existing performer in Whisparr</summary>
        /// <param name="resource">The performer details to update</param>
        /// <returns>The updated performer details</returns>
        /// <response code="202">Performer successfully updated</response>
        /// <response code="400">Invalid performer details provided</response>
        /// <response code="404">Performer with the specified ID not found</response>
        [RestPutById]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<PerformerResource> Update([FromBody] PerformerResource resource)
        {
            var performer = _performerService.GetById(resource.Id);

            var updatedPerformer = _performerService.Update(resource.ToModel(performer));
            _performerResourceCache.Remove(updatedPerformer.ForeignId);
            var performerResource = updatedPerformer.ToResource();

            return Accepted(performerResource);
        }

        /// <summary>Deletes a performer and their associated movies/scenes from Whisparr</summary>
        /// <param name="id">The internal ID of the performer to delete</param>
        /// <param name="deleteFiles">If true, associated movie/scene files will also be deleted from disk</param>
        /// <param name="addImportExclusion">If true, an import exclusion will be added to prevent re-adding the performer in future imports</param>
        [RestDeleteById]
        public void DeletePerformer(int id, bool deleteFiles = false, bool addImportExclusion = false)
        {
            var performer = _performerService.GetById(id);

            if (performer == null)
            {
                return;
            }

            // Get the scenes for the performer
            var scenes = _moviesService.GetByPerformerForeignId(performer.ForeignId);
            var sceneIds = scenes.Map(x => x.Id).ToList();
            _moviesService.DeleteMovies(sceneIds, deleteFiles);

            if (addImportExclusion)
            {
                var exclusion = new ImportListExclusion();
                exclusion.ForeignId = performer.ForeignId;
                exclusion.MovieTitle = performer.Name;
                exclusion.Type = ImportExclusionType.Performer;
                exclusion.Reason = ImportExclusionReason.DuringDelete;

                _exclusionService.AddExclusion(exclusion);
            }

            // Remove the performer now that the associated scenes have been removed
            _performerService.RemovePerformer(performer);
        }

        /// <summary>Handles performer updated events to broadcast changes via SignalR</summary>
        [NonAction]
        public void Handle(PerformerUpdatedEvent message)
        {
            var resource = MapToResource(message.Performer);

            // PerformerService fills the counts in on its own IHandle for this event, but
            // neither handler is ordered, so it may not have run yet. Link the movies here
            // so the broadcast never zeroes the counts out in the client's cache.
            FetchAndLinkMovies(resource);

            BroadcastResourceChange(ModelAction.Updated, resource);
        }

        [NonAction]
        public void Handle(PerformersDeletedEvent message)
        {
            if (message?.Performers == null || !message.Performers.Any())
            {
                return;
            }

            message.Performers
                .Where(p => !string.IsNullOrWhiteSpace(p.ForeignId))
                .ToList()
                .ForEach(p => _performerResourceCache.Remove(p.ForeignId));

            BroadcastResourceChangeBatch(
                ModelAction.Deleted,
                message.Performers.Select(performer => new PerformerResource
                {
                    Id = performer.Id,
                    ForeignId = performer.ForeignId
                }));
        }

        private PerformerResource GetCachedPerformerResource(string performerForeignId)
        {
            var performerResource = _performerResourceCache.Find(performerForeignId);
            if (performerResource != null)
            {
                return performerResource;
            }

            var performer = _performerService.FindByForeignId(performerForeignId);
            if (performer == null)
            {
                return null;
            }

            performerResource = performer.ToResource();
            _coverMapper.ConvertToLocalPerformerUrls(performerResource.Id, performerResource.Images);
            _performerResourceCache.Set(performerForeignId, performerResource);

            return performerResource;
        }

        private List<PerformerResource> GetCachedPerformerResources(List<string> performerForeignIds)
        {
            var performerResources = new List<PerformerResource>();
            foreach (var id in performerForeignIds)
            {
                var performerResource = _performerResourceCache.Find(id);
                if (performerResource == null)
                {
                    var performer = _performerService.FindByForeignId(id);
                    if (performer == null)
                    {
                        continue;
                    }

                    performerResource = performer.ToResource();
                    _coverMapper.ConvertToLocalPerformerUrls(performerResource.Id, performerResource.Images);
                    _performerResourceCache.Set(id, performerResource);
                }

                performerResources.Add(performerResource);
            }

            return performerResources;
        }

        private void FetchAndLinkMovies(PerformerResource resource)
        {
            var movies = _moviesService.GetByPerformerForeignId(resource.ForeignId);
            var movieStats = _movieStatisticsService.MovieStatistics(movies.Select(x => x.Id).ToList());

            resource.MovieCount = movieStats
                .Where(stat => movies.Any(m => m.Id == stat.MovieId && m.MovieMetadata.Value.ItemType == ItemType.Movie))
                .Sum(stat => stat.MovieFileCount);
            resource.SceneCount = movieStats
                .Where(stat => movies.Any(m => m.Id == stat.MovieId && m.MovieMetadata.Value.ItemType == ItemType.Scene))
                .Sum(stat => stat.MovieFileCount);
            resource.TotalMovieCount = movies.Count(x => x.MovieMetadata.Value.ItemType == ItemType.Movie);
            resource.TotalSceneCount = movies.Count(x => x.MovieMetadata.Value.ItemType == ItemType.Scene);
            resource.SizeOnDisk = movieStats.Sum(x => x.SizeOnDisk);
        }

        private PerformerResource MapToResource(Performer performer)
        {
            var resource = performer.ToResource();
            _coverMapper.ConvertToLocalPerformerUrls(resource.Id, resource.Images);
            return resource;
        }

        private List<PerformerResource> GetPerformerResources()
        {
            var allPerformerForeignIds = _performerService.AllPerformerForeignIds();
            return GetPerformerResources(allPerformerForeignIds);
        }

        private List<PerformerResource> GetPerformerResources(List<string> performerForeignIds)
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            _logger.Trace($"GetPerformerResources: {performerForeignIds.Count} performers");

            var performerResources = new List<PerformerResource>();

            var missingIds = new List<string>();
            foreach (var id in performerForeignIds)
            {
                var performerResource = _performerResourceCache.Find(id);
                if (performerResource == null)
                {
                    missingIds.Add(id);
                }
                else
                {
                    performerResources.AddIfNotNull(performerResource);
                }
            }

            if (missingIds.Count > 0)
            {
                var releaseLock = false;
                var getIds = new List<string>();

                try
                {
                    _logger.Info($"Caching {missingIds.Count} performers with {_performerResourceCache.Lock.CurrentCount} available threads.");

                    // If there are a large number of missing IDs, acquire the lock to prevent cache stampede
                    if (missingIds.Count > 100)
                    {
                        _performerResourceCache.Lock.Wait();
                        releaseLock = true;
                        if (stopwatch.Elapsed.TotalSeconds > 2)
                        {
                            _logger.Warn($"Locked performer cache for {stopwatch.Elapsed.TotalSeconds} seconds");
                        }

                        // recheck after acquiring the lock
                        foreach (var id in missingIds)
                        {
                            var performerResource = _performerResourceCache.Find(id);
                            if (performerResource == null)
                            {
                                getIds.Add(id);
                            }
                            else
                            {
                                performerResources.AddIfNotNull(performerResource);
                            }
                        }
                    }
                    else
                    {
                        getIds = missingIds;
                    }

                    if (getIds.Count > 0)
                    {
                        var performers = _performerService.FindByForeignIds(getIds);

                        foreach (var performer in performers)
                        {
                            performerResources.AddIfNotNull(performer.ToResource());
                        }

                        var coverFileInfos = _coverMapper.GetPerformerCoverFileInfos();

                        _coverMapper.ConvertToLocalPerformerUrls(performerResources.Select(x => Tuple.Create(x.Id, x.Images.AsEnumerable())), coverFileInfos);

                        foreach (var performerResource in performerResources)
                        {
                            _performerResourceCache.Set(performerResource.ForeignId, performerResource);
                        }
                    }
                }
                finally
                {
                    stopwatch.Stop();
                    if (releaseLock)
                    {
                        _performerResourceCache.Lock.Release();
                    }
                }
            }

            if (stopwatch.Elapsed.TotalSeconds > 60)
            {
                _logger.Warn($"Processed performer cache for {performerForeignIds.Count} after {stopwatch.Elapsed.TotalSeconds} seconds");
            }

            return performerResources;
        }

        /// <summary>Retrieves a paged list of performers with advanced filtering options</summary>
        /// <param name="request">Paging and filtering parameters</param>
        /// <returns>Paged list of performers matching the specified criteria</returns>
        [HttpPost("paged")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<PagingResource<PerformerResource>> GetPerformersPagedPost([FromBody] PerformerPagingRequestResource request)
        {
            if (request == null)
            {
                _logger.Error("Paged performer request is null. Check the request body and route.");
                return BadRequest("Request body is null or invalid.");
            }

            var pagingResource = new PagingResource<PerformerResource>(request);
            var pageSpec = pagingResource.MapToPagingSpec<PerformerResource, Performer>(
                _allowedPerformerSortKeys,
                "sortName",
                SortDirection.Ascending);

            var hasTagFilter = request.Filters != null && request.Filters.Any(f => f.Key?.ToLowerInvariant() == "tags" && f.Value != null);

            // Dapper doesn't support filtering on arrays like [1,2,3] so we do it in memory.
            if (hasTagFilter)
            {
                return GetPagedPerformersWithTags(request, pageSpec);
            }
            else
            {
                // Standard filtering without tags is optimized for performance
                return GetPagedPerformersStandard(request, pageSpec);
            }
        }

        private ActionResult<PagingResource<PerformerResource>> GetPagedPerformersStandard(PerformerPagingRequestResource request, PagingSpec<Performer> pageSpec)
        {
            Paging.ApplyPerformerFiltersToPagingSpec(request.Filters, pageSpec);

            // Get file info once for bulk operation
            var coverFileInfos = _coverMapper.GetPerformerCoverFileInfos();

            return pageSpec.ApplyToPage(_performerService.Paged, resource =>
            {
                var performerResource = resource.ToResource();
                _coverMapper.ConvertToLocalPerformerUrls(performerResource.Id, performerResource.Images, coverFileInfos);
                return performerResource;
            });
        }

        private ActionResult<PagingResource<PerformerResource>> GetPagedPerformersWithTags(PerformerPagingRequestResource request, PagingSpec<Performer> pageSpec)
        {
            var allPerformers = _performerService.GetAllPerformers();
            Paging.ApplyPerformerFiltersToPagingSpec(request.Filters, pageSpec);
            var filteredPerformers = allPerformers.AsQueryable();
            foreach (var expr in pageSpec.FilterExpressions)
            {
                filteredPerformers = filteredPerformers.Where(expr);
            }

            var sortKey = pageSpec.SortKey ?? "sortName";
            var pageSize = pageSpec.PageSize > 0 && pageSpec.PageSize < 1000 ? pageSpec.PageSize : 10;
            var sortDir = pageSpec.SortDirection;
            filteredPerformers = sortDir == SortDirection.Descending
                ? filteredPerformers.OrderByDescending(p => Sorting.GetSortValue(p, sortKey))
                : filteredPerformers.OrderBy(p => Sorting.GetSortValue(p, sortKey));

            var offset = ((pageSpec.Page > 0 ? pageSpec.Page : 1) - 1) * pageSize;
            var totalCount = filteredPerformers.Count();
            var page = filteredPerformers
                .Skip(offset)
                .Take(pageSize)
                .ToList();

            var resources = page.Select(p => p.ToResource()).ToList();

            // Bulk load file info once for all performers on page
            var coverFileInfos = _coverMapper.GetPerformerCoverFileInfos();
            _coverMapper.ConvertToLocalPerformerUrls(resources.Select(x => Tuple.Create(x.Id, x.Images.AsEnumerable())), coverFileInfos);

            var result = new PagingResource<PerformerResource>(request)
            {
                Records = resources,
                TotalRecords = totalCount
            };
            return Ok(result);
        }
    }
}
