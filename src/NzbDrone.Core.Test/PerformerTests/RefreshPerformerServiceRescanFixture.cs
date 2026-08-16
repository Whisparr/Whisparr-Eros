using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Performers.Commands;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.PerformerTests
{
    [TestFixture]
    public class RefreshPerformerServiceRescanFixture : CoreTest<RefreshPerformerService>
    {
        private Performer _performer;

        [SetUp]
        public void Setup()
        {
            _performer = Builder<Performer>.CreateNew()
                .With(p => p.Id = 1)
                .With(p => p.ForeignId = "performer-1")
                .With(p => p.Name = "Performer One")
                .With(p => p.Monitored = true)
                .Build();

            Mocker.GetMock<IPerformerService>()
                .Setup(s => s.GetById(_performer.Id))
                .Returns(_performer);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerInfo(_performer.ForeignId))
                .Returns(_performer);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerWorks(_performer.ForeignId))
                .Returns((new List<string>(), new List<string>(), new List<int>()));
        }

        [Test]
        public void should_rescan_movies_with_a_single_batch_lookup_and_distinct_ids()
        {
            var movies = Builder<Movie>.CreateListOfSize(2).Build().ToList();

            // The performer credit join can return the same movie twice
            var items = new List<Movie> { movies[0], movies[0], movies[1] };

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByPerformerForeignId(_performer.ForeignId))
                .Returns(items);

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                .Returns(movies);

            Subject.Execute(new RefreshPerformersCommand(new List<int> { _performer.Id }));

            Mocker.GetMock<IMovieService>()
                .Verify(s => s.GetMovies(It.Is<IEnumerable<int>>(ids => ids.Count() == 2 && ids.Contains(movies[0].Id) && ids.Contains(movies[1].Id))), Times.Once());

            Mocker.GetMock<IMovieService>()
                .Verify(s => s.GetMovie(It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_not_fetch_movies_when_performer_has_no_library_items()
        {
            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByPerformerForeignId(_performer.ForeignId))
                .Returns(new List<Movie>());

            Subject.Execute(new RefreshPerformersCommand(new List<int> { _performer.Id }));

            Mocker.GetMock<IMovieService>()
                .Verify(s => s.GetMovies(It.IsAny<IEnumerable<int>>()), Times.Never());
        }
    }
}
