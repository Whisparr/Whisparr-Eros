using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Movies.Performers;
using Whisparr.Api.V3.Performers;

namespace NzbDrone.Api.Test.v3.Performers
{
    [Parallelizable(ParallelScope.All)]
    public class PerformerResourceFixture
    {
        [TestCase(true)]
        [TestCase(false)]
        public void should_round_trip_monitor_new_items(bool monitorNewItems)
        {
            var model = new Performer
            {
                Id = 1,
                ForeignId = "performer-foreign-id",
                Name = "Some Performer",
                WhisparrMonitorNewItems = monitorNewItems
            };

            var resource = model.ToResource();

            resource.WhisparrMonitorNewItems.Should().Be(monitorNewItems);
            resource.ToModel().WhisparrMonitorNewItems.Should().Be(monitorNewItems);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_apply_monitor_new_items_to_existing_performer(bool monitorNewItems)
        {
            var existing = new Performer
            {
                Id = 1,
                ForeignId = "performer-foreign-id",
                Name = "Some Performer",
                WhisparrMonitorNewItems = !monitorNewItems
            };

            var resource = existing.ToResource();
            resource.WhisparrMonitorNewItems = monitorNewItems;

            resource.ToModel(existing).WhisparrMonitorNewItems.Should().Be(monitorNewItems);
        }
    }
}
