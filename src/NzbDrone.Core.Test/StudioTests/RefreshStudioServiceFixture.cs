using System.Collections.Generic;
using System.Net;

using FizzWare.NBuilder;

using Moq;

using NUnit.Framework;

using NzbDrone.Common.Http;

using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Movies.Studios.Commands;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.StudioTests
{
    [TestFixture]
    public class RefreshStudioServiceFixture : CoreTest<RefreshStudioService>
    {
        private Studio _timedOutStudio;
        private Studio _successfulStudio;

        [SetUp]
        public void Setup()
        {
            _timedOutStudio = Builder<Studio>.CreateNew()
                .With(s => s.Id = 1)
                .With(s => s.ForeignId = "timed-out")
                .With(s => s.Title = "Timed Out Studio")
                .With(s => s.Monitored = true)
                .Build();

            _successfulStudio = Builder<Studio>.CreateNew()
                .With(s => s.Id = 2)
                .With(s => s.ForeignId = "successful")
                .With(s => s.Title = "Successful Studio")
                .With(s => s.Monitored = true)
                .Build();

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.GetById(_timedOutStudio.Id))
                .Returns(_timedOutStudio);

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.GetById(_successfulStudio.Id))
                .Returns(_successfulStudio);

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByStudioForeignId(It.IsAny<string>()))
                .Returns(new List<Movie>());

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.AllMovieStashIds())
                .Returns(new List<string>());

            Mocker.GetMock<IImportListExclusionService>()
                .Setup(s => s.GetAllExclusions())
                .Returns(new List<ImportListExclusion>());

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetStudioInfo(_timedOutStudio.ForeignId))
                .Returns(_timedOutStudio);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetStudioInfo(_successfulStudio.ForeignId))
                .Returns(_successfulStudio);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetStudioWorks(_timedOutStudio.ForeignId))
                .Throws(new WebException("Skyhook timeout"));

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetStudioWorks(_successfulStudio.ForeignId))
                .Returns((
                    new List<string>(),
                    new List<string>(),
                    new List<int>()));
        }

        [Test]
        public void should_continue_refreshing_studios_when_skyhook_times_out()
        {
            var command = new RefreshStudiosCommand(
                new List<int>
                {
                    _timedOutStudio.Id,
                    _successfulStudio.Id
                });

            Assert.DoesNotThrow(() => Subject.Execute(command));

            Mocker.GetMock<IProvideMovieInfo>()
                .Verify(
                    s => s.GetStudioWorks(_timedOutStudio.ForeignId),
                    Times.Once());

            Mocker.GetMock<IProvideMovieInfo>()
                .Verify(
                    s => s.GetStudioWorks(_successfulStudio.ForeignId),
                    Times.Once());
        }

        // A timeout is only one of the ways this call fails. GetStudioWorks
        // suppresses HTTP errors and throws them itself, so anything that is not
        // a 404 arrives as HttpException, which SyncStudioItems does not catch.
        [Test]
        public void should_continue_refreshing_studios_when_skyhook_returns_an_http_error()
        {
            var request = new HttpRequest("https://api.whisparr.com/v4/site/timed-out/works");
            var response = new HttpResponse(request, new HttpHeader(), string.Empty, HttpStatusCode.BadGateway);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetStudioWorks(_timedOutStudio.ForeignId))
                .Throws(new HttpException(request, response));

            var command = new RefreshStudiosCommand(
                new List<int>
                {
                    _timedOutStudio.Id,
                    _successfulStudio.Id
                });

            Assert.DoesNotThrow(() => Subject.Execute(command));

            Mocker.GetMock<IProvideMovieInfo>()
                .Verify(
                    s => s.GetStudioWorks(_successfulStudio.ForeignId),
                    Times.Once());
        }
    }
}
