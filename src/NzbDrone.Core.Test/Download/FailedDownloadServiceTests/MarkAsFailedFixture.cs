using System;
using System.Collections.Generic;
using System.Net;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.History;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.Download.FailedDownloadServiceTests
{
    [TestFixture]
    public class MarkAsFailedFixture : CoreTest<FailedDownloadService>
    {
        private const string DownloadId = "abc123";

        private MovieHistory _grabbed;
        private MovieHistory _imported;

        [SetUp]
        public void Setup()
        {
            _grabbed = GivenHistory(1, MovieHistoryEventType.Grabbed, DownloadId);
            _imported = GivenHistory(2, MovieHistoryEventType.DownloadFolderImported, DownloadId);

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.Find(DownloadId, MovieHistoryEventType.Grabbed))
                  .Returns(new List<MovieHistory> { _grabbed });
        }

        [Test]
        public void should_mark_a_grab_as_failed()
        {
            Subject.MarkAsFailed(_grabbed.Id);

            VerifyFailed(_grabbed);
        }

        [Test]
        public void should_mark_the_grab_as_failed_when_another_history_item_of_the_download_is_chosen()
        {
            Subject.MarkAsFailed(_imported.Id);

            VerifyFailed(_grabbed);
        }

        [Test]
        public void should_mark_a_grab_without_a_download_id_as_failed()
        {
            var grabbed = GivenHistory(3, MovieHistoryEventType.Grabbed, null);

            Subject.MarkAsFailed(grabbed.Id, skipRedownload: true);

            VerifyFailed(grabbed, skipRedownload: true);
        }

        [Test]
        public void should_refuse_a_history_item_that_was_not_grabbed_and_has_no_download_id()
        {
            var imported = GivenHistory(3, MovieHistoryEventType.DownloadFolderImported, null);

            Action act = () => Subject.MarkAsFailed(imported.Id);

            act.Should().Throw<NzbDroneClientException>().Which.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            VerifyNotFailed();
        }

        [Test]
        public void should_refuse_a_download_that_has_no_grab()
        {
            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.Find(DownloadId, MovieHistoryEventType.Grabbed))
                  .Returns(new List<MovieHistory>());

            Action act = () => Subject.MarkAsFailed(_imported.Id);

            act.Should().Throw<NzbDroneClientException>().Which.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            VerifyNotFailed();
        }

        [Test]
        public void should_mark_a_queue_item_as_failed_against_its_grab()
        {
            Subject.MarkAsFailed(GivenTrackedDownload(DownloadId), skipRedownload: true);

            VerifyFailed(_grabbed, skipRedownload: true);
        }

        // The queue has already removed the item from the client, so this must not throw.
        [Test]
        public void should_only_warn_for_a_queue_item_that_was_not_grabbed()
        {
            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.Find("unknown", MovieHistoryEventType.Grabbed))
                  .Returns(new List<MovieHistory>());

            Subject.MarkAsFailed(GivenTrackedDownload("unknown"));

            VerifyNotFailed();
            ExceptionVerification.ExpectedWarns(1);
        }

        private static TrackedDownload GivenTrackedDownload(string downloadId)
        {
            return new TrackedDownload
            {
                DownloadItem = new DownloadClientItem { DownloadId = downloadId, Title = "Some.Download" }
            };
        }

        private MovieHistory GivenHistory(int id, MovieHistoryEventType eventType, string downloadId)
        {
            var history = Builder<MovieHistory>.CreateNew()
                                               .With(h => h.Id = id)
                                               .With(h => h.EventType = eventType)
                                               .With(h => h.DownloadId = downloadId)
                                               .With(h => h.SourceTitle = $"Title{id}")
                                               .With(h => h.Data = new Dictionary<string, string>())
                                               .Build();

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.Get(id))
                  .Returns(history);

            return history;
        }

        private void VerifyFailed(MovieHistory history, bool skipRedownload = false)
        {
            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.Is<DownloadFailedEvent>(e => e.SourceTitle == history.SourceTitle && e.SkipRedownload == skipRedownload)), Times.Once());
        }

        private void VerifyNotFailed()
        {
            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<DownloadFailedEvent>()), Times.Never());
        }
    }
}
