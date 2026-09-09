using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Instrumentation.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.ImportLists.ImportListMovies;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;

namespace NzbDrone.Core.ImportLists
{
    public class ImportListSyncService : IExecute<ImportListSyncCommand>
    {
        private readonly Logger _logger;
        private readonly IImportListFactory _importListFactory;
        private readonly IFetchAndParseImportList _listFetcherAndParser;
        private readonly IMovieService _movieService;
        private readonly IAddMovieService _addMovieService;
        private readonly IConfigService _configService;
        private readonly IImportListExclusionService _listExclusionService;
        private readonly IImportListMovieService _listMovieService;
        private readonly IPerformerService _performerService;
        private readonly IStudioService _studioService;

        public ImportListSyncService(IImportListFactory importListFactory,
                                      IFetchAndParseImportList listFetcherAndParser,
                                      IMovieService movieService,
                                      IAddMovieService addMovieService,
                                      IConfigService configService,
                                      IImportListExclusionService listExclusionService,
                                      IImportListMovieService listMovieService,
                                      IPerformerService performerService,
                                      IStudioService studioService,
                                      Logger logger)
        {
            _importListFactory = importListFactory;
            _listFetcherAndParser = listFetcherAndParser;
            _movieService = movieService;
            _addMovieService = addMovieService;
            _listExclusionService = listExclusionService;
            _listMovieService = listMovieService;
            _performerService = performerService;
            _studioService = studioService;
            _logger = logger;
            _configService = configService;
        }

        private void SyncAll()
        {
            _logger.Trace("Starting Import List Sync All");

            if (_importListFactory.Enabled().Empty())
            {
                _logger.Debug("No enabled import lists, skipping sync and cleaning");

                return;
            }

            var listItemsResult = _listFetcherAndParser.Fetch();

            if (listItemsResult.SyncedLists == 0)
            {
                _logger.Debug("No lists were synced, skipping cleaning and processing");
                return;
            }

            if (!listItemsResult.AnyFailure)
            {
                _logger.Debug("All lists were synced successfully, cleaning library");
                CleanLibrary();
            }

            ProcessListItems(listItemsResult);
        }

        private void SyncList(ImportListDefinition definition)
        {
            _logger.ProgressInfo("Starting Import List Refresh for List {0}", definition.Name);

            var listItemsResult = _listFetcherAndParser.FetchSingleList(definition);

            ProcessListItems(listItemsResult);
        }

        private void ProcessMovieReport(ImportListDefinition importList, ImportListMovie report, List<ImportListExclusion> listExclusions, HashSet<string> dbMovies, List<Movie> moviesToAdd, Dictionary<string, HashSet<int>> moviesToTag)
        {
            if (report.ForeignId.IsNullOrWhiteSpace() || !importList.EnableAuto)
            {
                return;
            }

            // Check to see if movie in DB
            if (dbMovies.Contains(report.ForeignId))
            {
                if (importList.TagExisting && importList.Tags.Any())
                {
                    QueueTags(moviesToTag, report.ForeignId, importList.Tags);
                }

                _logger.Debug("{0} [{1}] Rejected, Movie Exists in DB", report.ForeignId, report.Title);
                return;
            }

            // Check to see if movie excluded
            var excludedMovie = listExclusions.SingleOrDefault(s => s.ForeignId == report.ForeignId);

            if (excludedMovie != null)
            {
                _logger.Debug("{0} [{1}] Rejected due to list exclusion", report.ForeignId, report.Title);
                return;
            }

            var pendingMovie = moviesToAdd.FirstOrDefault(s => s.ForeignId == report.ForeignId);

            // A movie on more than one list is added once, so the lists after the
            // first would otherwise lose their tags. Not gated on TagExisting: the
            // movie is being added now, and every list that asked for it contributed.
            if (pendingMovie != null)
            {
                pendingMovie.Tags.UnionWith(importList.Tags);
                return;
            }

            var monitorType = importList.Monitor;

            moviesToAdd.Add(new Movie
            {
                Monitored = monitorType != MonitorTypes.None,
                RootFolderPath = importList.RootFolderPath,
                QualityProfileId = importList.QualityProfileId,
                Tags = new HashSet<int>(importList.Tags),
                ForeignId = report.ForeignId,
                TmdbId = report.TmdbId,
                Title = report.Title,
                Year = report.Year,
                ImdbId = report.ImdbId,
                AddOptions = new AddMovieOptions
                {
                    SearchForMovie = monitorType != MonitorTypes.None && importList.SearchOnAdd,
                    Monitor = monitorType,
                    AddMethod = AddMovieMethod.List
                }
            });
        }

        private void ProcessListItems(ImportListFetchResult listFetchResult)
        {
            _logger.Info("Processing {0} movies from {1} lists", listFetchResult.Movies.Count, listFetchResult.SyncedLists);

            var importExclusions = _listExclusionService.GetAllExclusions();
            var dbMovies = new HashSet<string>(_movieService.AllMovieForeignIds());
            var moviesToAdd = new List<Movie>();
            var moviesToTag = new Dictionary<string, HashSet<int>>();

            // Deduplicated within each list rather than across all of them. A movie on two
            // lists is still added once, because moviesToAdd is keyed on the foreign id, but
            // dropping the second list's copy here would also drop its tags.
            var groupedMovies = listFetchResult.Movies.GroupBy(x => x.ListId);

            foreach (var list in groupedMovies)
            {
                var importList = _importListFactory.Get(list.Key);

                foreach (var movie in list.DistinctBy(GetDistinctKey))
                {
                    if (movie.ForeignId.IsNotNullOrWhiteSpace())
                    {
                        ProcessMovieReport(importList, movie, importExclusions, dbMovies, moviesToAdd, moviesToTag);
                    }
                }
            }

            if (moviesToAdd.Any())
            {
                _logger.ProgressInfo("Adding {0} movies from your auto enabled lists to library", moviesToAdd.Count);
                _addMovieService.AddMovies(moviesToAdd, true);
            }

            TagExistingMovies(moviesToTag);
        }

        private static string GetDistinctKey(ImportListMovie movie)
        {
            if (movie.ForeignId.IsNotNullOrWhiteSpace())
            {
                return movie.ForeignId;
            }

            if (movie.ImdbId.IsNotNullOrWhiteSpace())
            {
                return movie.ImdbId;
            }

            return movie.Title;
        }

        private static bool AddTags(HashSet<int> existingTags, HashSet<int> tags)
        {
            var count = existingTags.Count;

            existingTags.UnionWith(tags);

            return existingTags.Count != count;
        }

        private static void QueueTags(Dictionary<string, HashSet<int>> queue, string foreignId, IEnumerable<int> tags)
        {
            if (queue.TryGetValue(foreignId, out var queued))
            {
                queued.UnionWith(tags);
                return;
            }

            queue.Add(foreignId, new HashSet<int>(tags));
        }

        private void TagExistingMovies(Dictionary<string, HashSet<int>> moviesToTag)
        {
            if (moviesToTag.Count == 0)
            {
                return;
            }

            var movies = _movieService.FindByForeignIds(moviesToTag.Keys.ToList());
            var moviesWithNewTags = new List<Movie>();
            var studiosToTag = new Dictionary<string, HashSet<int>>();
            var performersToTag = new Dictionary<string, HashSet<int>>();

            foreach (var movie in movies)
            {
                var tags = moviesToTag[movie.ForeignId];

                if (AddTags(movie.Tags, tags))
                {
                    _logger.Debug("{0} [{1}] tagged existing movie", movie.ForeignId, movie.Title);
                    moviesWithNewTags.Add(movie);
                }

                // The studio and performers get the same tags a newly added scene would
                // hand them: RefreshMovieService seeds both from the movie's tags when it
                // creates them, so tagging the scene alone would leave the three out of
                // step for a library that happens to already hold the scene.
                var metadata = movie.MovieMetadata.Value;

                if (metadata.StudioForeignId.IsNotNullOrWhiteSpace())
                {
                    QueueTags(studiosToTag, metadata.StudioForeignId, tags);
                }

                foreach (var performerForeignId in metadata.PerformerForeignIds)
                {
                    if (performerForeignId.IsNotNullOrWhiteSpace())
                    {
                        QueueTags(performersToTag, performerForeignId, tags);
                    }
                }
            }

            if (moviesWithNewTags.Any())
            {
                _logger.ProgressInfo("Tagging {0} existing movies from your import lists", moviesWithNewTags.Count);
                _movieService.UpdateMovie(moviesWithNewTags, true);
            }

            TagExistingStudios(studiosToTag);
            TagExistingPerformers(performersToTag);
        }

        private void TagExistingStudios(Dictionary<string, HashSet<int>> studiosToTag)
        {
            if (studiosToTag.Count == 0)
            {
                return;
            }

            var studiosWithNewTags = _studioService.FindByForeignIds(studiosToTag.Keys.ToList())
                .Where(studio => AddTags(studio.Tags, studiosToTag[studio.ForeignId]))
                .ToList();

            if (studiosWithNewTags.Any())
            {
                _logger.Debug("Tagging {0} existing studios from your import lists", studiosWithNewTags.Count);
                _studioService.Update(studiosWithNewTags);
            }
        }

        private void TagExistingPerformers(Dictionary<string, HashSet<int>> performersToTag)
        {
            if (performersToTag.Count == 0)
            {
                return;
            }

            var performersWithNewTags = _performerService.FindByForeignIds(performersToTag.Keys.ToList())
                .Where(performer => AddTags(performer.Tags, performersToTag[performer.ForeignId]))
                .ToList();

            if (performersWithNewTags.Any())
            {
                _logger.Debug("Tagging {0} existing performers from your import lists", performersWithNewTags.Count);
                _performerService.Update(performersWithNewTags);
            }
        }

        public void Execute(ImportListSyncCommand message)
        {
            if (message.DefinitionId.HasValue)
            {
                SyncList(_importListFactory.Get(message.DefinitionId.Value));
            }
            else
            {
                SyncAll();
            }
        }

        private void CleanLibrary()
        {
            if (_configService.ListSyncLevel == "disabled")
            {
                _logger.Debug("List sync level is set to 'disabled', skipping library cleaning");
                return;
            }

            var listMovies = _listMovieService.GetAllListMovies();
            _logger.Debug("Found {0} movies in lists", listMovies.Count);

            // TODO use AllMovieTmdbIds here?
            var moviesInLibrary = _movieService.GetAllMovies();
            _logger.Debug("Found {0} movies in library", moviesInLibrary.Count);

            var moviesToUpdate = new List<Movie>();

            foreach (var movie in moviesInLibrary)
            {
                var movieExists = listMovies.Any(c => c.ForeignId == movie.ForeignId);

                if (!movieExists)
                {
                    switch (_configService.ListSyncLevel)
                    {
                        case "logOnly":
                            _logger.Info("{0} was in your library, but not found in your lists --> You might want to unmonitor or remove it", movie);
                            break;
                        case "keepAndUnmonitor":
                            _logger.Info("{0} was in your library, but not found in your lists --> Keeping in library but Unmonitoring it", movie);
                            movie.Monitored = false;
                            moviesToUpdate.Add(movie);
                            break;
                        case "removeAndKeep":
                            _logger.Info("{0} was in your library, but not found in your lists --> Removing from library (keeping files)", movie);
                            _movieService.DeleteMovie(movie.Id, false);
                            break;
                        case "removeAndDelete":
                            _logger.Info("{0} was in your library, but not found in your lists --> Removing from library and deleting files", movie);
                            _movieService.DeleteMovie(movie.Id, true);
                            break;
                    }
                }
                else
                {
                    _logger.Trace("{0} was in your library and found in your lists.  Keeping.", movie.ForeignId);
                }
            }

            _movieService.UpdateMovie(moviesToUpdate, true);
        }
    }
}
