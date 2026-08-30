using System;
using System.Globalization;
using System.Threading;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Notifications;
using NzbDrone.Core.Notifications.Discord;
using NzbDrone.Core.Notifications.Discord.Payloads;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.NotificationTests.DiscordTests
{
    [TestFixture]
    public class DiscordFixture : CoreTest<Discord>
    {
        private DiscordPayload _payload;

        [SetUp]
        public void Setup()
        {
            Subject.Definition = new NotificationDefinition { Settings = new DiscordSettings() };

            Mocker.GetMock<IDiscordProxy>()
                .Setup(s => s.SendPayload(It.IsAny<DiscordPayload>(), It.IsAny<DiscordSettings>()))
                .Callback<DiscordPayload, DiscordSettings>((payload, _) => _payload = payload);
        }

        // Custom format strings render the year in the current culture's calendar, so a host set
        // to a non-Gregorian locale sent Discord a year like 2569 (Buddhist) or 1448 (Hijri) and
        // Discord rejected or misrendered the embed. "O" is culture-invariant.
        [TestCase("en-US")]
        [TestCase("th-TH")]
        [TestCase("ar-SA")]
        public void should_send_a_gregorian_timestamp_regardless_of_culture(string culture)
        {
            var originalCulture = Thread.CurrentThread.CurrentCulture;

            try
            {
                Thread.CurrentThread.CurrentCulture = CultureInfo.GetCultureInfo(culture);

                Subject.OnApplicationUpdate(new ApplicationUpdateMessage
                {
                    Message = "Updated",
                    PreviousVersion = new Version(3, 4, 0),
                    NewVersion = new Version(3, 5, 0)
                });

                var timestamp = _payload.Embeds[0].Timestamp;

                DateTime.TryParse(timestamp, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var parsed)
                    .Should().BeTrue();

                parsed.Year.Should().Be(DateTime.UtcNow.Year);
            }
            finally
            {
                Thread.CurrentThread.CurrentCulture = originalCulture;
            }
        }
    }
}
