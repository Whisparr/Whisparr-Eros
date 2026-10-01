using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Notifications;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.NotificationTests
{
    [TestFixture]
    public class ReviewNeededNotificationFixture : CoreTest<NotificationService>
    {
        private Mock<INotification> _notification;
        private NotificationDefinition _definition;
        private Movie _scene;
        private Movie _taggedScene;

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

            _scene = new Movie { Id = 4, Title = "Poolside", Tags = new HashSet<int>() };
            _taggedScene = new Movie { Id = 5, Title = "Locker Room", Tags = new HashSet<int> { 3 } };

            Mocker.GetMock<INotificationFactory>()
                  .Setup(v => v.OnReviewNeededEnabled(It.IsAny<bool>()))
                  .Returns(new List<INotification> { _notification.Object });

            Mocker.GetMock<IMovieService>()
                  .Setup(v => v.FindByIds(It.IsAny<List<int>>()))
                  .Returns(new List<Movie> { _scene, _taggedScene });
        }

        private static ReviewItem GivenItem(int id, string title, int movieId)
        {
            return new ReviewItem
            {
                Id = id,
                Title = title,
                MovieId = movieId,
                Candidates = new List<ReviewItemCandidate> { new () { MovieId = movieId } },
                Quality = new QualityModel(Quality.Unknown),
                Reason = ReviewReason.WeakMatch
            };
        }

        [Test]
        public void should_send_one_notification_for_the_whole_batch()
        {
            var items = new List<ReviewItem>
            {
                GivenItem(1, "Release One", _scene.Id),
                GivenItem(2, "Release Two", _taggedScene.Id)
            };

            ReviewNeededMessage sent = null;
            _notification.Setup(v => v.OnReviewNeeded(It.IsAny<ReviewNeededMessage>())).Callback<ReviewNeededMessage>(m => sent = m);

            Subject.Handle(new ReviewNeededEvent(items));

            _notification.Verify(v => v.OnReviewNeeded(It.IsAny<ReviewNeededMessage>()), Times.Once());

            sent.Releases.Should().HaveCount(2);
            sent.Releases.First().Movies.Should().ContainSingle().Which.Should().BeSameAs(_scene);
            sent.Message.Should().StartWith("2 releases are awaiting review");
            sent.Message.Should().Contain("Release One → Poolside");
        }

        [Test]
        public void should_only_include_releases_for_tagged_scenes()
        {
            _definition.Tags = new HashSet<int> { 3 };

            ReviewNeededMessage sent = null;
            _notification.Setup(v => v.OnReviewNeeded(It.IsAny<ReviewNeededMessage>())).Callback<ReviewNeededMessage>(m => sent = m);

            Subject.Handle(new ReviewNeededEvent(new List<ReviewItem> { GivenItem(1, "Release One", _scene.Id), GivenItem(2, "Release Two", _taggedScene.Id) }));

            sent.Releases.Should().ContainSingle(r => r.Title == "Release Two");
            sent.Message.Should().StartWith("1 release is awaiting review");
        }

        [Test]
        public void should_not_send_when_no_release_matches_the_tags()
        {
            _definition.Tags = new HashSet<int> { 9 };

            Subject.Handle(new ReviewNeededEvent(new List<ReviewItem> { GivenItem(1, "Release One", _scene.Id) }));

            _notification.Verify(v => v.OnReviewNeeded(It.IsAny<ReviewNeededMessage>()), Times.Never());
        }

        [Test]
        public void should_list_at_most_ten_releases()
        {
            var items = Enumerable.Range(1, 12).Select(i => GivenItem(i, "Release " + i, _scene.Id)).ToList();

            ReviewNeededMessage sent = null;
            _notification.Setup(v => v.OnReviewNeeded(It.IsAny<ReviewNeededMessage>())).Callback<ReviewNeededMessage>(m => sent = m);

            Subject.Handle(new ReviewNeededEvent(items));

            sent.Releases.Should().HaveCount(12);
            sent.Message.Should().Contain("and 2 more");
            sent.Message.Should().NotContain("Release 11 ");
        }
    }
}
