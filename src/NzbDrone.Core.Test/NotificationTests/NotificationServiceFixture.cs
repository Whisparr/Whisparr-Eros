using System.Collections.Generic;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Notifications;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.NotificationTests
{
    [TestFixture]
    public class NotificationServiceFixture : CoreTest<NotificationService>
    {
        private Mock<INotification> _notification;
        private NotificationDefinition _definition;

        [SetUp]
        public void Setup()
        {
            _definition = new NotificationDefinition
            {
                Id = 1,
                Name = "Test Notification",
                Tags = new HashSet<int>()
            };

            _notification = new Mock<INotification>();
            _notification.SetupGet(v => v.Definition).Returns(_definition);

            Mocker.GetMock<INotificationFactory>()
                  .Setup(v => v.OnManualInteractionEnabled(It.IsAny<bool>()))
                  .Returns(new List<INotification> { _notification.Object });
        }

        private ManualInteractionRequiredEvent GivenEvent(RemoteMovie remoteMovie)
        {
            var trackedDownload = new TrackedDownload
            {
                DownloadItem = new DownloadClientItem
                {
                    Title = "Some.Unknown.Release-Group",
                    TotalSize = 1234
                },
                RemoteMovie = remoteMovie
            };

            return new ManualInteractionRequiredEvent(trackedDownload, null);
        }

        [Test]
        public void should_send_notification_for_unknown_movie_when_no_tags_are_set()
        {
            Subject.Handle(GivenEvent(null));

            _notification.Verify(v => v.OnManualInteractionRequired(It.IsAny<ManualInteractionRequiredMessage>()), Times.Once());
        }

        [Test]
        public void should_not_send_notification_for_unknown_movie_when_tags_are_set()
        {
            _definition.Tags = new HashSet<int> { 1 };

            Subject.Handle(GivenEvent(null));

            _notification.Verify(v => v.OnManualInteractionRequired(It.IsAny<ManualInteractionRequiredMessage>()), Times.Never());
        }

        [Test]
        public void should_send_notification_when_parsed_movie_info_is_null()
        {
            var remoteMovie = new RemoteMovie
            {
                Movie = new Movie { Id = 1, Tags = new HashSet<int>() },
                ParsedMovieInfo = null
            };

            Subject.Handle(GivenEvent(remoteMovie));

            _notification.Verify(v => v.OnManualInteractionRequired(It.IsAny<ManualInteractionRequiredMessage>()), Times.Once());
        }
    }
}
