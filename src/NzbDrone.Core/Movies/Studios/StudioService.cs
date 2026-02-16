using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Cache;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies.Studios.Events;
using NzbDrone.Core.MovieStats;
using NzbDrone.Core.Parser;

namespace NzbDrone.Core.Movies.Studios
{
    public interface IStudioService : IHandleAsync<StudioUpdatedEvent>
    {
        Studio AddStudio(Studio studio);
        List<Studio> AddStudios(List<Studio> studios);
        List<Studio> GetStudios(IEnumerable<int> studioIds);
        Studio GetById(int id);
        Studio FindByForeignId(string foreignId);
        List<Studio> FindByForeignIds(List<string> foreignIds);
        List<Studio> SearchStudios(string query);
        List<Studio> GetAllStudios();
        List<string> AllStudioForeignIds();
        Studio Update(Studio performer);
        List<Studio> Update(List<Studio> studios);
        Studio FindByTitle(string title);
        List<Studio> FindAllByTitle(string title);
        void RemoveStudio(Studio studio);
        PagingSpec<Studio> Paged(PagingSpec<Studio> pagingSpec);
    }

    public class StudioService : IStudioService
    {
        private readonly IStudioRepository _studioRepo;
        private readonly IEventAggregator _eventAggregator;
        private readonly ICacheManager _cacheManager;
        private readonly IMovieRepository _movieRepository;
        private readonly IMovieStatisticsService _movieStatisticsService;
        private readonly string _cacheName;

        public StudioService(
            IStudioRepository studioRepo,
            IEventAggregator eventAggregator,
            ICacheManager cacheManager,
            IMovieRepository movieRepository,
            IMovieStatisticsService movieStatisticsService)
        {
            _studioRepo = studioRepo;
            _eventAggregator = eventAggregator;
            _cacheManager = cacheManager;
            _movieRepository = movieRepository;
            _movieStatisticsService = movieStatisticsService;
            _cacheName = "Whisparr.Api.V3.Studios.StudioResource_studioResources";
        }

        public Studio AddStudio(Studio newStudio)
        {
            var studio = _studioRepo.Insert(newStudio);

            _eventAggregator.PublishEvent(new StudioAddedEvent(GetById(studio.Id)));

            return studio;
        }

        public List<Studio> AddStudios(List<Studio> studios)
        {
            _studioRepo.InsertMany(studios);

            _eventAggregator.PublishEvent(new StudiosAddedEvent(studios));

            return studios;
        }

        public Studio GetById(int id)
        {
            return _studioRepo.Get(id);
        }

        public List<Studio> GetStudios(IEnumerable<int> studioIds)
        {
            return _studioRepo.Get(studioIds).ToList();
        }

        public List<Studio> GetAllStudios()
        {
            return _studioRepo.All().ToList();
        }

        public Studio Update(Studio studio)
        {
            RemoveStudioResourcesCache(studio.ForeignId);
            var updatedStudio = _studioRepo.Update(studio);
            _eventAggregator.PublishEvent(new StudioUpdatedEvent(updatedStudio));
            return updatedStudio;
        }

        public List<Studio> Update(List<Studio> studios)
        {
            _studioRepo.UpdateMany(studios);

            foreach (var studio in studios)
            {
                RemoveStudioResourcesCache(studio.ForeignId);
                _eventAggregator.PublishEvent(new StudioUpdatedEvent(studio));
            }

            return studios;
        }

        public void RemoveStudio(Studio studio)
        {
            _studioRepo.Delete(studio);
            _eventAggregator.PublishEvent(new StudiosDeletedEvent(new List<Studio> { studio }));
            RemoveStudioResourcesCache(studio.ForeignId);
        }

        public Studio FindByTitle(string title)
        {
            var cleanTitle = title.CleanStudioTitle();

            return _studioRepo.FindByTitle(cleanTitle);
        }

        public List<Studio> FindAllByTitle(string title)
        {
            var cleanTitle = title.CleanStudioTitle().ToLower();

            return _studioRepo.FindAllByTitle(cleanTitle);
        }

        public Studio FindByForeignId(string foreignId)
        {
            return _studioRepo.FindByForeignId(foreignId);
        }

        public List<Studio> FindByForeignIds(List<string> foreignIds)
        {
            // SQLite has a default variable limit of 999, so use a safe chunk size
            // this prevents the API layer from triggering SQLite fauls based on UI requests
            const int chunkSize = 500;
            var results = new List<Studio>();
            for (var i = 0; i < foreignIds.Count; i += chunkSize)
            {
                var chunk = foreignIds.Skip(i).Take(chunkSize).ToList();
                results.AddRange(_studioRepo.FindByForeignIds(chunk));
            }

            return results;
        }

        public List<Studio> SearchStudios(string query)
        {
            var cleanTitle = query.CleanStudioTitle().ToLower();

            return _studioRepo.SearchStudios(cleanTitle, query);
        }

        public List<string> AllStudioForeignIds()
        {
            return _studioRepo.AllStudioForeignIds();
        }

        public PagingSpec<Studio> Paged(PagingSpec<Studio> pagingSpec)
        {
            return _studioRepo.GetPaged(pagingSpec);
        }

        private void RemoveStudioResourcesCache(string foreignId)
        {
            var studioResourcesCache = _cacheManager.FindCache(_cacheName);
            if (studioResourcesCache != null)
            {
                studioResourcesCache.Remove(foreignId);
            }
        }

        public void HandleAsync(StudioUpdatedEvent message)
        {
            var movies = _movieRepository.GetByStudioForeignId(message.Studio.ForeignId);
            var ids = movies.Select(x => x.Id).ToList();
            var movieStats = _movieStatisticsService.MovieStatistics(ids);

            message.Studio.MovieCount = movieStats
                .Where(stat => movies.Any(m => m.Id == stat.MovieId && m.MovieMetadata.Value.ItemType == ItemType.Movie))
                .Sum(stat => stat.MovieFileCount);
            message.Studio.SceneCount = movieStats
                .Where(stat => movies.Any(m => m.Id == stat.MovieId && m.MovieMetadata.Value.ItemType == ItemType.Scene))
                .Sum(stat => stat.MovieFileCount);
            message.Studio.TotalMovieCount = movies.Count(x => x.MovieMetadata.Value.ItemType == ItemType.Movie);
            message.Studio.TotalSceneCount = movies.Count(x => x.MovieMetadata.Value.ItemType == ItemType.Scene);
            message.Studio.SizeOnDisk = movieStats.Sum(x => x.SizeOnDisk);

            _studioRepo.Update(message.Studio);
        }
    }
}
