using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.HealthCheck;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.HealthCheck
{
    [TestFixture]
    public class HealthCheckFixture : CoreTest
    {
        private const string WikiRoot = "https://wiki.servarr.com/";

        [TestCase("I blew up because of some weird user mistake", null, WikiRoot + "whisparr/system#i-blew-up-because-of-some-weird-user-mistake")]
        [TestCase("I blew up because of some weird user mistake", "#my-health-check", WikiRoot + "whisparr/system#my-health-check")]
        [TestCase("I blew up because of some weird user mistake", "custom-page#my-health-check", WikiRoot + "whisparr/custom-page#my-health-check")]
        public void should_format_wiki_url(string message, string wikiFragment, string expectedUrl)
        {
            var subject = new NzbDrone.Core.HealthCheck.HealthCheck(typeof(HealthCheckBase), HealthCheckResult.Warning, HealthCheckReason.ServerNotification, message, wikiFragment);

            subject.WikiUrl.Should().Be(expectedUrl);
        }

        [Test]
        public void should_set_reason_from_constructor()
        {
            var subject = new NzbDrone.Core.HealthCheck.HealthCheck(typeof(HealthCheckBase), HealthCheckResult.Error, HealthCheckReason.RootFolderMissing, "message");

            subject.Reason.Should().Be(HealthCheckReason.RootFolderMissing);
        }

        [Test]
        public void should_report_no_reason_on_the_ok_constructor()
        {
            var subject = new NzbDrone.Core.HealthCheck.HealthCheck(typeof(HealthCheckBase));

            subject.Type.Should().Be(HealthCheckResult.Ok);
            subject.Reason.Should().Be(HealthCheckReason.None);
        }
    }
}
