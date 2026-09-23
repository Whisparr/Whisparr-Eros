using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests.MovieServiceTests
{
    [TestFixture]
    public class SearchMovieTitlesFixture : CoreTest<MovieService>
    {
        [Test]
        public void should_search_by_clean_title_and_raw_foreign_id()
        {
            var matches = new List<MovieTitleMatch> { new MovieTitleMatch { Id = 1 } };

            Mocker.GetMock<IMovieRepository>()
                .Setup(s => s.SearchMovieTitles("annabell", "Anna-Bell"))
                .Returns(matches);

            Subject.SearchMovieTitles("Anna-Bell").Should().BeSameAs(matches);
        }

        [TestCase("")]
        [TestCase("!!!")]
        public void should_not_search_when_nothing_is_left_after_cleaning(string query)
        {
            Subject.SearchMovieTitles(query).Should().BeEmpty();

            Mocker.GetMock<IMovieRepository>()
                .Verify(s => s.SearchMovieTitles(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
        }
    }
}
