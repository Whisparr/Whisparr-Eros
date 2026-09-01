using System.Collections.Generic;
using System.Net;

using FizzWare.NBuilder;

using FluentAssertions;

using Moq;

using NUnit.Framework;

using NzbDrone.Common.Http;

using NzbDrone.Core.Configuration;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Performers.Commands;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.PerformerTests
{
    [TestFixture]
    public class RefreshPerformerServiceFixture : CoreTest<RefreshPerformerService>
    {
        private Performer _timedOutPerformer;
        private Performer _successfulPerformer;

        [SetUp]
        public void Setup()
        {
            _timedOutPerformer = Builder<Performer>.CreateNew()
                .With(p => p.Id = 1)
                .With(p => p.ForeignId = "timed-out")
                .With(p => p.Name = "Timed Out Performer")
                .With(p => p.Monitored = true)
                .Build();

            _successfulPerformer = Builder<Performer>.CreateNew()
                .With(p => p.Id = 2)
                .With(p => p.ForeignId = "successful")
                .With(p => p.Name = "Successful Performer")
                .With(p => p.Monitored = true)
                .Build();

            Mocker.GetMock<IPerformerService>()
                .Setup(s => s.GetById(_timedOutPerformer.Id))
                .Returns(_timedOutPerformer);

            Mocker.GetMock<IPerformerService>()
                .Setup(s => s.GetById(_successfulPerformer.Id))
                .Returns(_successfulPerformer);

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByPerformerForeignId(It.IsAny<string>()))
                .Returns(new List<Movie>());

            // We don't want metadata refresh to affect this test.
            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerInfo(It.IsAny<string>()))
                .Throws(new WebException("Http request timed out", WebExceptionStatus.Timeout));

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerWorks(_timedOutPerformer.ForeignId))
                .Throws(new WebException("Http request timed out", WebExceptionStatus.Timeout));

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerWorks(_successfulPerformer.ForeignId))
                .Returns((
                    new List<string>(),
                    new List<string>(),
                    new List<int>()));
        }

        [Test]
        public void should_continue_refreshing_performers_when_skyhook_times_out()
        {
            var command = new RefreshPerformersCommand(
                new List<int>
                {
                    _timedOutPerformer.Id,
                    _successfulPerformer.Id
                });

            Assert.DoesNotThrow(() => Subject.Execute(command));

            Mocker.GetMock<IProvideMovieInfo>()
                .Verify(
                    s => s.GetPerformerWorks(_timedOutPerformer.ForeignId),
                    Times.Once());

            Mocker.GetMock<IProvideMovieInfo>()
                .Verify(
                    s => s.GetPerformerWorks(_successfulPerformer.ForeignId),
                    Times.Once());

            // The shared Setup makes GetPerformerInfo throw for both performers,
            // so each one logs an error before the works sync is even attempted.
            ExceptionVerification.ExpectedErrors(2);

            // The timed out works call is caught and downgraded to a warning so
            // the remaining performers still get refreshed.
            ExceptionVerification.ExpectedWarns(1);
        }

        // A timeout is only one of the ways this call fails. GetPerformerWorks
        // suppresses HTTP errors and throws them itself, so anything that is not
        // a 404 arrives as HttpException, which SyncPerformerItems does not catch.
        [Test]
        public void should_continue_refreshing_performers_when_skyhook_returns_an_http_error()
        {
            var request = new HttpRequest("https://api.whisparr.com/v4/performer/timed-out/works");
            var response = new HttpResponse(request, new HttpHeader(), string.Empty, HttpStatusCode.BadGateway);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerWorks(_timedOutPerformer.ForeignId))
                .Throws(new HttpException(request, response));

            var command = new RefreshPerformersCommand(
                new List<int>
                {
                    _timedOutPerformer.Id,
                    _successfulPerformer.Id
                });

            Assert.DoesNotThrow(() => Subject.Execute(command));

            Mocker.GetMock<IProvideMovieInfo>()
                .Verify(
                    s => s.GetPerformerWorks(_successfulPerformer.ForeignId),
                    Times.Once());

            // Two from the shared Setup making GetPerformerInfo throw for both
            // performers, plus the HttpException from the works call which is
            // only caught one level up and so is logged as an error.
            ExceptionVerification.ExpectedErrors(3);
        }

        private Performer GivenPerformer(bool monitorNewItems)
        {
            var performer = Builder<Performer>.CreateNew()
                .With(p => p.Id = 3)
                .With(p => p.ForeignId = "performer-with-works")
                .With(p => p.Name = "Performer With Works")
                .With(p => p.Monitored = true)
                .With(p => p.MoviesMonitored = true)
                .With(p => p.SearchOnAdd = true)
                .With(p => p.MonitorNewItems = monitorNewItems)
                .With(p => p.MergedIntoId = null)
                .Build();

            Mocker.GetMock<IPerformerService>()
                .Setup(s => s.GetById(performer.Id))
                .Returns(performer);

            // Let the metadata refresh succeed so no unexpected errors are logged.
            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerInfo(performer.ForeignId))
                .Returns(performer);

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.AllMovieStashIds())
                .Returns(new List<string>());

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.AllMovieTmdbIds())
                .Returns(new List<int>());

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.AllMovieTpdbIds())
                .Returns(new List<string>());

            Mocker.GetMock<IImportListExclusionRepository>()
                .Setup(s => s.All())
                .Returns(new List<ImportListExclusion>());

            return performer;
        }

        private List<Movie> GivenAddedMoviesAreCaptured()
        {
            var addedMovies = new List<Movie>();

            Mocker.GetMock<IAddMovieService>()
                .Setup(s => s.AddMovies(It.IsAny<List<Movie>>(), It.IsAny<bool>()))
                .Callback((List<Movie> movies, bool ignoreErrors) => addedMovies.AddRange(movies))
                .Returns((List<Movie> movies, bool ignoreErrors) => movies);

            return addedMovies;
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_use_monitor_new_items_when_adding_scenes(bool monitorNewItems)
        {
            var performer = GivenPerformer(monitorNewItems);
            var addedMovies = GivenAddedMoviesAreCaptured();

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerWorks(performer.ForeignId))
                .Returns((
                    new List<string> { "new-scene" },
                    new List<string>(),
                    new List<int>()));

            Subject.Execute(new RefreshPerformersCommand(new List<int> { performer.Id }));

            addedMovies.Should().HaveCount(1);
            addedMovies.Should().OnlyContain(m => m.Monitored == monitorNewItems);
            addedMovies.Should().OnlyContain(m => m.AddOptions.SearchForMovie == monitorNewItems);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_use_monitor_new_items_when_adding_tmdb_movies(bool monitorNewItems)
        {
            var performer = GivenPerformer(monitorNewItems);
            var addedMovies = GivenAddedMoviesAreCaptured();

            Mocker.GetMock<IConfigService>()
                .Setup(s => s.WhisparrMovieMetadataSource)
                .Returns(MovieMetadataType.TMDB);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerWorks(performer.ForeignId))
                .Returns((
                    new List<string>(),
                    new List<string>(),
                    new List<int> { 123456 }));

            Subject.Execute(new RefreshPerformersCommand(new List<int> { performer.Id }));

            addedMovies.Should().HaveCount(1);
            addedMovies.Should().OnlyContain(m => m.Monitored == monitorNewItems);
            addedMovies.Should().OnlyContain(m => m.AddOptions.SearchForMovie == monitorNewItems);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_use_monitor_new_items_when_adding_tpdb_movies(bool monitorNewItems)
        {
            var performer = GivenPerformer(monitorNewItems);
            var addedMovies = GivenAddedMoviesAreCaptured();

            Mocker.GetMock<IConfigService>()
                .Setup(s => s.WhisparrMovieMetadataSource)
                .Returns(MovieMetadataType.TPDB);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerWorks(performer.ForeignId))
                .Returns((
                    new List<string>(),
                    new List<string> { "654321" },
                    new List<int>()));

            Subject.Execute(new RefreshPerformersCommand(new List<int> { performer.Id }));

            addedMovies.Should().HaveCount(1);
            addedMovies.Should().OnlyContain(m => m.Monitored == monitorNewItems);
            addedMovies.Should().OnlyContain(m => m.AddOptions.SearchForMovie == monitorNewItems);
        }

        [Test]
        public void should_still_discover_and_add_works_when_monitor_new_items_is_false()
        {
            var performer = GivenPerformer(false);
            var addedMovies = GivenAddedMoviesAreCaptured();

            Mocker.GetMock<IConfigService>()
                .Setup(s => s.WhisparrMovieMetadataSource)
                .Returns(MovieMetadataType.TMDB);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerWorks(performer.ForeignId))
                .Returns((
                    new List<string> { "new-scene" },
                    new List<string>(),
                    new List<int> { 123456 }));

            Subject.Execute(new RefreshPerformersCommand(new List<int> { performer.Id }));

            Mocker.GetMock<IProvideMovieInfo>()
                .Verify(s => s.GetPerformerWorks(performer.ForeignId), Times.Once());

            addedMovies.Should().HaveCount(2);
            addedMovies.Should().OnlyContain(m => !m.Monitored);
        }

        [Test]
        public void should_default_monitor_new_items_to_true_for_new_performers()
        {
            new Performer().MonitorNewItems.Should().BeTrue();
        }

        // The scheduled refresh takes the other branch of Execute, which walks
        // every performer rather than a caller-supplied list. One bad performer
        // there used to abort the whole run.
        [Test]
        public void should_continue_the_scheduled_refresh_when_skyhook_returns_an_http_error()
        {
            // Let the info refresh succeed here so the test is about the works
            // call; the shared Setup makes it throw for every performer.
            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerInfo(_timedOutPerformer.ForeignId))
                .Returns(_timedOutPerformer);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerInfo(_successfulPerformer.ForeignId))
                .Returns(_successfulPerformer);

            var request = new HttpRequest("https://api.whisparr.com/v4/performer/timed-out/works");
            var response = new HttpResponse(request, new HttpHeader(), string.Empty, HttpStatusCode.BadGateway);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetPerformerWorks(_timedOutPerformer.ForeignId))
                .Throws(new HttpException(request, response));

            Mocker.GetMock<IPerformerService>()
                .Setup(s => s.AllPerformerIdsByLastInfoSync())
                .Returns(new List<int> { _timedOutPerformer.Id, _successfulPerformer.Id });

            Mocker.GetMock<IPerformerService>()
                .Setup(s => s.GetPerformers(It.IsAny<IEnumerable<int>>()))
                .Returns(new List<Performer> { _timedOutPerformer, _successfulPerformer });

            var command = new RefreshPerformersCommand { Trigger = CommandTrigger.Manual };

            Assert.DoesNotThrow(() => Subject.Execute(command));

            Mocker.GetMock<IProvideMovieInfo>()
                .Verify(
                    s => s.GetPerformerWorks(_successfulPerformer.ForeignId),
                    Times.Once());

            // Only the timed out performer fails here; the error is logged and
            // the scheduled run carries on to the next performer.
            ExceptionVerification.ExpectedErrors(1);
        }
    }
}
