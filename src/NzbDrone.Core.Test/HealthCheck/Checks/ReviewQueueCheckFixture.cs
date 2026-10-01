using System.Collections.Generic;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.HealthCheck;
using NzbDrone.Core.HealthCheck.Checks;
using NzbDrone.Core.Localization;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.HealthCheck.Checks
{
    [TestFixture]
    public class ReviewQueueCheckFixture : CoreTest<ReviewQueueCheck>
    {
        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<ILocalizationService>()
                  .Setup(s => s.GetLocalizedString("ReviewQueueCheckSingleMessage"))
                  .Returns("1 release is awaiting review");

            Mocker.GetMock<ILocalizationService>()
                  .Setup(s => s.GetLocalizedString("ReviewQueueCheckMultipleMessage", It.IsAny<Dictionary<string, object>>()))
                  .Returns((string _, Dictionary<string, object> tokens) => $"{tokens["count"]} releases are awaiting review");
        }

        private void GivenPending(int count)
        {
            Mocker.GetMock<IReviewService>()
                  .Setup(s => s.PendingCount())
                  .Returns(count);
        }

        [Test]
        public void should_return_ok_when_nothing_awaits_review()
        {
            GivenPending(0);

            Subject.Check().ShouldBeOk();
        }

        [Test]
        public void should_return_notice_for_single_release()
        {
            GivenPending(1);

            Subject.Check().ShouldBeNotice("1 release is awaiting review", HealthCheckReason.ReviewQueuePending);
        }

        [Test]
        public void should_return_notice_with_count()
        {
            GivenPending(7);

            Subject.Check().ShouldBeNotice("7 releases are awaiting review", HealthCheckReason.ReviewQueuePending);
        }
    }
}
