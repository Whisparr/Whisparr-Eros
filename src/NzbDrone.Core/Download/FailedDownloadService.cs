using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.History;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.Download
{
    public interface IFailedDownloadService
    {
        void MarkAsFailed(int historyId, bool skipRedownload = false);
        void MarkAsFailed(TrackedDownload trackedDownload, bool skipRedownload = false);
        void Check(TrackedDownload trackedDownload);
        void ProcessFailed(TrackedDownload trackedDownload);
    }

    public class FailedDownloadService : IFailedDownloadService
    {
        private readonly IHistoryService _historyService;
        private readonly IEventAggregator _eventAggregator;
        private readonly Logger _logger;

        public FailedDownloadService(IHistoryService historyService,
                                     IEventAggregator eventAggregator,
                                     Logger logger)
        {
            _historyService = historyService;
            _eventAggregator = eventAggregator;
            _logger = logger;
        }

        public void MarkAsFailed(int historyId, bool skipRedownload = false)
        {
            var history = _historyService.Get(historyId);

            var downloadId = history.DownloadId;

            if (downloadId.IsNullOrWhiteSpace())
            {
                if (history.EventType != MovieHistoryEventType.Grabbed)
                {
                    throw new NzbDroneClientException(HttpStatusCode.BadRequest, "Unable to mark download as failed, history item was not grabbed and has no download ID");
                }

                PublishDownloadFailedEvent(history, "Manually marked as failed", skipRedownload: skipRedownload);

                return;
            }

            // The failure is recorded against the download's grab, whichever of its history items was chosen,
            // so the blocklist gets the grabbed release rather than, say, an import's details.
            var grabbedHistory = history.EventType == MovieHistoryEventType.Grabbed
                ? history
                : GetGrabbedHistory(downloadId).FirstOrDefault();

            if (grabbedHistory == null)
            {
                throw new NzbDroneClientException(HttpStatusCode.BadRequest, "Unable to mark download as failed, no grabbed history available");
            }

            PublishDownloadFailedEvent(grabbedHistory, "Manually marked as failed", skipRedownload: skipRedownload);
        }

        public void MarkAsFailed(TrackedDownload trackedDownload, bool skipRedownload = false)
        {
            var history = GetGrabbedHistory(trackedDownload.DownloadItem.DownloadId);

            if (history.Any())
            {
                PublishDownloadFailedEvent(history[0], "Manually marked as failed", trackedDownload, skipRedownload: skipRedownload);

                return;
            }

            // Not thrown: the queue has usually removed the item from the client by now, and bulk
            // removal would stop part way through the selection.
            _logger.Warn("Unable to blocklist {0}, it was not grabbed by Whisparr", trackedDownload.DownloadItem.Title.ForLog());
        }

        public void Check(TrackedDownload trackedDownload)
        {
            // Only process tracked downloads that are still downloading or import is blocked (if they fail after attempting to be processed)
            if (trackedDownload.State != TrackedDownloadState.Downloading && trackedDownload.State != TrackedDownloadState.ImportBlocked)
            {
                return;
            }

            if (trackedDownload.DownloadItem.IsEncrypted ||
                trackedDownload.DownloadItem.Status == DownloadItemStatus.Failed)
            {
                var grabbedItems = GetGrabbedHistory(trackedDownload.DownloadItem.DownloadId);

                if (grabbedItems.Empty())
                {
                    trackedDownload.Warn(trackedDownload.DownloadItem.IsEncrypted ? "Download is encrypted and wasn't grabbed by Whisparr, skipping automatic download handling" : "Download has failed wasn't grabbed by Whisparr, skipping automatic download handling");
                    return;
                }

                trackedDownload.State = TrackedDownloadState.FailedPending;
            }
        }

        public void ProcessFailed(TrackedDownload trackedDownload)
        {
            if (trackedDownload.State != TrackedDownloadState.FailedPending)
            {
                return;
            }

            var grabbedItems = GetGrabbedHistory(trackedDownload.DownloadItem.DownloadId);

            if (grabbedItems.Empty())
            {
                return;
            }

            var failure = "Failed download detected";

            if (trackedDownload.DownloadItem.IsEncrypted)
            {
                failure = "Encrypted download detected";
            }
            else if (trackedDownload.DownloadItem.Status == DownloadItemStatus.Failed && trackedDownload.DownloadItem.Message.IsNotNullOrWhiteSpace())
            {
                failure = trackedDownload.DownloadItem.Message;
            }

            trackedDownload.State = TrackedDownloadState.Failed;
            PublishDownloadFailedEvent(grabbedItems[0], failure, trackedDownload);
        }

        private void PublishDownloadFailedEvent(MovieHistory historyItem, string message, TrackedDownload trackedDownload = null, bool skipRedownload = false)
        {
            Enum.TryParse(historyItem.Data.GetValueOrDefault(MovieHistory.RELEASE_SOURCE, ReleaseSourceType.Unknown.ToString()), out ReleaseSourceType releaseSource);

            var downloadFailedEvent = new DownloadFailedEvent
            {
                MovieId = historyItem.MovieId,
                Quality = historyItem.Quality,
                SourceTitle = historyItem.SourceTitle,
                DownloadClient = historyItem.Data.GetValueOrDefault(MovieHistory.DOWNLOAD_CLIENT),
                DownloadId = historyItem.DownloadId,
                Message = message,
                Data = historyItem.Data,
                TrackedDownload = trackedDownload,
                Languages = historyItem.Languages,
                SkipRedownload = skipRedownload,
                ReleaseSource = releaseSource,
            };

            _eventAggregator.PublishEvent(downloadFailedEvent);
        }

        private List<MovieHistory> GetGrabbedHistory(string downloadId)
        {
            // Sort by date so items are always in the same order
            return _historyService.Find(downloadId, MovieHistoryEventType.Grabbed)
                .OrderByDescending(h => h.Date)
                .ToList();
        }
    }
}
