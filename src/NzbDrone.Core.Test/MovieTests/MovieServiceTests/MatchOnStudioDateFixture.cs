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
                null, // ICreditsService
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

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(movie.Id));
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

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Should_not_match_release_with_different_date_via_studio_fallback_when_WhisparrAutoMatchOnDate_enabled()
        {
            // Regression: searching for a movie by date returns releases from the same studio with
            // different dates. The studio has only one library movie, so GetByStudioForeignId returns
            // a single result. WhisparrAutoMatchOnDate must NOT fire here because the date query
            // itself found nothing — we fell back to the studio-only query (verifyDate=true).
            var studioId = "studio-1";
            var libraryMovieDate = "2022-11-16";
            var releaseDateNotInLibrary = "2022-11-30";

            var libraryMovie = new Movie { Id = 1 };
            libraryMovie.MovieMetadata.Value.StudioForeignId = studioId;
            libraryMovie.MovieMetadata.Value.ReleaseDate = libraryMovieDate;

            _movieRepositoryMock.Setup(r => r.FindByStudioAndDate(studioId, releaseDateNotInLibrary))
                .Returns(new List<Movie>());
            _movieRepositoryMock.Setup(r => r.GetByStudioForeignId(studioId))
                .Returns(new List<Movie> { libraryMovie });
            _configServiceMock.SetupGet(c => c.WhisparrAutoMatchOnDate).Returns(true);

            var result = _movieService.InvokeFindByStudioAndReleaseDate(studioId, releaseDateNotInLibrary, "", "", "");

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Should_still_match_when_date_query_finds_exactly_one_movie_and_WhisparrAutoMatchOnDate_enabled()
        {
            // The date query itself returns the one matching movie — WhisparrAutoMatchOnDate
            // should still fire in this case (verifyDate=false, genuine date match).
            var studioId = "studio-1";
            var releaseDate = "2022-11-16";

            var movie = new Movie { Id = 1 };
            movie.MovieMetadata.Value.StudioForeignId = studioId;
            movie.MovieMetadata.Value.ReleaseDate = releaseDate;

            _movieRepositoryMock.Setup(r => r.FindByStudioAndDate(studioId, releaseDate))
                .Returns(new List<Movie> { movie });
            _configServiceMock.SetupGet(c => c.WhisparrAutoMatchOnDate).Returns(true);

            var result = _movieService.InvokeFindByStudioAndReleaseDate(studioId, releaseDate, "", "", "");

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(movie.Id));
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
