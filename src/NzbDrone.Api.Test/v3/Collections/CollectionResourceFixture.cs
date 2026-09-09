using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Movies.Collections;
using Whisparr.Api.V3.Collections;

namespace NzbDrone.Api.Test.v3.Collections
{
    [Parallelizable(ParallelScope.All)]
    public class CollectionResourceFixture
    {
        [TestCase(true)]
        [TestCase(false)]
        public void should_round_trip_monitor_new_items(bool monitorNewItems)
        {
            var model = new MovieCollection
            {
                Id = 1,
                TmdbId = 100,
                Title = "Some Collection",
                WhisparrMonitorNewItems = monitorNewItems
            };

            var resource = model.ToResource();

            resource.WhisparrMonitorNewItems.Should().Be(monitorNewItems);
            resource.ToModel().WhisparrMonitorNewItems.Should().Be(monitorNewItems);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_apply_monitor_new_items_to_existing_collection(bool monitorNewItems)
        {
            var existing = new MovieCollection
            {
                Id = 1,
                TmdbId = 100,
                Title = "Some Collection",
                WhisparrMonitorNewItems = !monitorNewItems
            };

            var resource = existing.ToResource();
            resource.WhisparrMonitorNewItems = monitorNewItems;

            resource.ToModel(existing).WhisparrMonitorNewItems.Should().Be(monitorNewItems);
        }
    }
}
