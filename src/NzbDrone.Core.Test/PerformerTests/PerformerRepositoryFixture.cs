using System;
using System.Collections.Generic;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.PerformerTests
{
    [TestFixture]
    public class PerformerRepositoryFixture : DbTest<PerformerRepository, Performer>
    {
        private static Performer GivenPerformer(DateTime? afterDate)
        {
            return new Performer
            {
                ForeignId = "performer-foreign-id",
                Name = "Some Performer",
                CleanName = "someperformer",
                SortName = "some performer",
                RootFolderPath = @"C:\Test\Movies",
                Aliases = new List<string>(),
                Tattoos = new List<string>(),
                Piercings = new List<string>(),
                AfterDate = afterDate
            };
        }

        [Test]
        public void should_round_trip_the_after_date_through_the_database()
        {
            // The column arrived in its own migration, so this is the check that it
            // exists and that Dapper maps it rather than silently dropping the value.
            // The column is a DateTimeOffset, so the date has to go in as UTC: an
            // unspecified kind is written as local midnight and read back as UTC, which
            // east of UTC lands on the previous day.
            Subject.Insert(GivenPerformer(new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc)));

            Subject.All().Should().ContainSingle().Which.AfterDate.Should().Be(new DateTime(2024, 6, 1));
        }

        [Test]
        public void should_round_trip_an_unset_after_date()
        {
            Subject.Insert(GivenPerformer(null));

            Subject.All().Should().ContainSingle().Which.AfterDate.Should().BeNull();
        }
    }
}
