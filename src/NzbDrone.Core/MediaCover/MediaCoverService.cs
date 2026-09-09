using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Lifecycle;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Performers.Events;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Movies.Studios.Events;

namespace NzbDrone.Core.MediaCover
{
    public interface IMapCoversToLocal
    {
        void ConvertToLocalUrls(int movieId, IEnumerable<MediaCover> covers);
        void ConvertToLocalPerformerUrls(int performerId, IEnumerable<MediaCover> covers);
        void ConvertToLocalStudioUrls(int studioId, IEnumerable<MediaCover> covers);
        string GetMovieCoverPath(int movieId, MediaCoverTypes coverType, int? height = null);
        string GetPerformerCoverPath(int performerId, MediaCoverTypes coverType, int? height = null);
        string GetStudioCoverPath(int studioId, MediaCoverTypes coverType, int? height = null);
    }

    public class MediaCoverService :
        IHandle<MovieUpdatedEvent>,
        IHandle<ApplicationStartedEvent>,
        IHandle<ApplicationShutdownRequested>,
        IHandleAsync<PerformerUpdatedEvent>,
        IHandleAsync<StudioUpdatedEvent>,
        IHandleAsync<MoviesDeletedEvent>,
        IHandleAsync<PerformersDeletedEvent>,
        IHandleAsync<StudiosDeletedEvent>,
        IMapCoversToLocal
    {
        private const string DefaultStudioCoverExtension = ".jpg";
        internal const int MovieCoverQueueCapacity = 100;

        internal static int MovieCoverWorkerCount => (int)Math.Ceiling(Environment.ProcessorCount / 2.0);

        internal MovieCoverQueueTestSeam MovieCoverQueueTest { get; }

        private readonly IMediaCoverProxy _mediaCoverProxy;
        private readonly IImageResizer _resizer;
        private readonly IHttpClient _httpClient;
        private readonly IDiskProvider _diskProvider;
        private readonly ICoverExistsSpecification _coverExistsSpecification;
        private readonly IConfigFileProvider _configFileProvider;
        private readonly IEventAggregator _eventAggregator;
        private readonly Logger _logger;

        private readonly object _movieCoverQueueLock;
        private readonly Queue<int> _movieCoverQueue;
        private readonly Dictionary<int, PendingMovieCover> _pendingMovieCovers;

        // Retain admitted sequence high-water marks while needed to reject older producers.
        // Movie deletion purges idle marks and keeps only temporary tombstones for
        // producers or workers that entered before the deletion event.
        private readonly Dictionary<int, long> _movieCoverHighWaterSequences;
        private readonly Dictionary<int, int> _movieCoverProducerCounts;
        private readonly Dictionary<int, int> _activeMovieCoverWorkerCounts;
        private readonly HashSet<int> _deletedMovieCoversWithActiveWork;
        private readonly SemaphoreSlim _queuedMovieCovers;
        private readonly SemaphoreSlim _movieCoverQueueSlots;
        private readonly int _movieCoverWorkerCount;
        private readonly List<Thread> _movieCoverWorkers;

        private readonly string _coverRootFolder;

        private readonly CancellationTokenSource _movieCoverIntakeCancellation;

        private TimeSpan _movieCoverShutdownTimeout = TimeSpan.FromSeconds(5);
        private MovieCoverLifecycleState _movieCoverLifecycleState;
        private long _movieCoverSequence;
        private int _movieCoverBlockedProducerCount;

        // ImageSharp is slow on ARM (no hardware acceleration on mono yet)
        // So limit the number of concurrent resizing tasks
        private static SemaphoreSlim _semaphore = new SemaphoreSlim((int)Math.Ceiling(Environment.ProcessorCount / 2.0));

        public MediaCoverService(IMediaCoverProxy mediaCoverProxy,
                                 IImageResizer resizer,
                                 IHttpClient httpClient,
                                 IDiskProvider diskProvider,
                                 IAppFolderInfo appFolderInfo,
                                 ICoverExistsSpecification coverExistsSpecification,
                                 IConfigFileProvider configFileProvider,
                                 IEventAggregator eventAggregator,
                                 Logger logger)
        {
            _mediaCoverProxy = mediaCoverProxy;
            _resizer = resizer;
            _httpClient = httpClient;
            _diskProvider = diskProvider;
            _coverExistsSpecification = coverExistsSpecification;
            _configFileProvider = configFileProvider;
            _eventAggregator = eventAggregator;
            _logger = logger;

            _coverRootFolder = appFolderInfo.GetMediaCoverPath();

            _movieCoverWorkerCount = MovieCoverWorkerCount;
            _movieCoverQueueLock = new object();
            _movieCoverQueue = new Queue<int>();
            _pendingMovieCovers = new Dictionary<int, PendingMovieCover>();
            _movieCoverHighWaterSequences = new Dictionary<int, long>();
            _movieCoverProducerCounts = new Dictionary<int, int>();
            _activeMovieCoverWorkerCounts = new Dictionary<int, int>();
            _deletedMovieCoversWithActiveWork = new HashSet<int>();
            _queuedMovieCovers = new SemaphoreSlim(0);
            _movieCoverQueueSlots = new SemaphoreSlim(MovieCoverQueueCapacity, MovieCoverQueueCapacity);
            _movieCoverWorkers = new List<Thread>();
            _movieCoverIntakeCancellation = new CancellationTokenSource();
            MovieCoverQueueTest = new MovieCoverQueueTestSeam(this);
        }

        public string GetMovieCoverPath(int movieId, MediaCoverTypes coverType, int? height = null)
        {
            var heightSuffix = height.HasValue ? "-" + height.ToString() : "";

            return Path.Combine(GetMovieCoverPath(movieId), coverType.ToString().ToLower() + heightSuffix + GetExtension(coverType));
        }

        public string GetPerformerCoverPath(int performerId, MediaCoverTypes coverType, int? height = null)
        {
            var heightSuffix = height.HasValue ? "-" + height.ToString() : "";

            return Path.Combine(GetPerformerCoverPath(performerId), coverType.ToString().ToLower() + heightSuffix + GetExtension(coverType));
        }

        public string GetStudioCoverPath(int studioId, MediaCoverTypes coverType, int? height = null)
        {
            var heightSuffix = height.HasValue ? "-" + height.ToString() : "";

            return Path.Combine(GetStudioCoverPath(studioId), coverType.ToString().ToLower() + heightSuffix + GetExtension(coverType));
        }

        public void ConvertToLocalUrls(int movieId, IEnumerable<MediaCover> covers)
        {
            if (movieId == 0)
            {
                // Movie isn't in Whisparr yet, map via a proxy to circumvent referrer issues
                foreach (var mediaCover in covers)
                {
                    mediaCover.Url = _mediaCoverProxy.RegisterUrl(mediaCover.RemoteUrl);
                }

                return;
            }

            foreach (var mediaCover in covers)
            {
                if (mediaCover.CoverType == MediaCoverTypes.Unknown)
                {
                    continue;
                }

                mediaCover.Url = _configFileProvider.UrlBase + @"/MediaCover/movie/" + movieId + "/" + mediaCover.CoverType.ToString().ToLower() + GetExtension(mediaCover.CoverType);

                AppendCacheBuster(mediaCover);
            }
        }

        public void ConvertToLocalPerformerUrls(int performerId, IEnumerable<MediaCover> covers)
        {
            if (performerId == 0)
            {
                // Performer isn't in Whisparr yet, map via a proxy to circumvent referrer issues
                foreach (var mediaCover in covers)
                {
                    mediaCover.Url = _mediaCoverProxy.RegisterUrl(mediaCover.RemoteUrl);
                }

                return;
            }

            foreach (var mediaCover in covers)
            {
                if (mediaCover.CoverType == MediaCoverTypes.Unknown)
                {
                    continue;
                }

                mediaCover.Url = _configFileProvider.UrlBase + @"/MediaCover/performer/" + performerId + "/" + mediaCover.CoverType.ToString().ToLower() + GetExtension(mediaCover.CoverType);

                AppendCacheBuster(mediaCover);
            }
        }

        public void ConvertToLocalStudioUrls(int studioId, IEnumerable<MediaCover> covers)
        {
            if (studioId == 0)
            {
                // Studio isn't in Whisparr yet, map via a proxy to circumvent referrer issues
                foreach (var mediaCover in covers)
                {
                    mediaCover.Url = _mediaCoverProxy.RegisterUrl(mediaCover.RemoteUrl);
                }

                return;
            }

            // Studio covers are written with an extension taken from the download's Content-Type
            // rather than from the cover type, so the folder has to be read to find out which.
            var extension = GetStudioCoverExtension(studioId);

            foreach (var mediaCover in covers)
            {
                if (mediaCover.CoverType == MediaCoverTypes.Unknown)
                {
                    continue;
                }

                mediaCover.Url = _configFileProvider.UrlBase + @"/MediaCover/studio/" + studioId + "/" + mediaCover.CoverType.ToString().ToLower() + extension;

                AppendCacheBuster(mediaCover);
            }
        }

        // Keyed on the remote URL rather than the file's modification time: our metadata sources
        // address images by content (a StashDB image UUID, a TPDB content hash), so the URL changes
        // when and only when the image does. A modification time changes whenever the file is
        // rewritten with identical bytes, and does not change until the local file catches up.
        private static void AppendCacheBuster(MediaCover mediaCover)
        {
            if (mediaCover.RemoteUrl.IsNotNullOrWhiteSpace())
            {
                mediaCover.Url += "?h=" + mediaCover.RemoteUrl.SHA256Hash()[..20];
            }
        }

        private string GetStudioCoverExtension(int studioId)
        {
            var folder = GetStudioCoverPath(studioId);

            if (!_diskProvider.FolderExists(folder))
            {
                return DefaultStudioCoverExtension;
            }

            var files = _diskProvider.GetFiles(folder, false).ToList();

            return files.Any() ? _diskProvider.GetFileInfo(files.First()).Extension : DefaultStudioCoverExtension;
        }

        private string GetMovieCoverPath(int movieId)
        {
            return Path.Combine(_coverRootFolder, "movie", movieId.ToString());
        }

        private string GetPerformerCoverPath(int performerId)
        {
            return Path.Combine(_coverRootFolder, "performer", performerId.ToString());
        }

        private string GetStudioCoverPath(int studioId)
        {
            return Path.Combine(_coverRootFolder, "studio", studioId.ToString());
        }

        private bool EnsureCovers(Movie movie)
        {
            var updated = false;
            var toResize = new List<Tuple<MediaCover, bool>>();

            foreach (var cover in movie.MovieMetadata.Value.Images)
            {
                if (cover.CoverType == MediaCoverTypes.Unknown)
                {
                    continue;
                }

                var fileName = GetMovieCoverPath(movie.Id, cover.CoverType);
                var alreadyExists = false;

                try
                {
                    alreadyExists = _coverExistsSpecification.AlreadyExists(cover.RemoteUrl, fileName);

                    if (!alreadyExists)
                    {
                        DownloadCover(movie, cover);
                        updated = true;
                    }
                }
                catch (HttpException e)
                {
                    _logger.Warn("Couldn't download media cover for {0}. {1}", movie, e.Message);
                }
                catch (WebException e)
                {
                    _logger.Warn("Couldn't download media cover for {0}. {1}", movie, e.Message);
                }
                catch (Exception e)
                {
                    _logger.Error(e, "Couldn't download media cover for {0}", movie);
                }

                toResize.Add(Tuple.Create(cover, alreadyExists));
            }

            try
            {
                _semaphore.Wait();

                foreach (var tuple in toResize)
                {
                    EnsureResizedCovers(movie, tuple.Item1, !tuple.Item2);
                }
            }
            finally
            {
                _semaphore.Release();
            }

            return updated;
        }

        private bool EnsureCovers(Studio studio)
        {
            var updated = false;
            var toResize = new List<Tuple<MediaCover, bool>>();

            foreach (var cover in studio.Images)
            {
                if (cover.CoverType == MediaCoverTypes.Unknown)
                {
                    continue;
                }

                var fileName = GetStudioCoverPath(studio.Id, cover.CoverType);
                var alreadyExists = false;

                try
                {
                    alreadyExists = _coverExistsSpecification.AlreadyExists(cover.RemoteUrl, fileName);

                    if (!alreadyExists)
                    {
                        DownloadCover(studio, cover);
                        updated = true;
                    }
                }
                catch (HttpException e)
                {
                    _logger.Warn("Couldn't download media cover for {0}. {1}", studio, e.Message);
                }
                catch (WebException e)
                {
                    _logger.Warn("Couldn't download media cover for {0}. {1}", studio, e.Message);
                }
                catch (Exception e)
                {
                    _logger.Error(e, "Couldn't download media cover for {0}", studio);
                }

                toResize.Add(Tuple.Create(cover, alreadyExists));
            }

            try
            {
                _semaphore.Wait();

                foreach (var tuple in toResize)
                {
                    EnsureResizedCovers(studio, tuple.Item1, !tuple.Item2);
                }
            }
            finally
            {
                _semaphore.Release();
            }

            return updated;
        }

        private bool EnsureCovers(Performer performer)
        {
            var updated = false;
            var toResize = new List<Tuple<MediaCover, bool>>();

            foreach (var cover in performer.Images)
            {
                if (cover.CoverType == MediaCoverTypes.Unknown)
                {
                    continue;
                }

                var fileName = GetPerformerCoverPath(performer.Id, cover.CoverType);
                var alreadyExists = false;

                try
                {
                    alreadyExists = _coverExistsSpecification.AlreadyExists(cover.RemoteUrl, fileName);

                    if (!alreadyExists)
                    {
                        DownloadCover(performer, cover);
                        updated = true;
                    }
                }
                catch (HttpException e)
                {
                    _logger.Warn("Couldn't download media cover for {0}. {1}", performer, e.Message);
                }
                catch (WebException e)
                {
                    _logger.Warn("Couldn't download media cover for {0}. {1}", performer, e.Message);
                }
                catch (Exception e)
                {
                    _logger.Error(e, "Couldn't download media cover for {0}", performer);
                }

                toResize.Add(Tuple.Create(cover, alreadyExists));
            }

            try
            {
                _semaphore.Wait();

                foreach (var tuple in toResize)
                {
                    EnsureResizedCovers(performer, tuple.Item1, !tuple.Item2);
                }
            }
            finally
            {
                _semaphore.Release();
            }

            return updated;
        }

        private void DownloadCover(Movie movie, MediaCover cover)
        {
            var fileName = GetMovieCoverPath(movie.Id, cover.CoverType);

            _logger.Trace("Downloading {0} for {1} {2}", cover.CoverType, movie.ToString(), cover.RemoteUrl);
            _httpClient.DownloadFile(cover.RemoteUrl, fileName);
        }

        private void DownloadCover(Performer performer, MediaCover cover)
        {
            var fileName = GetPerformerCoverPath(performer.Id, cover.CoverType);

            _logger.Trace("Downloading {0} for {1} {2}", cover.CoverType, performer.ToString(), cover.RemoteUrl);
            _httpClient.DownloadFile(cover.RemoteUrl, fileName);
        }

        private void DownloadCover(Studio studio, MediaCover cover)
        {
            var req = new HttpRequest(cover.RemoteUrl);
            _logger.Trace("Downloading {0} for {1} {2}", cover.CoverType, studio.ToString(), cover.RemoteUrl);
            var imageResponse = _httpClient.Execute(req);
            var extension = imageResponse.Headers.ContentType switch
            {
                "image/svg+xml" => ".svg",
                "image/png" => ".png",
                "image/jpeg " => ".jpg",
                _ => ".png",
            };
            var filePath = GetStudioCoverPath(studio.Id);
            filePath = Path.Join(filePath, cover.CoverType.ToString().ToLower() + extension);
            var fileInfo = _diskProvider.GetFileInfo(filePath);
            if (fileInfo.Directory != null && !fileInfo.Directory.Exists)
            {
                fileInfo.Directory.Create();
            }

            _logger.Trace("Writing studio cover to {0}", filePath);
            File.WriteAllBytes(filePath, imageResponse.ResponseData);
        }

        private bool RemoteUrlHasExtension(MediaCover cover)
        {
            var url = cover.RemoteUrl.Split('?')[0]; // ignore URL params
            url = url.Split('/').Last();
            var extension = url.Contains('.') ? url.Substring(url.LastIndexOf('.')) : "";
            if (extension.Length > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        private void EnsureResizedCovers(Movie movie, MediaCover cover, bool forceResize)
        {
            int[] heights;

            switch (cover.CoverType)
            {
                default:
                    return;

                case MediaCoverTypes.Poster:
                case MediaCoverTypes.Headshot:
                    heights = new[] { 500, 250 };
                    break;

                case MediaCoverTypes.Banner:
                    heights = new[] { 70, 35 };
                    break;

                case MediaCoverTypes.Fanart:
                case MediaCoverTypes.Screenshot:
                    heights = new[] { 360, 180 };
                    break;
            }

            foreach (var height in heights)
            {
                var mainFileName = GetMovieCoverPath(movie.Id, cover.CoverType);
                var resizeFileName = GetMovieCoverPath(movie.Id, cover.CoverType, height);

                if (forceResize || !_diskProvider.FileExists(resizeFileName) || _diskProvider.GetFileSize(resizeFileName) == 0)
                {
                    _logger.Debug("Resizing {0}-{1} for {2}", cover.CoverType, height, movie);

                    try
                    {
                        _resizer.Resize(mainFileName, resizeFileName, height);
                    }
                    catch
                    {
                        _logger.Debug("Couldn't resize media cover {0}-{1} for {2}, using full size image instead.", cover.CoverType, height, movie);
                    }
                }
            }
        }

        private void EnsureResizedCovers(Studio studio, MediaCover cover, bool forceResize)
        {
            int[] heights;

            switch (cover.CoverType)
            {
                default:
                    return;

                case MediaCoverTypes.Poster:
                case MediaCoverTypes.Headshot:
                    heights = new[] { 500, 250 };
                    break;

                case MediaCoverTypes.Banner:
                    heights = new[] { 70, 35 };
                    break;

                case MediaCoverTypes.Fanart:
                case MediaCoverTypes.Screenshot:
                    heights = new[] { 360, 180 };
                    break;
            }

            foreach (var height in heights)
            {
                var mainFileName = GetStudioCoverPath(studio.Id, cover.CoverType);
                var resizeFileName = GetStudioCoverPath(studio.Id, cover.CoverType, height);

                if (forceResize || !_diskProvider.FileExists(resizeFileName) || _diskProvider.GetFileSize(resizeFileName) == 0)
                {
                    _logger.Debug("Resizing {0}-{1} for {2}", cover.CoverType, height, studio);

                    try
                    {
                        _resizer.Resize(mainFileName, resizeFileName, height);
                    }
                    catch
                    {
                        _logger.Debug("Couldn't resize media cover {0}-{1} for {2}, using full size image instead.", cover.CoverType, height, studio);
                    }
                }
            }
        }

        private void EnsureResizedCovers(Performer performer, MediaCover cover, bool forceResize)
        {
            int[] heights;

            switch (cover.CoverType)
            {
                default:
                    return;

                case MediaCoverTypes.Poster:
                case MediaCoverTypes.Headshot:
                    heights = new[] { 500, 250 };
                    break;

                case MediaCoverTypes.Banner:
                    heights = new[] { 70, 35 };
                    break;

                case MediaCoverTypes.Fanart:
                case MediaCoverTypes.Screenshot:
                    heights = new[] { 360, 180 };
                    break;
            }

            foreach (var height in heights)
            {
                var mainFileName = GetPerformerCoverPath(performer.Id, cover.CoverType);
                var resizeFileName = GetPerformerCoverPath(performer.Id, cover.CoverType, height);

                if (forceResize || !_diskProvider.FileExists(resizeFileName) || _diskProvider.GetFileSize(resizeFileName) == 0)
                {
                    _logger.Debug("Resizing {0}-{1} for {2}", cover.CoverType, height, performer);

                    try
                    {
                        _resizer.Resize(mainFileName, resizeFileName, height);
                    }
                    catch
                    {
                        _logger.Debug("Couldn't resize media cover {0}-{1} for {2}, using full size image instead.", cover.CoverType, height, performer);
                    }
                }
            }
        }

        private string GetExtension(MediaCoverTypes coverType)
        {
            return coverType switch
            {
                MediaCoverTypes.Clearlogo => ".png",
                _ => ".jpg"
            };
        }

        public void Handle(MovieUpdatedEvent message)
        {
            var sequence = Interlocked.Increment(ref _movieCoverSequence);
            CancellationToken intakeCancellation;

            lock (_movieCoverQueueLock)
            {
                if (_movieCoverLifecycleState != MovieCoverLifecycleState.Running)
                {
                    _logger.Debug("Ignoring movie cover update for {0} because the media cover queue is stopping", message.Movie.Id);
                    return;
                }

                if (_deletedMovieCoversWithActiveWork.Contains(message.Movie.Id))
                {
                    return;
                }

                if (_movieCoverHighWaterSequences.TryGetValue(message.Movie.Id, out var highWaterSequence) && sequence <= highWaterSequence)
                {
                    return;
                }

                if (_pendingMovieCovers.TryGetValue(message.Movie.Id, out var pending))
                {
                    if (sequence > pending.Sequence)
                    {
                        _pendingMovieCovers[message.Movie.Id] = new PendingMovieCover(message.Movie, sequence);
                        _movieCoverHighWaterSequences[message.Movie.Id] = sequence;
                    }

                    return;
                }

                _movieCoverHighWaterSequences[message.Movie.Id] = sequence;
                _movieCoverProducerCounts[message.Movie.Id] = _movieCoverProducerCounts.GetValueOrDefault(message.Movie.Id) + 1;
                intakeCancellation = _movieCoverIntakeCancellation.Token;
            }

            try
            {
                Interlocked.Increment(ref _movieCoverBlockedProducerCount);

                try
                {
                    _movieCoverQueueSlots.Wait(intakeCancellation);
                }
                catch (OperationCanceledException)
                {
                    return;
                }
                finally
                {
                    Interlocked.Decrement(ref _movieCoverBlockedProducerCount);
                }

                MovieCoverQueueTest.InvokeSlotAcquired(message.Movie, sequence);

                lock (_movieCoverQueueLock)
                {
                    if (_movieCoverLifecycleState != MovieCoverLifecycleState.Running)
                    {
                        _movieCoverQueueSlots.Release();
                        return;
                    }

                    if (_movieCoverHighWaterSequences.TryGetValue(message.Movie.Id, out var highWaterSequence) && sequence < highWaterSequence)
                    {
                        _movieCoverQueueSlots.Release();
                        return;
                    }

                    if (_pendingMovieCovers.TryGetValue(message.Movie.Id, out var pending))
                    {
                        if (sequence > pending.Sequence)
                        {
                            _pendingMovieCovers[message.Movie.Id] = new PendingMovieCover(message.Movie, sequence);
                            _movieCoverHighWaterSequences[message.Movie.Id] = sequence;
                        }

                        _movieCoverQueueSlots.Release();
                        return;
                    }

                    _pendingMovieCovers.Add(message.Movie.Id, new PendingMovieCover(message.Movie, sequence));
                    _movieCoverHighWaterSequences[message.Movie.Id] = sequence;
                    _movieCoverQueue.Enqueue(message.Movie.Id);
                    _queuedMovieCovers.Release();
                }
            }
            finally
            {
                lock (_movieCoverQueueLock)
                {
                    var producerCount = _movieCoverProducerCounts[message.Movie.Id] - 1;
                    if (producerCount == 0)
                    {
                        _movieCoverProducerCounts.Remove(message.Movie.Id);

                        if (!_activeMovieCoverWorkerCounts.ContainsKey(message.Movie.Id) &&
                            _deletedMovieCoversWithActiveWork.Contains(message.Movie.Id))
                        {
                            ClearDeletedMovieCoverState(message.Movie.Id);
                        }
                    }
                    else
                    {
                        _movieCoverProducerCounts[message.Movie.Id] = producerCount;
                    }
                }
            }
        }

        public void Handle(ApplicationStartedEvent message)
        {
            lock (_movieCoverQueueLock)
            {
                if (_movieCoverLifecycleState != MovieCoverLifecycleState.NotStarted)
                {
                    return;
                }

                _movieCoverLifecycleState = MovieCoverLifecycleState.Running;

                _logger.Info("Starting {0} media cover workers with a queue capacity of {1}", _movieCoverWorkerCount, MovieCoverQueueCapacity);

                for (var i = 0; i < _movieCoverWorkerCount; i++)
                {
                    var thread = new Thread(ProcessMovieCoverQueue)
                    {
                        IsBackground = true,
                        Name = $"MediaCover-{i + 1}"
                    };

                    _movieCoverWorkers.Add(thread);
                    thread.Start();
                }
            }
        }

        public void Handle(ApplicationShutdownRequested message)
        {
            Thread[] workers;
            int abandonedMovieCovers;

            lock (_movieCoverQueueLock)
            {
                if (_movieCoverLifecycleState != MovieCoverLifecycleState.Running)
                {
                    return;
                }

                _movieCoverLifecycleState = MovieCoverLifecycleState.Stopping;
                _movieCoverIntakeCancellation.Cancel();
                workers = _movieCoverWorkers.ToArray();
                abandonedMovieCovers = _pendingMovieCovers.Count;
                _movieCoverQueue.Clear();
                _pendingMovieCovers.Clear();
                _movieCoverHighWaterSequences.Clear();
            }

            if (abandonedMovieCovers > 0)
            {
                _movieCoverQueueSlots.Release(abandonedMovieCovers);
            }

            _queuedMovieCovers.Release(workers.Length);

            var shutdownTimer = Stopwatch.StartNew();
            var allWorkersStopped = true;

            foreach (var worker in workers)
            {
                var remaining = _movieCoverShutdownTimeout - shutdownTimer.Elapsed;

                if (remaining <= TimeSpan.Zero || !worker.Join(remaining))
                {
                    allWorkersStopped = false;
                    break;
                }
            }

            if (allWorkersStopped)
            {
                lock (_movieCoverQueueLock)
                {
                    _movieCoverWorkers.Clear();
                    _movieCoverLifecycleState = MovieCoverLifecycleState.Stopped;
                }
            }
            else
            {
                lock (_movieCoverQueueLock)
                {
                    ReconcileShutdown();
                }

                _logger.Warn("Media cover shutdown deadline elapsed with {0} worker(s) still running", workers.Count(v => v.IsAlive));
            }
        }

        private void ProcessMovieCoverQueue()
        {
            try
            {
                while (true)
                {
                    _queuedMovieCovers.Wait();

                    int movieId;
                    Movie movie;

                    lock (_movieCoverQueueLock)
                    {
                        if (_movieCoverQueue.Count == 0)
                        {
                            if (_movieCoverLifecycleState != MovieCoverLifecycleState.Running)
                            {
                                return;
                            }

                            continue;
                        }

                        movieId = _movieCoverQueue.Dequeue();
                        movie = _pendingMovieCovers[movieId].Movie;
                        _pendingMovieCovers.Remove(movieId);
                        _activeMovieCoverWorkerCounts[movieId] = _activeMovieCoverWorkerCounts.GetValueOrDefault(movieId) + 1;
                        _movieCoverQueueSlots.Release();
                    }

                    try
                    {
                        HandleAsync(new MovieUpdatedEvent(movie));
                    }
                    catch (Exception ex)
                    {
                        _logger.Error(ex, "Error processing media covers for movie {0}", movie.Id);
                    }
                    finally
                    {
                        CompleteMovieCoverProcessing(movieId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unknown error in media cover processing thread");
            }
            finally
            {
                lock (_movieCoverQueueLock)
                {
                    ReconcileShutdown(Thread.CurrentThread);
                }
            }
        }

        private void CompleteMovieCoverProcessing(int movieId)
        {
            bool deleteRecreatedCovers;

            lock (_movieCoverQueueLock)
            {
                var workerCount = _activeMovieCoverWorkerCounts[movieId] - 1;
                if (workerCount == 0)
                {
                    _activeMovieCoverWorkerCounts.Remove(movieId);
                }
                else
                {
                    _activeMovieCoverWorkerCounts[movieId] = workerCount;
                }

                deleteRecreatedCovers = _deletedMovieCoversWithActiveWork.Contains(movieId);
            }

            if (!deleteRecreatedCovers)
            {
                return;
            }

            DeleteMovieCoverFolder(movieId);

            lock (_movieCoverQueueLock)
            {
                if (!_activeMovieCoverWorkerCounts.ContainsKey(movieId) &&
                    !_movieCoverProducerCounts.ContainsKey(movieId))
                {
                    ClearDeletedMovieCoverState(movieId);
                }
            }
        }

        private void DeleteMovieCoverFolder(int movieId)
        {
            var path = GetMovieCoverPath(movieId);
            if (_diskProvider.FolderExists(path))
            {
                _diskProvider.DeleteFolder(path, true);
            }
        }

        private void ReconcileShutdown(Thread exitingWorker = null)
        {
            if (_movieCoverLifecycleState != MovieCoverLifecycleState.Stopping ||
                _movieCoverWorkers.Any(worker => worker != exitingWorker && worker.IsAlive))
            {
                return;
            }

            _movieCoverWorkers.Clear();
            _movieCoverLifecycleState = MovieCoverLifecycleState.Stopped;
        }

        private enum MovieCoverLifecycleState
        {
            NotStarted,
            Running,
            Stopping,
            Stopped
        }

        internal sealed class MovieCoverQueueTestSeam
        {
            private readonly MediaCoverService _owner;

            internal MovieCoverQueueTestSeam(MediaCoverService owner)
            {
                _owner = owner;
                SlotAcquired = (_, _) => { };
            }

            internal TimeSpan ShutdownTimeout
            {
                get => _owner._movieCoverShutdownTimeout;
                set => _owner._movieCoverShutdownTimeout = value;
            }

            internal Action<Movie, long> SlotAcquired { get; set; }
            internal int BlockedProducerCount => Volatile.Read(ref _owner._movieCoverBlockedProducerCount);

            internal int PendingUniqueCount
            {
                get
                {
                    lock (_owner._movieCoverQueueLock)
                    {
                        return _owner._pendingMovieCovers.Count;
                    }
                }
            }

            internal bool HasHighWaterSequence(int movieId)
            {
                lock (_owner._movieCoverQueueLock)
                {
                    return _owner._movieCoverHighWaterSequences.ContainsKey(movieId);
                }
            }

            internal bool Stopping
            {
                get
                {
                    lock (_owner._movieCoverQueueLock)
                    {
                        return _owner._movieCoverLifecycleState == MovieCoverLifecycleState.Stopping;
                    }
                }
            }

            internal int WorkerPoolSize
            {
                get
                {
                    lock (_owner._movieCoverQueueLock)
                    {
                        return _owner._movieCoverWorkers.Count;
                    }
                }
            }

            internal int WorkerCountAlive
            {
                get
                {
                    lock (_owner._movieCoverQueueLock)
                    {
                        return _owner._movieCoverWorkers.Count(worker => worker.IsAlive);
                    }
                }
            }

            internal void InvokeSlotAcquired(Movie movie, long sequence)
            {
                try
                {
                    SlotAcquired(movie, sequence);
                }
                catch (Exception ex)
                {
                    _owner._logger.Error(ex, "Error in media cover queue test hook");
                }
            }
        }

        private sealed class PendingMovieCover
        {
            public PendingMovieCover(Movie movie, long sequence)
            {
                Movie = movie;
                Sequence = sequence;
            }

            public Movie Movie { get; }
            public long Sequence { get; }
        }

        public void HandleAsync(MovieUpdatedEvent message)
        {
            var updated = EnsureCovers(message.Movie);
            _eventAggregator.PublishEvent(new MediaCoversUpdatedEvent(message.Movie, updated));
        }

        public void HandleAsync(PerformerUpdatedEvent message)
        {
            var updated = EnsureCovers(message.Performer);
        }

        public void HandleAsync(StudioUpdatedEvent message)
        {
            var updated = EnsureCovers(message.Studio);
        }

        private void ClearDeletedMovieCoverState(int movieId)
        {
            _deletedMovieCoversWithActiveWork.Remove(movieId);
            _movieCoverHighWaterSequences.Remove(movieId);
        }

        private void PurgeDeletedMovieCovers(HashSet<int> deletedMovieIds)
        {
            lock (_movieCoverQueueLock)
            {
                var retainedMovieCoverIds = _movieCoverQueue.Where(movieId => !deletedMovieIds.Contains(movieId)).ToArray();
                var removedQueuedMovieCovers = _movieCoverQueue.Count - retainedMovieCoverIds.Length;
                _movieCoverQueue.Clear();

                foreach (var movieId in retainedMovieCoverIds)
                {
                    _movieCoverQueue.Enqueue(movieId);
                }

                foreach (var movieId in deletedMovieIds)
                {
                    _pendingMovieCovers.Remove(movieId);

                    if (_movieCoverProducerCounts.ContainsKey(movieId) || _activeMovieCoverWorkerCounts.ContainsKey(movieId))
                    {
                        _movieCoverHighWaterSequences[movieId] = Interlocked.Increment(ref _movieCoverSequence);
                        _deletedMovieCoversWithActiveWork.Add(movieId);
                    }
                    else
                    {
                        ClearDeletedMovieCoverState(movieId);
                    }
                }

                // A worker may already have consumed this permit while waiting for the
                // queue lock; its empty-queue path absorbs that wake-up instead.
                for (var i = 0; i < removedQueuedMovieCovers; i++)
                {
                    _queuedMovieCovers.Wait(0);
                }

                if (removedQueuedMovieCovers > 0)
                {
                    _movieCoverQueueSlots.Release(removedQueuedMovieCovers);
                }
            }
        }

        public void HandleAsync(MoviesDeletedEvent message)
        {
            PurgeDeletedMovieCovers(message.Movies.Select(movie => movie.Id).ToHashSet());

            foreach (var movie in message.Movies)
            {
                DeleteMovieCoverFolder(movie.Id);
            }
        }

        public void HandleAsync(PerformersDeletedEvent message)
        {
            foreach (var performer in message.Performers)
            {
                var path = GetPerformerCoverPath(performer.Id);
                if (_diskProvider.FolderExists(path))
                {
                    _diskProvider.DeleteFolder(path, true);
                }
            }
        }

        public void HandleAsync(StudiosDeletedEvent message)
        {
            foreach (var studio in message.Studios)
            {
                var path = GetStudioCoverPath(studio.Id);
                if (_diskProvider.FolderExists(path))
                {
                    _diskProvider.DeleteFolder(path, true);
                }
            }
        }
    }
}
