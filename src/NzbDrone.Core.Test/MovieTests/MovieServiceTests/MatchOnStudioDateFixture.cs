using System.Collections.Generic;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Movies;

namespace NzbDrone.Core.Test.MovieTests.MovieServiceTests
{
    [TestFixture]
    public class MatchOnStudioDateFixture
    {
        private Mock<IMovieRepository> _movieRepositoryMock;
        private Mock<IConfigService> _configServiceMock;
        private MovieService _movieService;

        [SetUp]
        public void Setup()
        {
            _movieRepositoryMock = new Mock<IMovieRepository>();
            _configServiceMock = new Mock<IConfigService>();

            // Correct constructor order: IMovieRepository, IStudioService, IEventAggregator, IConfigService, IBuildMoviePaths, IAutoTaggingService, ICacheManager, Logger
            _movieService = new MovieService(
                _movieRepositoryMock.Object,
                null, // IStudioService
                null, // IEventAggregator
                _configServiceMock.Object,
                null, // IBuildMoviePaths
                null, // IAutoTaggingService
                null, // ICacheManager
                NzbDrone.Common.Instrumentation.NzbDroneLogger.GetLogger(typeof(MovieService))); // Logger
        }

        [Test]
        public void Should_return_movie_by_studio_and_date_when_setting_enabled_and_title_parse_fails()
        {
            var studioId = "studio-1";
            var releaseDate = "2023-01-01";
            var movie = new Movie { Id = 1 };
            movie.MovieMetadata.Value.StudioForeignId = studioId;
            movie.MovieMetadata.Value.ReleaseDate = releaseDate;

            _movieRepositoryMock.Setup(r => r.FindByStudioAndDate(studioId, releaseDate))
                .Returns(new List<Movie> { movie });
            _configServiceMock.SetupGet(c => c.WhisparrAutoMatchOnDate).Returns(true);

            var result = _movieService.InvokeFindByStudioAndReleaseDate(studioId, releaseDate, "", "", "");

            Assert.IsNotNull(result);
            Assert.AreEqual(movie.Id, result.Id);
        }

        [Test]
        public void Should_not_return_movie_by_studio_and_date_when_setting_disabled_and_title_parse_fails()
        {
            var studioId = "studio-1";
            var releaseDate = "2023-01-01";
            var movie = new Movie { Id = 1 };
            movie.MovieMetadata.Value.StudioForeignId = studioId;
            movie.MovieMetadata.Value.ReleaseDate = releaseDate;

            _movieRepositoryMock.Setup(r => r.FindByStudioAndDate(studioId, releaseDate))
                .Returns(new List<Movie> { movie });
            _configServiceMock.SetupGet(c => c.WhisparrAutoMatchOnDate).Returns(false);

            var result = _movieService.InvokeFindByStudioAndReleaseDate(studioId, releaseDate, "", "", "");

            Assert.IsNull(result);
        }
    }

    public static class MovieServiceTestExtensions
    {
        public static Movie InvokeFindByStudioAndReleaseDate(this MovieService service, string studioId, string releaseDate, string releaseTokens, string foreignId, string episode)
        {
            var method = typeof(MovieService).GetMethod("FindByStudioAndReleaseDate", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            return (Movie)method.Invoke(service, new object[] { studioId, releaseDate, releaseTokens, foreignId, episode, false, null });
        }
    }
}
