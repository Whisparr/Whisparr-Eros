using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Queue;

namespace NzbDrone.Core.Download.Review
{
    public interface IReviewService
    {
        List<ReviewItem> Capture(IEnumerable<DownloadDecision> decisions, IEnumerable<DownloadDecision> processed);
        PagingSpec<ReviewItem> Paged(PagingSpec<ReviewItem> pagingSpec);
        ReviewItem Get(int id);
        int PendingCount();
        Task Approve(int id, int? movieId = null, Quality quality = null);
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

        private readonly IReviewItemRepository _repository;
        private readonly IMovieService _movieService;
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

        public async Task Approve(int id, int? movieId = null, Quality quality = null)
        {
            var item = _repository.Get(id);

            if (item.Status != ReviewItemStatus.Pending)
            {
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "'{0}' was already {1}", item.Title, item.Status.ToString().ToLowerInvariant());
            }

            var targetMovieId = movieId ?? item.MovieId;

            if (!item.CandidateMovieIds.Contains(targetMovieId))
            {
                throw new NzbDroneClientException(HttpStatusCode.BadRequest, "Scene {0} is not a candidate for '{1}'", targetMovieId, item.Title);
            }

            if (quality != null && quality.Id == Quality.Unknown.Id)
            {
                quality = null;
            }

            var movie = _movieService.GetMovie(targetMovieId);

            if (movie.HasFile)
            {
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "'{0}' already has a file", movie.Title);
            }

            if (_queueService.GetQueue().Any(q => q.Movie?.Id == movie.Id))
            {
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "'{0}' is already in the download queue", movie.Title);
            }

            var remoteMovie = BuildRemoteMovie(item, movie, quality);

            _logger.Info("Grabbing reviewed release '{0}' for '{1}'", item.Title, movie.Title);

            await _downloadService.DownloadReport(remoteMovie, null);

            item.MovieId = movie.Id;
            item.Status = ReviewItemStatus.Approved;

            if (quality != null)
            {
                item.Quality = remoteMovie.ParsedMovieInfo.Quality;
            }

            _repository.Update(item);
            _eventAggregator.PublishEvent(new ReviewQueueUpdatedEvent());
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
