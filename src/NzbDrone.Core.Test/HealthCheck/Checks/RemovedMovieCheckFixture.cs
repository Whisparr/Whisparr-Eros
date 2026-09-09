using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.HealthCheck.Checks;
using NzbDrone.Core.Localization;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.HealthCheck.Checks
{
    [TestFixture]
    public class RemovedMovieCheckFixture : CoreTest<RemovedMovieCheck>
    {
        // Mirrors the RemovedMovieCheck* strings in src/NzbDrone.Core/Localization/Core/en.json so rendered messages can be asserted.
        private static readonly Dictionary<string, string> Templates = new Dictionary<string, string>
        {
            { "RemovedMovieCheckSingleMessage", "Movie: {movie} was removed from TMDb/TPDb" },
            { "RemovedMovieCheckMultipleMessage", "Movies: {movies} were removed from TMDb/TPDb" },
            { "RemovedMovieCheckSceneSingleMessage", "Scene: {scene} was removed from StashDB" },
            { "RemovedMovieCheckSceneMultipleMessage", "Scenes: {scenes} were removed from StashDB" }
        };

        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<ILocalizationService>()
                  .Setup(s => s.GetLocalizedString(It.IsAny<string>()))
                  .Returns("Some Warning Message");

            Mocker.GetMock<ILocalizationService>()
                  .Setup(s => s.GetLocalizedString(It.IsAny<string>(), It.IsAny<Dictionary<string, object>>()))
                  .Returns((string phrase, Dictionary<string, object> tokens) => GetPhrase(phrase, tokens));
        }

        private static string GetPhrase(string phrase, Dictionary<string, object> tokens)
        {
            var template = Templates.TryGetValue(phrase, out var value) ? value : phrase;

            foreach (var token in tokens)
            {
                template = template.Replace("{" + token.Key + "}", token.Value?.ToString() ?? string.Empty);
            }

            return template;
        }

        private static Movie CreateDeletedItem(int id, string title, string foreignId, ItemType itemType)
        {
            var movie = new Movie
            {
                Id = id,
                Title = title,
                ForeignId = foreignId
            };

            movie.MovieMetadata.Value.ItemType = itemType;
            movie.MovieMetadata.Value.Status = MovieStatusType.Deleted;

            return movie;
        }

        private void GivenDeletedItems(params Movie[] movies)
        {
            Mocker.GetMock<IMovieService>()
                  .Setup(v => v.GetAllMovies())
                  .Returns(movies.ToList());
        }

        private void GivenMovie(int amount, int deleted)
        {
            List<Movie> movie;

            if (amount == 0)
            {
                movie = new List<Movie>();
            }
            else if (deleted == 0)
            {
                movie = Builder<Movie>.CreateListOfSize(amount)
                    .All()
                    .With(v => v.MovieMetadata.Value.Status = MovieStatusType.Released)
                    .BuildList();
            }
            else
            {
                movie = Builder<Movie>.CreateListOfSize(amount)
                    .All()
                    .With(v => v.MovieMetadata.Value.Status = MovieStatusType.Released)
                    .Random(deleted)
                    .With(v => v.MovieMetadata.Value.Status = MovieStatusType.Deleted)
                    .BuildList();
            }

            Mocker.GetMock<IMovieService>()
                .Setup(v => v.GetAllMovies())
                .Returns(movie);
        }

        [Test]
        public void should_return_error_if_movie_no_longer_on_tmdb()
        {
            GivenMovie(4, 1);

            Subject.Check().ShouldBeError();
        }

        [Test]
        public void should_return_error_if_multiple_movie_no_longer_on_tmdb()
        {
            GivenMovie(4, 2);

            Subject.Check().ShouldBeError();
        }

        [Test]
        public void should_return_ok_if_all_movie_still_on_tmdb()
        {
            GivenMovie(4, 0);

            Subject.Check().ShouldBeOk();
        }

        [Test]
        public void should_return_ok_if_no_movie_exist()
        {
            GivenMovie(0, 0);

            Subject.Check().ShouldBeOk();
        }

        [Test]
        public void should_link_single_removed_movie_to_details_page()
        {
            GivenDeletedItems(CreateDeletedItem(10, "The Full Service", "97f46bae-2843-48c5-b48f-c5574162203b", ItemType.Movie));

            var result = Subject.Check();

            result.ShouldBeError(wikiFragment: "#movie-was-removed-from-tmdb");
            result.Message.Should().Be("Movie: [The Full Service](/movie/10) (tmdbid 97f46bae-2843-48c5-b48f-c5574162203b) was removed from TMDb/TPDb");
        }

        [Test]
        public void should_report_single_removed_scene_from_stashdb_not_tmdb()
        {
            GivenDeletedItems(CreateDeletedItem(11, "Take Control", "740d6863-aeff-44d0-be88-949e464f4264", ItemType.Scene));

            var result = Subject.Check();

            result.ShouldBeError();
            result.Message.Should().Be("Scene: [Take Control](/movie/11) (stashid 740d6863-aeff-44d0-be88-949e464f4264) was removed from StashDB");
            result.WikiUrl.ToString().Should().NotContain("#movie-was-removed-from-tmdb");
        }

        [Test]
        public void should_link_each_removed_movie_in_multiple_message()
        {
            GivenDeletedItems(
                CreateDeletedItem(1, "Alpha", "aaaaaaaa-bbbb-cccc-dddd-eeee00001111", ItemType.Movie),
                CreateDeletedItem(2, "Beta", "99998888-7777-6666-5555-444433332222", ItemType.Movie));

            var result = Subject.Check();

            result.ShouldBeError(wikiFragment: "#movie-was-removed-from-tmdb");
            result.Message.Should().Be("Movies: [Alpha](/movie/1) (tmdbid aaaaaaaa-bbbb-cccc-dddd-eeee00001111), [Beta](/movie/2) (tmdbid 99998888-7777-6666-5555-444433332222) were removed from TMDb/TPDb");
        }

        [Test]
        public void should_report_multiple_removed_scenes_from_stashdb()
        {
            GivenDeletedItems(
                CreateDeletedItem(3, "Gamma", "12121212-3434-5656-7878-909090909090", ItemType.Scene),
                CreateDeletedItem(4, "Delta", "abababab-cdcd-efef-0f0f-121212123434", ItemType.Scene));

            var result = Subject.Check();

            result.ShouldBeError();
            result.Message.Should().Be("Scenes: [Gamma](/movie/3) (stashid 12121212-3434-5656-7878-909090909090), [Delta](/movie/4) (stashid abababab-cdcd-efef-0f0f-121212123434) were removed from StashDB");
        }

        [Test]
        public void should_group_mixed_batch_by_metadata_source()
        {
            GivenDeletedItems(
                CreateDeletedItem(5, "Scene One", "fedcba98-7654-3210-fedc-ba9876543210", ItemType.Scene),
                CreateDeletedItem(6, "Movie One", "13579246-8024-6810-2468-024680246802", ItemType.Movie),
                CreateDeletedItem(7, "Scene Two", "24680246-8024-6810-2468-024680246803", ItemType.Scene));

            var result = Subject.Check();

            // Movies come first, then scenes; each group keeps its own source and grammar.
            result.Message.Should().Be("Movie: [Movie One](/movie/6) (tmdbid 13579246-8024-6810-2468-024680246802) was removed from TMDb/TPDb; Scenes: [Scene One](/movie/5) (stashid fedcba98-7654-3210-fedc-ba9876543210), [Scene Two](/movie/7) (stashid 24680246-8024-6810-2468-024680246803) were removed from StashDB");
            result.WikiUrl.ToString().Should().NotContain("#movie-was-removed-from-tmdb");
        }
    }
}
