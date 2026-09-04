using System;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Common.Serializer;
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

        [Test]
        public void should_round_trip_the_after_date_regardless_of_time_zone()
        {
            var model = new Performer
            {
                Id = 1,
                ForeignId = "performer-foreign-id",
                Name = "Some Performer",

                // Dapper hands every DateTime back as UTC, so shifting to local time on
                // the way out would walk the date back a day on every save west of UTC.
                AfterDate = new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            var resource = model.ToResource();

            resource.AfterDate.Should().Be("2024-06-01");

            var parsed = resource.ToModel().AfterDate;
            parsed.Should().Be(new DateTime(2024, 6, 1));

            // The column is a DateTimeOffset, so an unspecified kind would be written as
            // local midnight and read back as UTC — east of UTC that walks the date back
            // a day on every save.
            parsed.Value.Kind.Should().Be(DateTimeKind.Utc);
        }

        [Test]
        public void should_round_trip_an_unset_after_date()
        {
            var resource = new Performer { Id = 1, ForeignId = "performer-foreign-id", Name = "Some Performer" }.ToResource();

            resource.AfterDate.Should().BeNull();
            resource.ToModel().AfterDate.Should().BeNull();
        }

        [Test]
        public void should_apply_the_after_date_to_an_existing_performer()
        {
            var existing = new Performer
            {
                Id = 1,
                ForeignId = "performer-foreign-id",
                Name = "Some Performer",
                AfterDate = new DateTime(2020, 1, 1)
            };

            var resource = existing.ToResource();
            resource.AfterDate = "2024-06-01";

            resource.ToModel(existing).AfterDate.Should().Be(new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc));
        }

        [Test]
        public void should_serialize_the_after_date_even_when_it_is_null()
        {
            // The global WhenWritingNull default drops null properties, and the SignalR cache
            // merge spreads this payload over the cached performer. An absent key cannot
            // overwrite, so clearing the date left the stale one on screen until a refetch.
            var resource = new Performer { Id = 1, ForeignId = "performer-foreign-id", Name = "Some Performer" }.ToResource();

            STJson.ToJson(resource).Should().Contain("\"afterDate\": null");
        }
    }
}
