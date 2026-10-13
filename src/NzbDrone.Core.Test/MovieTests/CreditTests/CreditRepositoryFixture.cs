using System.Collections.Generic;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests.CreditTests
{
    [TestFixture]
    public class CreditRepositoryFixture : DbTest<CreditRepository, Credit>
    {
        private const string ForeignId = "performer-foreign-id";

        [TestCase(PerformerVisibility.Hidden)]
        [TestCase(PerformerVisibility.Visible)]
        public void should_carry_the_performer_visibility_on_movie_credits(PerformerVisibility visibility)
        {
            GivenCreditFor(visibility);

            Subject.FindByMovieMetadataId(5).Should().ContainSingle().Which.Performer.Visibility.Should().Be(visibility);
        }

        [TestCase(PerformerVisibility.Hidden)]
        [TestCase(PerformerVisibility.Visible)]
        public void should_carry_the_performer_visibility_on_performer_credits(PerformerVisibility visibility)
        {
            GivenCreditFor(visibility);

            Subject.GetPerformerMovies(ForeignId).Should().ContainSingle().Which.Performer.Visibility.Should().Be(visibility);
        }

        private void GivenCreditFor(PerformerVisibility visibility)
        {
            Db.Insert(new Performer
            {
                ForeignId = ForeignId,
                Name = "Some Performer",
                CleanName = "someperformer",
                SortName = "some performer",
                RootFolderPath = "/movies",
                Aliases = new List<string>(),
                Tattoos = new List<string>(),
                Piercings = new List<string>(),
                Visibility = visibility
            });

            Db.Insert(new Credit
            {
                MovieMetadataId = 5,
                PerformerForeignId = ForeignId,
                PersonName = "Some Performer",
                Character = string.Empty,
                Job = string.Empty
            });
        }
    }
}
