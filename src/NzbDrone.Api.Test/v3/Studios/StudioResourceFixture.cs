using System;
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
                WhisparrMonitorNewItems = monitorNewItems
            };

            var resource = model.ToResource();

            resource.WhisparrMonitorNewItems.Should().Be(monitorNewItems);
            resource.ToModel().WhisparrMonitorNewItems.Should().Be(monitorNewItems);
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
                WhisparrMonitorNewItems = !monitorNewItems
            };

            var resource = existing.ToResource();
            resource.WhisparrMonitorNewItems = monitorNewItems;

            resource.ToModel(existing).WhisparrMonitorNewItems.Should().Be(monitorNewItems);
        }

        [Test]
        public void should_round_trip_the_after_date_regardless_of_time_zone()
        {
            var model = new Studio
            {
                Id = 1,
                ForeignId = "studio-foreign-id",
                Title = "Some Studio",
                SearchTitle = "Some Studio",

                // Dapper hands every DateTime back as UTC, so shifting to local time on
                // the way out walked the date back a day on every save west of UTC.
                AfterDate = new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            var resource = model.ToResource();

            resource.AfterDate.Should().Be("2024-06-01");
            resource.ToModel().AfterDate.Should().Be(new DateTime(2024, 6, 1));
        }

        [Test]
        public void should_round_trip_an_unset_after_date()
        {
            var resource = new Studio { Id = 1, ForeignId = "studio-foreign-id", Title = "Some Studio", SearchTitle = "Some Studio" }.ToResource();

            resource.AfterDate.Should().BeNull();
            resource.ToModel().AfterDate.Should().BeNull();
        }
    }
}
