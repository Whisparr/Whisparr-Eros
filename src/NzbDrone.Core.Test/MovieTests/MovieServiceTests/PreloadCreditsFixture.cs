using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests.MovieServiceTests
{
    [TestFixture]
    public class PreloadCreditsFixture : CoreTest<MovieService>
    {
        private List<Movie> _movies;

        [SetUp]
        public void Setup()
        {
            _movies = Builder<Movie>.CreateListOfSize(3)
                .TheFirst(1)
                .With(m => m.Title = "First Scene")
                .With(m => m.MovieMetadata.Value.Id = 1)
                .TheNext(1)
                .With(m => m.Title = "Second Scene")
                .With(m => m.MovieMetadata.Value.Id = 2)
                .TheRest()
                .With(m => m.Title = "Third Scene")
                .With(m => m.MovieMetadata.Value.Id = 2)
                .Build()
                .ToList();
        }

        private static Credit GivenCredit(int movieMetadataId, string name)
        {
            return new Credit
            {
                MovieMetadataId = movieMetadataId,
                PersonName = name,
                Character = name,
                Performer = new CreditPerformer { Name = name, Gender = Gender.Female }
            };
        }

        private void WhenMatching()
        {
            Subject.MatchMovies("zzz unmatched zzz", "", "", "", _movies, false, false);
        }

        [Test]
        public void should_load_credits_with_a_single_batch_query()
        {
            Mocker.GetMock<ICreditService>()
                .Setup(s => s.GetAllCreditsForMovieMetadataIds(It.IsAny<List<int>>()))
                .Returns(new Dictionary<int, List<Credit>>
                {
                    { 1, new List<Credit> { GivenCredit(1, "Alice Example") } },
                    { 2, new List<Credit> { GivenCredit(2, "Bree Example") } }
                });

            WhenMatching();

            Mocker.GetMock<ICreditService>()
                .Verify(s => s.GetAllCreditsForMovieMetadataIds(It.Is<List<int>>(ids => ids.Count == 2 && ids.Contains(1) && ids.Contains(2))), Times.Once());

            Mocker.GetMock<ICreditService>()
                .Verify(s => s.GetAllCreditsForMovieMetadata(It.IsAny<int>()), Times.Never());

            _movies[0].MovieMetadata.Value.Credits.Should().ContainSingle(c => c.PersonName == "Alice Example");
            _movies[1].MovieMetadata.Value.Credits.Should().ContainSingle(c => c.PersonName == "Bree Example");
            _movies[2].MovieMetadata.Value.Credits.Should().ContainSingle(c => c.PersonName == "Bree Example");

            // Movies sharing a metadata id must not share a credit list instance
            _movies[1].MovieMetadata.Value.Credits.Should().NotBeSameAs(_movies[2].MovieMetadata.Value.Credits);
        }

        [Test]
        public void should_not_query_credits_when_all_movies_already_have_credits()
        {
            foreach (var movie in _movies)
            {
                movie.MovieMetadata.Value.Credits = new List<Credit> { GivenCredit(movie.MovieMetadata.Value.Id, "Cara Example") };
            }

            WhenMatching();

            Mocker.GetMock<ICreditService>()
                .Verify(s => s.GetAllCreditsForMovieMetadataIds(It.IsAny<List<int>>()), Times.Never());

            Mocker.GetMock<ICreditService>()
                .Verify(s => s.GetAllCreditsForMovieMetadata(It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_only_request_ids_for_movies_missing_credits()
        {
            var existing = new List<Credit> { GivenCredit(1, "Dee Example") };
            _movies[0].MovieMetadata.Value.Credits = existing;

            Mocker.GetMock<ICreditService>()
                .Setup(s => s.GetAllCreditsForMovieMetadataIds(It.IsAny<List<int>>()))
                .Returns(new Dictionary<int, List<Credit>>
                {
                    { 2, new List<Credit> { GivenCredit(2, "Bree Example") } }
                });

            WhenMatching();

            Mocker.GetMock<ICreditService>()
                .Verify(s => s.GetAllCreditsForMovieMetadataIds(It.Is<List<int>>(ids => ids.Count == 1 && ids[0] == 2)), Times.Once());

            _movies[0].MovieMetadata.Value.Credits.Should().BeSameAs(existing);
        }

        [Test]
        public void should_not_request_credits_for_unsaved_metadata()
        {
            _movies.ForEach(m => m.MovieMetadata.Value.Id = 0);

            WhenMatching();

            Mocker.GetMock<ICreditService>()
                .Verify(s => s.GetAllCreditsForMovieMetadataIds(It.IsAny<List<int>>()), Times.Never());
        }

        [Test]
        public void should_leave_credits_empty_when_no_credits_exist()
        {
            Mocker.GetMock<ICreditService>()
                .Setup(s => s.GetAllCreditsForMovieMetadataIds(It.IsAny<List<int>>()))
                .Returns(new Dictionary<int, List<Credit>>());

            WhenMatching();

            foreach (var movie in _movies)
            {
                movie.MovieMetadata.Value.Credits.Should().BeEmpty();
            }
        }
    }
}
