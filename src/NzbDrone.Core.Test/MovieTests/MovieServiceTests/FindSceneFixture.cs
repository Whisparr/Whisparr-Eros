using System.Collections.Generic;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.Test.MovieTests.MovieServiceTests
{
    [TestFixture]
    public class FindSceneFixture
    {
        private Mock<IMovieRepository> _movieRepositoryMock;
        private Mock<IStudioService> _studioServiceMock;
        private Mock<IConfigService> _configServiceMock;
        private MovieService _movieService;

        [SetUp]
        public void Setup()
        {
            _movieRepositoryMock = new Mock<IMovieRepository>();
            _studioServiceMock = new Mock<IStudioService>();
            _configServiceMock = new Mock<IConfigService>();

            _movieService = new MovieService(
                _movieRepositoryMock.Object,
                null, // ICreditsService
                _studioServiceMock.Object,
                null, // IEventAggregator
                _configServiceMock.Object,
                null, // IBuildMoviePaths
                null, // IAutoTaggingService
                null, // ICacheManager
                NzbDrone.Common.Instrumentation.NzbDroneLogger.GetLogger(typeof(MovieService)));
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public void Should_not_look_up_studios_when_release_has_no_studio_title(string studioTitle)
        {
            // Only the scene parse path assigns StudioTitle. A release that parsed as a movie
            // arrives with none, and looking it up fanned a studio-catalog query out across
            // every studio whose CleanSearchTitle was blank.
            var parsedMovieInfo = new ParsedMovieInfo { StudioTitle = studioTitle };

            var result = _movieService.FindScene(parsedMovieInfo);

            Assert.That(result, Is.Null);
            _studioServiceMock.Verify(s => s.FindAllByTitle(It.IsAny<string>()), Times.Never);
            _movieRepositoryMock.Verify(r => r.GetByStudioForeignId(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public void Should_still_look_up_studios_when_release_has_a_studio_title()
        {
            var parsedMovieInfo = new ParsedMovieInfo { StudioTitle = "Cosmid", ReleaseDate = "2025-05-17" };

            _studioServiceMock.Setup(s => s.FindAllByTitle("Cosmid"))
                .Returns(new List<Studio>());

            _movieService.FindScene(parsedMovieInfo);

            _studioServiceMock.Verify(s => s.FindAllByTitle("Cosmid"), Times.Once);
        }

        [Test]
        public void Should_query_studio_and_date_only_once_per_studio()
        {
            // The fuzzy pass and the match pass both used to run the same query.
            var studioId = "studio-1";
            var releaseDate = "2025-05-17";

            var parsedMovieInfo = new ParsedMovieInfo
            {
                StudioTitle = "Cosmid",
                ReleaseDate = releaseDate,
                ReleaseTokens = "some tokens"
            };

            _studioServiceMock.Setup(s => s.FindAllByTitle("Cosmid"))
                .Returns(new List<Studio> { new Studio { ForeignId = studioId } });

            _movieRepositoryMock.Setup(r => r.FindByStudioAndDate(studioId, releaseDate))
                .Returns(new List<Movie>());
            _movieRepositoryMock.Setup(r => r.GetByStudioForeignId(studioId))
                .Returns(new List<Movie>());

            _movieService.FindScene(parsedMovieInfo);

            _movieRepositoryMock.Verify(r => r.FindByStudioAndDate(studioId, releaseDate), Times.Once);
        }
    }
}
