using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using Whisparr.Api.V3.Config;

namespace NzbDrone.Api.Test.v3.Config
{
    [Parallelizable(ParallelScope.All)]
    public class HostConfigResourceFixture
    {
        [TestCase(true)]
        [TestCase(false)]
        public void should_map_whisparr_monitor_new_items(bool whisparrMonitorNewItems)
        {
            var configFileProvider = new Mock<IConfigFileProvider>();
            var configService = new Mock<IConfigService>();

            configService.SetupGet(s => s.WhisparrMonitorNewItems)
                .Returns(whisparrMonitorNewItems);

            configFileProvider.Object.ToResource(configService.Object)
                .WhisparrMonitorNewItems
                .Should()
                .Be(whisparrMonitorNewItems);
        }

        // HostConfigController.SaveHostConfig reflects over the resource and hands
        // the property names to SaveConfigDictionary, which only persists names that
        // match a settable IConfigService property.
        [Test]
        public void should_expose_whisparr_monitor_new_items_to_the_generic_config_save_path()
        {
            var property = typeof(IConfigService)
                .GetProperty(nameof(HostConfigResource.WhisparrMonitorNewItems));

            property.Should().NotBeNull();
            property.CanWrite.Should().BeTrue();
        }
    }
}
