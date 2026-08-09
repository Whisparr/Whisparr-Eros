using System.Collections.Generic;
using System.Net;

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
        }
    }
}
