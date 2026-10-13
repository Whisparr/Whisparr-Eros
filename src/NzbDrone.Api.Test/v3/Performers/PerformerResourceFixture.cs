using System;
using System.Collections.Generic;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.MediaCover;
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

        [Test]
        public void should_serialize_the_visibility_as_a_string()
        {
            var resource = new Performer { Id = 1, ForeignId = "performer-foreign-id", Name = "Some Performer", Visibility = PerformerVisibility.Hidden }.ToResource();

            STJson.ToJson(resource).Should().Contain("\"visibility\": \"hidden\"");
        }

        [Test]
        public void should_leave_out_the_images_of_a_hidden_performer()
        {
            var model = new Performer
            {
                Id = 1,
                ForeignId = "performer-foreign-id",
                Name = "Some Performer",
                Visibility = PerformerVisibility.Hidden,
                Images = new List<MediaCover> { new(MediaCoverTypes.Headshot, "https://example.com/headshot.jpg") }
            };

            model.ToResource().Images.Should().BeEmpty();
            model.Images.Should().HaveCount(1);
        }

        [Test]
        public void should_keep_the_images_of_a_visible_performer()
        {
            var model = new Performer
            {
                Id = 1,
                ForeignId = "performer-foreign-id",
                Name = "Some Performer",
                Images = new List<MediaCover> { new(MediaCoverTypes.Headshot, "https://example.com/headshot.jpg") }
            };

            model.ToResource().Images.Should().HaveCount(1);
        }

        [Test]
        public void should_keep_the_visibility_of_an_existing_performer_when_the_resource_leaves_it_out()
        {
            var existing = new Performer { Id = 1, ForeignId = "performer-foreign-id", Name = "Some Performer", Visibility = PerformerVisibility.Hidden };

            var resource = existing.ToResource();
            resource.Visibility = null;

            resource.ToModel(existing).Visibility.Should().Be(PerformerVisibility.Hidden);
        }

        [Test]
        public void should_add_a_performer_visible_when_the_resource_leaves_out_the_visibility()
        {
            var resource = new PerformerResource { ForeignId = "performer-foreign-id", FullName = "Some Performer" };

            resource.ToModel().Visibility.Should().Be(PerformerVisibility.Visible);
        }

        [Test]
        public void should_unmonitor_an_existing_performer_when_hiding_them()
        {
            var existing = new Performer { Id = 1, ForeignId = "performer-foreign-id", Name = "Some Performer", Monitored = true };

            var resource = existing.ToResource();
            resource.Visibility = PerformerVisibility.Hidden;

            var model = resource.ToModel(existing);

            model.Visibility.Should().Be(PerformerVisibility.Hidden);
            model.Monitored.Should().BeFalse();
        }
    }
}
