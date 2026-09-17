using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.ParserTests.ParsingServiceTests
{
    [TestFixture]
    public class FuzzyYearFallbackFixture : TestBase<ParsingService>
    {
        private Movie _movie;
        private ParsedMovieInfo _taggedRelease;

        [SetUp]
        public void Setup()
        {
            _movie = Builder<Movie>.CreateNew()
                                   .With(m => m.Id = 1)
                                   .With(m => m.Title = "To the Last Man: The Gathering Storm")
                                   .With(m => m.MovieMetadata.Value.CleanTitle = "tolastmangatheringstorm")
                                   .With(m => m.MovieMetadata.Value.ItemType = ItemType.Movie)
                                   .With(m => m.Year = 2009)
                                   .Build();

            _taggedRelease = new ParsedMovieInfo
            {
                MovieTitles = new List<string> { "GAY: To the Last Man: The Gathering Storm" },
                Languages = new List<Language> { Language.English },
                Year = 2009
            };
        }

        private void GivenFuzzyMatch(Movie movie)
        {
            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.FindFuzzyMovieByYear(It.IsAny<string>(), It.IsAny<int>()))
                  .Returns(movie);
        }

        [Test]
        public void should_fall_back_to_fuzzy_match_when_exact_matching_fails()
        {
            GivenFuzzyMatch(_movie);

            var result = Subject.Map(_taggedRelease, "", 0, null);

            result.Movie.Should().Be(_movie);
            result.MovieMatchType.Should().Be(MovieMatchType.FuzzyTitle);
        }

        [Test]
        public void should_not_attempt_fuzzy_match_when_exact_matching_succeeds()
        {
            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.FindByTitle(It.IsAny<List<string>>(), It.IsAny<int>(), It.IsAny<List<string>>(), It.IsAny<List<Movie>>()))
                  .Returns(_movie);

            var result = Subject.Map(_taggedRelease, "", 0, null);

            result.MovieMatchType.Should().Be(MovieMatchType.Title);

            Mocker.GetMock<IMovieService>()
                  .Verify(v => v.FindFuzzyMovieByYear(It.IsAny<string>(), It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_not_attempt_fuzzy_match_without_a_reliable_year()
        {
            // Without a parsed year there is nothing to scope the candidate set to, so the fallback would be comparing against the whole library.
            _taggedRelease.Year = 0;

            Subject.Map(_taggedRelease, "", 0, null);

            Mocker.GetMock<IMovieService>()
                  .Verify(v => v.FindFuzzyMovieByYear(It.IsAny<string>(), It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_ignore_fuzzy_match_for_a_movie_other_than_the_one_searched_for()
        {
            var otherMovie = Builder<Movie>.CreateNew()
                                           .With(m => m.Id = 2)
                                           .With(m => m.Title = "Some Other Film")
                                           .With(m => m.MovieMetadata.Value.ItemType = ItemType.Movie)
                                           .With(m => m.Year = 2009)
                                           .Build();

            GivenFuzzyMatch(otherMovie);

            var result = Subject.Map(_taggedRelease, "", 0, new MovieSearchCriteria { Movie = _movie });

            result.Movie.Should().BeNull();
        }

        [Test]
        public void should_accept_fuzzy_match_for_the_movie_that_was_searched_for()
        {
            GivenFuzzyMatch(_movie);

            var result = Subject.Map(_taggedRelease, "", 0, new MovieSearchCriteria { Movie = _movie });

            result.Movie.Should().Be(_movie);
            result.MovieMatchType.Should().Be(MovieMatchType.FuzzyTitle);
        }

        [Test]
        public void should_ignore_fuzzy_match_that_is_not_a_movie()
        {
            var scene = Builder<Movie>.CreateNew()
                                      .With(m => m.Id = 3)
                                      .With(m => m.Title = "To the Last Man: The Gathering Storm")
                                      .With(m => m.MovieMetadata.Value.ItemType = ItemType.Scene)
                                      .With(m => m.Year = 2009)
                                      .Build();

            GivenFuzzyMatch(scene);

            var result = Subject.Map(_taggedRelease, "", 0, null);

            result.Movie.Should().BeNull();
        }
    }
}
