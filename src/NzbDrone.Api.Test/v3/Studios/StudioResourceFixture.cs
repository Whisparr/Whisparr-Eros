using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Movies.Studios;
using Whisparr.Api.V3.Studios;

namespace NzbDrone.Api.Test.v3.Studios
{
    [Parallelizable(ParallelScope.All)]
    public class StudioResourceFixture
    {
        [TestCase(true)]
        [TestCase(false)]
        public void should_round_trip_monitor_new_items(bool monitorNewItems)
        {
            var model = new Studio
            {
                Id = 1,
                ForeignId = "studio-foreign-id",
                Title = "Some Studio",
                SearchTitle = "Some Studio",
                MonitorNewItems = monitorNewItems
            };

            var resource = model.ToResource();

            resource.MonitorNewItems.Should().Be(monitorNewItems);
            resource.ToModel().MonitorNewItems.Should().Be(monitorNewItems);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_apply_monitor_new_items_to_existing_studio(bool monitorNewItems)
        {
            var existing = new Studio
            {
                Id = 1,
                ForeignId = "studio-foreign-id",
                Title = "Some Studio",
                SearchTitle = "Some Studio",
                MonitorNewItems = !monitorNewItems
            };

            var resource = existing.ToResource();
            resource.MonitorNewItems = monitorNewItems;

            resource.ToModel(existing).MonitorNewItems.Should().Be(monitorNewItems);
        }
    }
}
