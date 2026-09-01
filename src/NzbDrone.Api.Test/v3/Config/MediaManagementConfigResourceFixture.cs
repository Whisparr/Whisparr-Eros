using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using Whisparr.Api.V3.Config;

namespace NzbDrone.Api.Test.v3.Config
{
    [Parallelizable(ParallelScope.All)]
    public class MediaManagementConfigResourceFixture
    {
        [TestCase(true)]
        [TestCase(false)]
        public void should_map_enable_new_item_monitoring(bool enableNewItemMonitoring)
        {
            var configService = new Mock<IConfigService>();

            configService.SetupGet(s => s.EnableNewItemMonitoring)
                .Returns(enableNewItemMonitoring);

            MediaManagementConfigResourceMapper.ToResource(configService.Object)
                .EnableNewItemMonitoring
                .Should()
                .Be(enableNewItemMonitoring);
        }

        // ConfigController.SaveConfig reflects over the resource and hands the
        // property names to SaveConfigDictionary, which only persists names that
        // match a settable IConfigService property.
        [Test]
        public void should_expose_enable_new_item_monitoring_to_the_generic_config_save_path()
        {
            var property = typeof(IConfigService)
                .GetProperty(nameof(MediaManagementConfigResource.EnableNewItemMonitoring));

            property.Should().NotBeNull();
            property.CanWrite.Should().BeTrue();
        }
    }
}
