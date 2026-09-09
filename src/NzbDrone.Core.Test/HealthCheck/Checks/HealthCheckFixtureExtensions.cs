using FluentAssertions;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.HealthCheck;

namespace NzbDrone.Core.Test.HealthCheck.Checks
{
    public static class HealthCheckFixtureExtensions
    {
        public static void ShouldBeOk(this Core.HealthCheck.HealthCheck result)
        {
            result.Type.Should().Be(HealthCheckResult.Ok);

            // A passing check reports nothing, so it must not carry a reason either.
            result.Reason.Should().Be(HealthCheckReason.None);
        }

        public static void ShouldBeNotice(this Core.HealthCheck.HealthCheck result, string message = null, HealthCheckReason? reason = null)
        {
            result.Type.Should().Be(HealthCheckResult.Notice);
            result.Reason.Should().NotBe(HealthCheckReason.None);

            if (reason.HasValue)
            {
                result.Reason.Should().Be(reason.Value);
            }

            if (message.IsNotNullOrWhiteSpace())
            {
                result.Message.Should().Contain(message);
            }
        }

        public static void ShouldBeWarning(this Core.HealthCheck.HealthCheck result, string message = null, string wikiFragment = null, HealthCheckReason? reason = null)
        {
            result.Type.Should().Be(HealthCheckResult.Warning);
            result.Reason.Should().NotBe(HealthCheckReason.None);

            if (reason.HasValue)
            {
                result.Reason.Should().Be(reason.Value);
            }

            if (message.IsNotNullOrWhiteSpace())
            {
                result.Message.Should().Contain(message);
            }

            if (wikiFragment.IsNotNullOrWhiteSpace())
            {
                result.WikiUrl.ToString().Should().Contain(wikiFragment);
            }
        }

        public static void ShouldBeError(this Core.HealthCheck.HealthCheck result, string message = null, string wikiFragment = null, HealthCheckReason? reason = null)
        {
            result.Type.Should().Be(HealthCheckResult.Error);
            result.Reason.Should().NotBe(HealthCheckReason.None);

            if (reason.HasValue)
            {
                result.Reason.Should().Be(reason.Value);
            }

            if (message.IsNotNullOrWhiteSpace())
            {
                result.Message.Should().Contain(message);
            }

            if (wikiFragment.IsNotNullOrWhiteSpace())
            {
                result.WikiUrl.ToString().Should().Contain(wikiFragment);
            }
        }
    }
}
