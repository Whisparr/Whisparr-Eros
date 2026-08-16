using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests.CreditTests
{
    [TestFixture]
    public class CreditServiceFixture : CoreTest<CreditService>
    {
        [Test]
        public void should_group_credits_by_movie_metadata_id()
        {
            Mocker.GetMock<ICreditRepository>()
                .Setup(s => s.FindByMovieMetadataIds(It.IsAny<List<int>>()))
                .Returns(new List<Credit>
                {
                    new Credit { MovieMetadataId = 1, PersonName = "Alice Example" },
                    new Credit { MovieMetadataId = 1, PersonName = "Bree Example" },
                    new Credit { MovieMetadataId = 2, PersonName = "Cara Example" }
                });

            var result = Subject.GetAllCreditsForMovieMetadataIds(new List<int> { 1, 2, 3 });

            result.Should().HaveCount(2);
            result[1].Should().HaveCount(2);
            result[2].Should().ContainSingle(c => c.PersonName == "Cara Example");
            result.Should().NotContainKey(3);
        }

        [Test]
        public void should_return_empty_dictionary_and_skip_query_for_empty_or_null_input()
        {
            Subject.GetAllCreditsForMovieMetadataIds(new List<int>()).Should().BeEmpty();
            Subject.GetAllCreditsForMovieMetadataIds(null).Should().BeEmpty();

            Mocker.GetMock<ICreditRepository>()
                .Verify(s => s.FindByMovieMetadataIds(It.IsAny<List<int>>()), Times.Never());
        }
    }
}
