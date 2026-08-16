using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests.CreditTests
{
    [TestFixture]
    public class CreditRepositoryFixture : DbTest<CreditRepository, Credit>
    {
        private static Credit GivenCredit(int movieMetadataId, string name)
        {
            return new Credit
            {
                MovieMetadataId = movieMetadataId,
                PersonName = name,
                PerformerForeignId = name.ToLowerInvariant().Replace(' ', '-'),
                Character = name,
                Type = CreditType.Cast,
                Order = 0
            };
        }

        [Test]
        public void should_return_credits_for_requested_metadata_ids_only()
        {
            Subject.Insert(GivenCredit(1, "Alice Example"));
            Subject.Insert(GivenCredit(2, "Bree Example"));
            Subject.Insert(GivenCredit(3, "Cara Example"));

            var result = Subject.FindByMovieMetadataIds(new List<int> { 1, 3 });

            result.Should().HaveCount(2);
            result.Select(c => c.MovieMetadataId).Should().BeEquivalentTo(new[] { 1, 3 });
            result.Should().OnlyContain(c => c.Performer != null);
        }

        [Test]
        public void should_return_empty_for_empty_or_null_input()
        {
            Subject.Insert(GivenCredit(1, "Alice Example"));

            Subject.FindByMovieMetadataIds(new List<int>()).Should().BeEmpty();
            Subject.FindByMovieMetadataIds(null).Should().BeEmpty();
        }

        [Test]
        public void should_handle_id_lists_larger_than_the_sqlite_parameter_limit()
        {
            Subject.Insert(GivenCredit(1500, "Alice Example"));

            var ids = Enumerable.Range(1, 2000).ToList();

            var result = Subject.FindByMovieMetadataIds(ids);

            result.Should().ContainSingle(c => c.MovieMetadataId == 1500);
        }
    }
}
