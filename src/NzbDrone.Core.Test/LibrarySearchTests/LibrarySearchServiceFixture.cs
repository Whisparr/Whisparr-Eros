using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.LibrarySearch;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.LibrarySearchTests
{
    [TestFixture]
    public class LibrarySearchServiceFixture : CoreTest<LibrarySearchService>
    {
        private List<MovieTitleMatch> _titles;

        [SetUp]
        public void Setup()
        {
            _titles = new List<MovieTitleMatch>
            {
                Title(1, "Anna Goes To The Beach", ItemType.Scene),
                Title(2, "Anna", ItemType.Scene),
                Title(3, "Meet Anna", ItemType.Scene),
                Title(4, "Anna The Movie", ItemType.Movie)
            };

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.SearchMovieTitles(It.IsAny<string>()))
                .Returns(() => _titles);

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                .Returns<IEnumerable<int>>(ids => ids.Select(id => new Movie { Id = id }).Reverse().ToList());

            Mocker.GetMock<IPerformerService>()
                .Setup(s => s.SearchPerformers(It.IsAny<string>()))
                .Returns(new List<Performer>
                {
                    new Performer { Id = 1, Name = "Anna Bell", CleanName = "Anna Bell".CleanMovieTitle() },
                    new Performer { Id = 2, Name = "Anna", CleanName = "anna" }
                });

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.SearchStudios(It.IsAny<string>()))
                .Returns(new List<Studio>
                {
                    new Studio { Id = 1, Title = "Anna Studios", CleanTitle = "annastudios" }
                });
        }

        private static MovieTitleMatch Title(int id, string title, ItemType itemType)
        {
            return new MovieTitleMatch { Id = id, Title = title, CleanTitle = title.CleanMovieTitle(), ItemType = itemType };
        }

        [Test]
        public void should_split_scenes_from_movies_in_rank_order()
        {
            var result = Subject.Search("anna", 10);

            result.Scenes.Records.Select(m => m.Id).Should().Equal(2, 1, 3);
            result.Movies.Records.Select(m => m.Id).Should().Equal(4);
        }

        [Test]
        public void should_rank_performers_and_studios()
        {
            var result = Subject.Search("anna", 10);

            result.Performers.Records.Select(p => p.Id).Should().Equal(2, 1);
            result.Studios.Records.Select(s => s.Id).Should().Equal(1);
        }

        [Test]
        public void should_return_totals_beyond_the_limit()
        {
            var result = Subject.Search("anna", 1);

            result.Scenes.TotalRecords.Should().Be(3);
            result.Scenes.Records.Should().HaveCount(1);
            result.Performers.TotalRecords.Should().Be(2);
            result.Performers.Records.Should().HaveCount(1);
        }

        [Test]
        public void should_load_only_the_page_of_movies()
        {
            var page = Subject.SearchMovies("anna", ItemType.Scene, 2, 2);

            page.TotalRecords.Should().Be(3);
            page.Records.Select(m => m.Id).Should().Equal(3);

            Mocker.GetMock<IMovieService>()
                .Verify(s => s.GetMovies(It.Is<IEnumerable<int>>(ids => ids.SequenceEqual(new[] { 3 }))), Times.Once());
        }

        [Test]
        public void should_not_load_movies_for_an_empty_page()
        {
            var page = Subject.SearchMovies("anna", ItemType.Scene, 5, 2);

            page.TotalRecords.Should().Be(3);
            page.Records.Should().BeEmpty();

            Mocker.GetMock<IMovieService>()
                .Verify(s => s.GetMovies(It.IsAny<IEnumerable<int>>()), Times.Never());
        }

        [Test]
        public void should_page_performers_and_studios()
        {
            Subject.SearchPerformers("anna", 2, 1).Records.Select(p => p.Id).Should().Equal(1);
            Subject.SearchStudios("anna", 1, 1).Records.Select(s => s.Id).Should().Equal(1);
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        [TestCase("!!!")]
        public void should_return_nothing_for_a_term_with_no_searchable_text(string term)
        {
            var result = Subject.Search(term, 10);

            result.Scenes.TotalRecords.Should().Be(0);
            result.Performers.TotalRecords.Should().Be(0);
            Subject.SearchMovies(term, ItemType.Scene, 1, 10).TotalRecords.Should().Be(0);
            Subject.SearchPerformers(term, 1, 10).TotalRecords.Should().Be(0);
            Subject.SearchStudios(term, 1, 10).TotalRecords.Should().Be(0);

            Mocker.GetMock<IPerformerService>()
                .Verify(s => s.SearchPerformers(It.IsAny<string>()), Times.Never());
        }
    }
}
