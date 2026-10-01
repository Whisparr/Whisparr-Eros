using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Blocklisting;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.Download.Aggregation;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Queue;
using NzbDrone.Core.RootFolders;

namespace NzbDrone.Core.Download.Review
{
    public interface IReviewService
    {
        List<ReviewItem> Capture(IEnumerable<DownloadDecision> decisions, IEnumerable<DownloadDecision> processed);
        PagingSpec<ReviewItem> Paged(PagingSpec<ReviewItem> pagingSpec);
        ReviewItem Get(int id);
        int PendingCount();
        Task<int> Approve(int id, int? movieId = null, Quality quality = null, bool manualMatch = false, string foreignId = null);
        List<Movie> FindScenes(int id, string query, bool allStudios, int limit);
        List<Movie> LookupScenes(int id, string term);
        void Reject(List<int> ids);
        void Delete(int id);
        void Delete(List<int> ids);
    }

    public class ReviewService : IReviewService,
                                 IHandle<MoviesDeletedEvent>,
                                 IHandle<MovieEditedEvent>,
                                 IHandle<MoviesBulkEditedEvent>,
                                 IHandle<MovieFileImportedEvent>,
                                 IHandle<CommandExecutedEvent>
    {
        public const string REJECTED_MESSAGE = "Rejected in review";

        // Automatic grabs only: interactive search shows weak matches to the user directly and a pushed release answers its pusher
        private static readonly HashSet<ReleaseSourceType> CaptureSources = new ()
        {
            ReleaseSourceType.Rss,
            ReleaseSourceType.Search,
            ReleaseSourceType.UserInvokedSearch
        };

        // Joins in a release name that a metadata search would read as part of the title
        private static readonly Regex LookupTermSeparators = new (@"\s*[,&+]\s*|\s+-\s+|\s+and\s+|\s+", RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private readonly IReviewItemRepository _repository;
        private readonly IMovieService _movieService;
        private readonly IAddMovieService _addMovieService;
        private readonly ISearchForNewMovie _searchProxy;
        private readonly IRootFolderService _rootFolderService;
        private readonly IDownloadService _downloadService;
        private readonly IQueueService _queueService;
        private readonly IBlocklistService _blocklistService;
        private readonly IRemoteMovieAggregationService _aggregationService;
        private readonly ICustomFormatCalculationService _formatCalculator;
        private readonly IEventAggregator _eventAggregator;
        private readonly Logger _logger;

        // Items added since the last announcement, so a whole RSS sync or search is announced in one notification
        private readonly List<ReviewItem> _unannounced = new ();
        private readonly object _unannouncedLock = new ();

        public ReviewService(IReviewItemRepository repository,
                             IMovieService movieService,
                             IAddMovieService addMovieService,
                             ISearchForNewMovie searchProxy,
                             IRootFolderService rootFolderService,
                             IDownloadService downloadService,
                             IQueueService queueService,
                             IBlocklistService blocklistService,
                             IRemoteMovieAggregationService aggregationService,
                             ICustomFormatCalculationService formatCalculator,
                             IEventAggregator eventAggregator,
                             Logger logger)
        {
            _repository = repository;
            _movieService = movieService;
            _addMovieService = addMovieService;
            _searchProxy = searchProxy;
            _rootFolderService = rootFolderService;
            _downloadService = downloadService;
            _queueService = queueService;
            _blocklistService = blocklistService;
            _aggregationService = aggregationService;
            _formatCalculator = formatCalculator;
            _eventAggregator = eventAggregator;
            _logger = logger;
        }

        public List<ReviewItem> Capture(IEnumerable<DownloadDecision> decisions, IEnumerable<DownloadDecision> processed)
        {
            // A scene that was just grabbed or has a release pending doesn't need another one confirmed
            var handledMovieIds = processed.Where(d => d.RemoteMovie.Movie != null)
                                           .Select(d => d.RemoteMovie.Movie.Id)
                                           .ToHashSet();

            var added = new List<ReviewItem>();

            foreach (var decision in decisions)
            {
                var remoteMovie = decision.RemoteMovie;

                if (remoteMovie?.Movie == null || remoteMovie.Release == null || !CaptureSources.Contains(remoteMovie.ReleaseSource))
                {
                    continue;
                }

                var reason = GetReviewReason(decision);

                if (reason == ReviewReason.None)
                {
                    continue;
                }

                var candidates = GetCandidates(remoteMovie);
                var movieIds = candidates.Select(c => c.MovieId).ToList();

                if (movieIds.Any(handledMovieIds.Contains))
                {
                    _logger.Debug("Not adding '{0}' for review, its scene was just grabbed", remoteMovie.Release.Title);
                    continue;
                }

                // Never offer the same release for the same scene again, whether it is waiting, was approved or was rejected
                if (FindExisting(remoteMovie.Release).Concat(added).Any(r => SameRelease(r, remoteMovie.Release) && r.CandidateMovieIds.Intersect(movieIds).Any()))
                {
                    _logger.Debug("Release '{0}' is already known to the review queue", remoteMovie.Release.Title);
                    continue;
                }

                var item = new ReviewItem
                {
                    MovieId = movieIds.First(),
                    Candidates = candidates,
                    Title = remoteMovie.Release.Title,
                    IndexerId = remoteMovie.Release.IndexerId,
                    Indexer = remoteMovie.Release.Indexer,
                    Guid = remoteMovie.Release.Guid,
                    Size = remoteMovie.Release.Size,
                    Release = remoteMovie.Release,
                    TorrentInfo = GetTorrentInfo(remoteMovie.Release),
                    ParsedMovieInfo = remoteMovie.ParsedMovieInfo,
                    Quality = remoteMovie.ParsedMovieInfo?.Quality ?? new QualityModel(Quality.Unknown),
                    Reason = reason,
                    Status = ReviewItemStatus.Pending,
                    ReleaseSource = remoteMovie.ReleaseSource,
                    Added = DateTime.UtcNow
                };

                _logger.Debug("Adding release '{0}' for review ({1})", item.Title, reason);

                _repository.Insert(item);
                added.Add(item);
            }

            if (added.Any())
            {
                lock (_unannouncedLock)
                {
                    _unannounced.AddRange(added);
                }

                _eventAggregator.PublishEvent(new ReviewQueueUpdatedEvent());
            }

            return added;
        }

        public PagingSpec<ReviewItem> Paged(PagingSpec<ReviewItem> pagingSpec)
        {
            return _repository.GetPaged(pagingSpec);
        }

        public ReviewItem Get(int id)
        {
            return _repository.Get(id);
        }

        public int PendingCount()
        {
            return _repository.PendingCount();
        }

        public async Task<int> Approve(int id, int? movieId = null, Quality quality = null, bool manualMatch = false, string foreignId = null)
        {
            var item = _repository.Get(id);

            if (item.Status != ReviewItemStatus.Pending)
            {
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "'{0}' was already {1}", item.Title, item.Status.ToString().ToLowerInvariant());
            }

            if (foreignId.IsNotNullOrWhiteSpace())
            {
                if (!manualMatch)
                {
                    throw new NzbDroneClientException(HttpStatusCode.BadRequest, "A scene can only be chosen by its foreign id with manualMatch");
                }

                if (movieId.HasValue)
                {
                    throw new NzbDroneClientException(HttpStatusCode.BadRequest, "Give either a scene id or a foreign id, not both");
                }
            }
            else if (manualMatch && !movieId.HasValue)
            {
                throw new NzbDroneClientException(HttpStatusCode.BadRequest, "A scene must be given to match '{0}' manually", item.Title);
            }

            if (quality != null && quality.Id == Quality.Unknown.Id)
            {
                quality = null;
            }

            // A scene found on the metadata source is added to the library first, like the candidates it stands in for
            var targetMovieId = foreignId.IsNotNullOrWhiteSpace()
                ? (_movieService.FindByForeignId(foreignId) ?? AddScene(item, foreignId)).Id
                : movieId ?? item.MovieId;

            // Any scene in the library can be chosen, but only when the request says so, so a stale or mistyped id isn't grabbed by accident.
            // A chosen scene that is a candidate after all is approved as the candidate.
            var isManual = !item.CandidateMovieIds.Contains(targetMovieId);

            if (isManual && !manualMatch)
            {
                throw new NzbDroneClientException(HttpStatusCode.BadRequest, "Scene {0} is not a candidate for '{1}'", targetMovieId, item.Title);
            }

            var movie = isManual ? GetManualMatch(targetMovieId) : _movieService.GetMovie(targetMovieId);

            if (movie.HasFile)
            {
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "'{0}' already has a file", movie.Title);
            }

            if (_queueService.GetQueue().Any(q => q.Movie?.Id == movie.Id))
            {
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "'{0}' is already in the download queue", movie.Title);
            }

            var remoteMovie = BuildRemoteMovie(item, movie, quality);

            if (isManual)
            {
                // Recorded on the grab's history as the movie match type
                remoteMovie.MovieMatchType = MovieMatchType.Manual;

                _logger.Info("Grabbing reviewed release '{0}' for manually chosen '{1}'", item.Title, movie.Title);
            }
            else
            {
                _logger.Info("Grabbing reviewed release '{0}' for '{1}'", item.Title, movie.Title);
            }

            await _downloadService.DownloadReport(remoteMovie, null);

            if (isManual)
            {
                item.Candidates.Add(new ReviewItemCandidate { MovieId = movie.Id, Manual = true });
            }

            item.MovieId = movie.Id;
            item.Status = ReviewItemStatus.Approved;

            if (quality != null)
            {
                item.Quality = remoteMovie.ParsedMovieInfo.Quality;
            }

            _repository.Update(item);
            _eventAggregator.PublishEvent(new ReviewQueueUpdatedEvent());

            return movie.Id;
        }

        public List<Movie> LookupScenes(int id, string term)
        {
            var item = _repository.Get(id);

            if (term.IsNullOrWhiteSpace())
            {
                term = GetLookupTerm(item);
            }

            if (term.IsNullOrWhiteSpace())
            {
                return new List<Movie>();
            }

            var scenes = (_searchProxy.SearchForNewEntity(term, ItemType.Scene) ?? new List<object>())
                         .OfType<Movie>()
                         .Where(m => m.MovieMetadata?.Value?.ItemType == ItemType.Scene && m.ForeignId.IsNotNullOrWhiteSpace())
                         .ToList();

            if (scenes.Empty())
            {
                return scenes;
            }

            // A scene already in the library is offered as that scene, so it shows its file and is chosen by id
            var existing = (_movieService.FindByForeignIds(scenes.Select(m => m.ForeignId).ToList()) ?? new List<Movie>())
                           .GroupBy(m => m.ForeignId)
                           .ToDictionary(g => g.Key, g => g.First());

            return scenes.Select(m => existing.GetValueOrDefault(m.ForeignId) ?? m)
                         .DistinctBy(m => m.ForeignId)
                         .ToList();
        }

        // What the release is most likely called on the metadata source: its studio and title (dateless releases carry the performers there)
        public static string GetLookupTerm(ReviewItem item)
        {
            var parsed = item.ParsedMovieInfo;
            var parts = new List<string> { parsed?.StudioTitle };

            // The words after the studio (and date), as the scene matching reads them
            var title = parsed?.ReleaseTokens.IsNotNullOrWhiteSpace() == true ? parsed.ReleaseTokens.NormalizeEpisodeTitle() : parsed?.PrimaryMovieTitle;

            if (title.IsNotNullOrWhiteSpace() && !string.Equals(title, parsed.StudioTitle, StringComparison.OrdinalIgnoreCase))
            {
                parts.Add(title);
            }

            if (parts.All(p => p.IsNullOrWhiteSpace()))
            {
                parts.Add(item.Title);
            }

            var term = string.Join(' ', parts.Where(p => p.IsNotNullOrWhiteSpace()));

            return LookupTermSeparators.Replace(term, " ").Trim();
        }

        public List<Movie> FindScenes(int id, string query, bool allStudios, int limit)
        {
            var item = _repository.Get(id);
            var studioForeignId = allStudios ? null : GetStudioForeignId(item);

            List<Movie> scenes;

            if (studioForeignId.IsNotNullOrWhiteSpace())
            {
                // The studio's catalogue is small enough to filter here, on any word of the title, performers, code or date
                var terms = (query ?? string.Empty).ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var cleanQuery = query.IsNotNullOrWhiteSpace() ? query.CleanMovieTitle() : null;

                scenes = _movieService.GetByStudioForeignId(studioForeignId)
                                      .Where(m => MatchesSearch(m, terms, cleanQuery))
                                      .ToList();
            }
            else if (query.IsNotNullOrWhiteSpace())
            {
                scenes = _movieService.SearchMovies(query);
            }
            else
            {
                return new List<Movie>();
            }

            return scenes.Where(m => m.MovieMetadata.Value?.ItemType == ItemType.Scene)
                         .OrderByDescending(m => m.MovieMetadata.Value.ReleaseDate ?? string.Empty, StringComparer.Ordinal)
                         .ThenBy(m => m.Title, StringComparer.OrdinalIgnoreCase)
                         .Take(Math.Max(1, limit))
                         .ToList();
        }

        public void Reject(List<int> ids)
        {
            var items = _repository.Get(ids).Where(i => i.Status == ReviewItemStatus.Pending).ToList();

            if (items.Empty())
            {
                return;
            }

            var movies = (_movieService.FindByIds(items.SelectMany(i => i.CandidateMovieIds).Distinct().ToList()) ?? new List<Movie>()).ToDictionary(m => m.Id);

            foreach (var item in items)
            {
                // Blocklisted for every scene it could be, so no search offers it for any of them again
                foreach (var movieId in item.CandidateMovieIds)
                {
                    if (movies.TryGetValue(movieId, out var movie))
                    {
                        _blocklistService.Block(BuildRemoteMovie(item, movie, null), REJECTED_MESSAGE);
                    }
                }

                item.Status = ReviewItemStatus.Rejected;
            }

            _repository.UpdateMany(items);
            _eventAggregator.PublishEvent(new ReviewQueueUpdatedEvent());
        }

        public void Delete(int id)
        {
            _repository.Delete(id);
            _eventAggregator.PublishEvent(new ReviewQueueUpdatedEvent());
        }

        public void Delete(List<int> ids)
        {
            _repository.DeleteMany(ids);
            _eventAggregator.PublishEvent(new ReviewQueueUpdatedEvent());
        }

        public void Handle(MoviesDeletedEvent message)
        {
            RemoveCandidates(message.Movies.Select(m => m.Id));
        }

        public void Handle(MovieEditedEvent message)
        {
            if (!message.Movie.Monitored)
            {
                RemoveCandidates(new[] { message.Movie.Id });
            }
        }

        public void Handle(MoviesBulkEditedEvent message)
        {
            RemoveCandidates(message.Movies.Where(m => !m.Monitored).Select(m => m.Id));
        }

        public void Handle(MovieFileImportedEvent message)
        {
            var movie = message.MovieInfo?.Movie;

            if (movie != null)
            {
                RemoveCandidates(new[] { movie.Id });
            }
        }

        public void Handle(CommandExecutedEvent message)
        {
            List<ReviewItem> items;

            lock (_unannouncedLock)
            {
                if (_unannounced.Empty())
                {
                    return;
                }

                items = _unannounced.ToList();
                _unannounced.Clear();
            }

            _eventAggregator.PublishEvent(new ReviewNeededEvent(items));
        }

        internal static ReviewReason GetReviewReason(DownloadDecision decision)
        {
            var remoteMovie = decision.RemoteMovie;
            var needsReview = decision.Rejections.Any(r => r.Reason == DownloadRejectionReason.NeedsReview);

            // Temporary rejections (a delay) don't matter, a human decides when to grab
            var blocking = decision.Rejections.Where(r => r.Reason != DownloadRejectionReason.NeedsReview && r.Type == RejectionType.Permanent).ToList();

            // A release whose resolution and source can't be parsed is otherwise lost, a human can tell the quality.
            // A known quality the profile doesn't want was the user's choice and stays rejected.
            var unknownQuality = remoteMovie.ParsedMovieInfo?.Quality?.Quality == null || remoteMovie.ParsedMovieInfo.Quality.Quality.Id == Quality.Unknown.Id;
            var rejectedForQualityOnly = blocking.Any() && unknownQuality && blocking.All(r => r.Reason == DownloadRejectionReason.QualityNotWanted);

            if (blocking.Any() && !rejectedForQualityOnly)
            {
                return ReviewReason.None;
            }

            var reason = ReviewReason.None;

            if (needsReview)
            {
                reason |= remoteMovie.ReviewCandidates?.Count > 1 ? ReviewReason.AmbiguousMatch : ReviewReason.WeakMatch;
            }

            if (rejectedForQualityOnly)
            {
                reason |= ReviewReason.UnknownQuality;
            }

            return reason;
        }

        private static List<ReviewItemCandidate> GetCandidates(RemoteMovie remoteMovie)
        {
            if (remoteMovie.ReviewCandidates?.Any() == true)
            {
                return remoteMovie.ReviewCandidates.Select(c => new ReviewItemCandidate
                                                         {
                                                             MovieId = c.Movie.Id,
                                                             MatchType = c.MatchType
                                                         })
                                                         .ToList();
            }

            return new List<ReviewItemCandidate>
            {
                new () { MovieId = remoteMovie.Movie.Id }
            };
        }

        private static ReviewItemTorrentInfo GetTorrentInfo(ReleaseInfo release)
        {
            if (release is not TorrentInfo torrentInfo)
            {
                return null;
            }

            return new ReviewItemTorrentInfo
            {
                MagnetUrl = torrentInfo.MagnetUrl,
                InfoHash = torrentInfo.InfoHash,
                Seeders = torrentInfo.Seeders,
                Peers = torrentInfo.Peers
            };
        }

        private List<ReviewItem> FindExisting(ReleaseInfo release)
        {
            return release.Guid.IsNotNullOrWhiteSpace()
                ? _repository.FindByGuid(release.IndexerId, release.Guid)
                : _repository.FindByTitle(release.IndexerId, release.Title);
        }

        private static bool SameRelease(ReviewItem item, ReleaseInfo release)
        {
            if (item.IndexerId != release.IndexerId)
            {
                return false;
            }

            return release.Guid.IsNotNullOrWhiteSpace() ? item.Guid == release.Guid : item.Title == release.Title;
        }

        // Added like a scene from Add New: monitored, without a search, with the root folder, quality profile and tags of the candidate it replaces
        private Movie AddScene(ReviewItem item, string foreignId)
        {
            var candidates = _movieService.FindByIds(item.CandidateMovieIds) ?? new List<Movie>();
            var template = candidates.FirstOrDefault(m => m.Id == item.MovieId) ?? candidates.FirstOrDefault();

            if (template == null)
            {
                throw new NzbDroneClientException(HttpStatusCode.BadRequest, "'{0}' has no scene left to take the root folder and quality profile from", item.Title);
            }

            var scene = new Movie
            {
                ForeignId = foreignId,
                QualityProfileId = template.QualityProfileId,
                RootFolderPath = _rootFolderService.GetBestRootFolderPath(template.Path),
                Monitored = true,
                Tags = template.Tags != null ? new HashSet<int>(template.Tags) : new HashSet<int>(),
                AddOptions = new AddMovieOptions
                {
                    SearchForMovie = false,
                    AddMethod = AddMovieMethod.Manual,
                    Monitor = MonitorTypes.MovieOnly
                }
            };

            _logger.Info("Adding scene {0} to the library for reviewed release '{1}'", foreignId, item.Title);

            return _addMovieService.AddMovie(scene);
        }

        private Movie GetManualMatch(int movieId)
        {
            var movie = _movieService.FindByIds(new List<int> { movieId })?.FirstOrDefault();

            if (movie == null)
            {
                throw new NzbDroneClientException(HttpStatusCode.BadRequest, "Scene {0} is not in the library", movieId);
            }

            if (movie.MovieMetadata?.Value?.ItemType != ItemType.Scene)
            {
                throw new NzbDroneClientException(HttpStatusCode.BadRequest, "'{0}' is not a scene", movie.Title);
            }

            return movie;
        }

        private string GetStudioForeignId(ReviewItem item)
        {
            var movies = _movieService.FindByIds(item.CandidateMovieIds) ?? new List<Movie>();

            return movies.Select(m => m.MovieMetadata?.Value?.StudioForeignId).FirstOrDefault(s => s.IsNotNullOrWhiteSpace());
        }

        private static bool MatchesSearch(Movie movie, string[] terms, string cleanQuery)
        {
            if (terms.Length == 0)
            {
                return true;
            }

            var metadata = movie.MovieMetadata.Value;

            if (cleanQuery.IsNotNullOrWhiteSpace() && (metadata.CleanTitle?.Contains(cleanQuery) ?? false))
            {
                return true;
            }

            var text = string.Join(' ', new[] { movie.Title, metadata.Code, metadata.ReleaseDate }.Concat(metadata.PerformerNames ?? new List<string>()))
                             .ToLowerInvariant();

            return terms.All(text.Contains);
        }

        private RemoteMovie BuildRemoteMovie(ReviewItem item, Movie movie, Quality quality)
        {
            var parsedMovieInfo = item.ParsedMovieInfo ?? Parser.Parser.ParseMovieTitle(item.Title) ?? new ParsedMovieInfo();

            parsedMovieInfo.Quality = quality == null ? item.Quality : new QualityModel(quality);

            var remoteMovie = new RemoteMovie
            {
                Release = item.GetRelease(),
                ParsedMovieInfo = parsedMovieInfo,
                Movie = movie,
                MovieMatchType = MovieMatchType.Id,
                MovieRequested = true,
                DownloadAllowed = true,
                Languages = parsedMovieInfo.Languages ?? new List<Language>(),
                ReleaseSource = ReleaseSourceType.InteractiveSearch
            };

            _aggregationService.Augment(remoteMovie);

            remoteMovie.CustomFormats = _formatCalculator.ParseCustomFormat(remoteMovie, remoteMovie.Release.Size);
            remoteMovie.CustomFormatScore = movie.QualityProfile?.CalculateCustomFormatScore(remoteMovie.CustomFormats) ?? 0;

            return remoteMovie;
        }

        // A scene that was deleted, unmonitored or got a file no longer needs this release
        private void RemoveCandidates(IEnumerable<int> movieIds)
        {
            var ids = movieIds.ToHashSet();

            if (ids.Empty())
            {
                return;
            }

            var affected = _repository.Pending().Where(i => i.CandidateMovieIds.Any(ids.Contains)).ToList();

            if (affected.Empty())
            {
                return;
            }

            var toDelete = new List<int>();
            var toUpdate = new List<ReviewItem>();

            foreach (var item in affected)
            {
                item.Candidates.RemoveAll(c => ids.Contains(c.MovieId));

                if (item.Candidates.Empty())
                {
                    toDelete.Add(item.Id);
                    continue;
                }

                item.MovieId = item.Candidates.First().MovieId;

                if (item.Candidates.Count == 1 && item.Reason.HasFlag(ReviewReason.AmbiguousMatch))
                {
                    item.Reason = (item.Reason & ~ReviewReason.AmbiguousMatch) | ReviewReason.WeakMatch;
                }

                toUpdate.Add(item);
            }

            _logger.Debug("Removing {0} and updating {1} review items for scenes that no longer need them", toDelete.Count, toUpdate.Count);

            _repository.DeleteMany(toDelete);
            _repository.UpdateMany(toUpdate);

            _eventAggregator.PublishEvent(new ReviewQueueUpdatedEvent());
        }
    }
}
