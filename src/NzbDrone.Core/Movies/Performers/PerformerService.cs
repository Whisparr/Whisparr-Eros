using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies.Performers.Events;
using NzbDrone.Core.MovieStats;
using NzbDrone.Core.Parser;

namespace NzbDrone.Core.Movies.Performers
{
    public interface IPerformerService : IHandle<PerformerUpdatedEvent>
    {
        Performer AddPerformer(Performer performer);
        List<Performer> AddPerformers(List<Performer> performers);
        List<Performer> GetPerformers(IEnumerable<int> performerIds);
        Performer GetById(int id);
        Performer FindByForeignId(string foreignId);
        List<Performer> FindByForeignIds(List<string> foreignIds);
        List<Performer> SearchPerformers(string query);
        List<Performer> GetAllPerformers();
        List<string> AllPerformerForeignIds();
        List<int> AllPerformerIdsByLastInfoSync();
        Performer Update(Performer performer);
        List<Performer> Update(List<Performer> performers);
        void RemovePerformer(Performer performer);
        void DeletePerformers(List<int> performerIds, bool deleteFiles, bool addImportExclusion = false);
        PagingSpec<Performer> Paged(PagingSpec<Performer> pagingSpec);
        public int Count();
        int CountByQualityProfile(int qualityProfileId);
    }

    public class PerformerService : IPerformerService
    {
        private readonly IPerformerRepository _performerRepo;
        private readonly IEventAggregator _eventAggregator;
        private readonly ICacheManager _cacheManager;
        private readonly MovieService _movieService;
        private readonly MediaFileService _movieFileService;
        private readonly MovieStatisticsService _movieStatisticsService;
        private readonly IImportListExclusionService _exclusionService;
        private readonly string _cacheName;

        public PerformerService(
            IPerformerRepository performerRepo,
            ICacheManager cacheManager,
            IEventAggregator eventAggregator,
            MovieService movieService,
            MovieStatisticsService movieStatisticsService,
            MediaFileService movieFileService,
            IImportListExclusionService exclusionService)
        {
            _performerRepo = performerRepo;
            _movieService = movieService;
            _movieStatisticsService = movieStatisticsService;
            _movieFileService = movieFileService;
            _eventAggregator = eventAggregator;
            _cacheManager = cacheManager;
            _exclusionService = exclusionService;
            _cacheName = "Whisparr.Api.V3.Performers.PerformerResource_performerResources";
        }

        public Performer AddPerformer(Performer performer)
        {
            var newPerformer = _performerRepo.Insert(performer);

            _eventAggregator.PublishEvent(new PerformerAddedEvent(newPerformer));

            return newPerformer;
        }

        public List<Performer> AddPerformers(List<Performer> performers)
        {
            if (!performers.Any())
            {
                return performers;
            }

            var allPerformerForeignIds = new HashSet<string>(_performerRepo.AllPerformerForeignIds());

            performers = performers.Where(p => p.ForeignId.IsNotNullOrWhiteSpace()).ToList();

            var existing = performers.Where(p => allPerformerForeignIds.Contains(p.ForeignId)).ToList();
            var performersToAdd = performers.Where(p => !allPerformerForeignIds.Contains(p.ForeignId)).ToList();

            _performerRepo.InsertMany(performersToAdd);

            _eventAggregator.PublishEvent(new PerformersAddedEvent(performersToAdd));

            return performersToAdd.Concat(existing).ToList();
        }

        public Performer GetById(int id)
        {
            return _performerRepo.Get(id);
        }

        public Performer FindByForeignId(string foreignId)
        {
            return _performerRepo.FindByForeignId(foreignId);
        }

        public List<Performer> FindByForeignIds(List<string> foreignIds)
        {
            // SQLite has a default variable limit of 999, so use a safe chunk size
            // this prevents the API layer from triggering SQLite fauls based on UI requests
            const int chunkSize = 500;
            var results = new List<Performer>();
            for (var i = 0; i < foreignIds.Count; i += chunkSize)
            {
                var chunk = foreignIds.Skip(i).Take(chunkSize).ToList();
                results.AddRange(_performerRepo.FindByForeignIds(chunk));
            }

            return results;
        }

        public List<Performer> SearchPerformers(string query)
        {
            var cleanName = query.CleanMovieTitle();

            return _performerRepo.SearchPerformers(cleanName, query);
        }

        public List<Performer> GetPerformers(IEnumerable<int> performerIds)
        {
            return _performerRepo.Get(performerIds).ToList();
        }

        public List<Performer> GetAllPerformers()
        {
            return _performerRepo.All().ToList();
        }

        public Performer Update(Performer performer)
        {
            var newPerformer = _performerRepo.Update(performer);
            RemovePerformerResourcesCache(newPerformer.ForeignId);
            _eventAggregator.PublishEvent(new PerformerUpdatedEvent(newPerformer));
            return newPerformer;
        }

        public List<Performer> Update(List<Performer> performers)
        {
            _performerRepo.UpdateMany(performers);

            foreach (var performer in performers)
            {
                RemovePerformerResourcesCache(performer.ForeignId);
                _eventAggregator.PublishEvent(new PerformerUpdatedEvent(performer));
            }

            return performers;
        }

        public void RemovePerformer(Performer performer)
        {
            _performerRepo.Delete(performer);
            _eventAggregator.PublishEvent(new PerformersDeletedEvent(new List<Performer> { performer }));
            RemovePerformerResourcesCache(performer.ForeignId);
        }

        public void DeletePerformers(List<int> performerIds, bool deleteFiles, bool addImportExclusion = false)
        {
            foreach (var id in performerIds)
            {
                var performer = GetById(id);

                if (performer == null)
                {
                    continue;
                }

                var sceneIds = _movieService.GetByPerformerForeignId(performer.ForeignId).Select(x => x.Id).ToList();
                _movieService.DeleteMovies(sceneIds, deleteFiles);

                if (addImportExclusion)
                {
                    _exclusionService.AddExclusion(new ImportListExclusion
                    {
                        ForeignId = performer.ForeignId,
                        MovieTitle = performer.Name,
                        Type = ImportExclusionType.Performer,
                        Reason = ImportExclusionReason.DuringDelete
                    });
                }

                RemovePerformer(performer);
            }
        }

        public List<string> AllPerformerForeignIds()
        {
            return _performerRepo.AllPerformerForeignIds();
        }

        public List<int> AllPerformerIdsByLastInfoSync()
        {
            return _performerRepo.AllPerformerIdsByLastInfoSync();
        }

        public PagingSpec<Performer> Paged(PagingSpec<Performer> pagingSpec)
        {
            return _performerRepo.GetPaged(pagingSpec);
        }

        public int Count()
        {
            return _performerRepo.Count();
        }

        public int CountByQualityProfile(int qualityProfileId)
        {
            return _performerRepo.Count(p => p.QualityProfileId == qualityProfileId);
        }

        private void RemovePerformerResourcesCache(string cacheKey)
        {
            var movieResourcesCache = _cacheManager.FindCache(_cacheName);
            if (movieResourcesCache != null)
            {
                movieResourcesCache.Remove(cacheKey);
            }
        }

        public void Handle(PerformerUpdatedEvent message)
        {
            var movies = _movieService.GetByPerformerForeignId(message.Performer.ForeignId);
            var ids = movies.Select(x => x.Id).ToList();
            var movieStats = _movieStatisticsService.MovieStatistics(ids);

            message.Performer.MovieCount = movieStats
                .Where(stat => movies.Any(m => m.Id == stat.MovieId && m.MovieMetadata.Value.ItemType == ItemType.Movie))
                .Sum(stat => stat.MovieFileCount);
            message.Performer.SceneCount = movieStats
                .Where(stat => movies.Any(m => m.Id == stat.MovieId && m.MovieMetadata.Value.ItemType == ItemType.Scene))
                .Sum(stat => stat.MovieFileCount);
            message.Performer.TotalMovieCount = movies.Count(x => x.MovieMetadata.Value.ItemType == ItemType.Movie);
            message.Performer.TotalSceneCount = movies.Count(x => x.MovieMetadata.Value.ItemType == ItemType.Scene);
            message.Performer.SizeOnDisk = movieStats.Sum(x => x.SizeOnDisk);
            var updatedPerformer = _performerRepo.Update(message.Performer);
        }
    }
}
