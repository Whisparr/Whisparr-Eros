using System.Collections.Generic;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Instrumentation;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser;

namespace NzbDrone.Core.Test.MovieTests.MovieServiceTests
{
    [TestFixture]
    public class FindFuzzyMovieByYearFixture
    {
        // Regression: indexers like Knaben/The Pirate Bay (via Prowlarr) prepend an all-caps category tag, e.g. "GAY:", to the release title. Exact-title matching then fails and there was no fallback for non-scene movies, so every such release was rejected as Unknown Movie (whisparr/whisparr#1257).
        private const int ReleaseYear = 2009;

        private Mock<IMovieRepository> _movieRepositoryMock;
        private Mock<IConfigService> _configServiceMock;
        private MovieService _movieService;

        [SetUp]
        public void Setup()
        {
            _movieRepositoryMock = new Mock<IMovieRepository>();
            _configServiceMock = new Mock<IConfigService>();

            // Constructor order: IMovieRepository, ICreditsService, IStudioService, IEventAggregator, IConfigService, IBuildMoviePaths, IAutoTaggingService, ICacheManager, Logger
            _movieService = new MovieService(
                _movieRepositoryMock.Object,
                null, // ICreditsService
                null, // IStudioService
                null, // IEventAggregator
                _configServiceMock.Object,
                null, // IBuildMoviePaths
                null, // IAutoTaggingService
                null, // ICacheManager
                NzbDroneLogger.GetLogger(typeof(MovieService)));

            // Mirror the production default (ConfigService.GetValueInt(..., 80)) so these positives prove the fix works for unconfigured users.
            _configServiceMock.SetupGet(c => c.WhisparrFuzzyTitleMatchingThreshold).Returns(80);
        }

        private static Movie CreateMovie(string title, int id = 0)
        {
            var movie = new Movie { Id = id, Title = title };

            // Populate CleanTitle exactly as AddMovieService and SkyHookProxy do, so these tests exercise the branch production actually takes rather than the Title fallback.
            movie.MovieMetadata.Value.CleanTitle = title.CleanMovieTitle();

            return movie;
        }

        [Test]
        public void Should_match_movie_when_release_has_leading_category_tag_and_exact_match_fails()
        {
            // The library entry is stored without the tag; the release carries a 5-char "GAY: " prefix.
            var movie = CreateMovie("To the Last Man: The Gathering Storm");

            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie> { movie });

            // CleanMovieTitle strips the leading tag and normalizes punctuation/spacing; with the release year appended on both sides the remaining delta is only the "gay" token.
            var result = _movieService.FindFuzzyMovieByYear("GAY: To the Last Man: The Gathering Storm", ReleaseYear);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Title, Is.EqualTo(movie.Title));
        }

        [Test]
        public void Should_match_movie_end_to_end_when_real_parser_produces_category_tagged_title()
        {
            // Full chain for whisparr/whisparr#1257: the exact release title from a Torznab indexer, parsed by the real parser, then fuzzy-matched. Exact-title matching fails on "GAY: ..." — this proves the fallback resolves it.
            var parsed = Parser.Parser.ParseMovieTitle("GAY: To the Last Man: The Gathering Storm (2009.xvid)");
            Assert.That(parsed, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(parsed.PrimaryMovieTitle, Does.StartWith("GAY:"));
                Assert.That(parsed.Year, Is.EqualTo(ReleaseYear));
            });

            var movie = CreateMovie("To the Last Man: The Gathering Storm");
            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, parsed.Year))
                .Returns(new List<Movie> { movie });

            var result = _movieService.FindFuzzyMovieByYear(parsed.PrimaryMovieTitle, parsed.Year);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Title, Is.EqualTo(movie.Title));
        }

        [Test]
        public void Should_match_movie_without_any_prefix_as_before()
        {
            var movie = CreateMovie("To the Last Man: The Gathering Storm");

            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie> { movie });

            var result = _movieService.FindFuzzyMovieByYear("To the Last Man: The Gathering Storm", ReleaseYear);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Title, Is.EqualTo(movie.Title));
        }

        [Test]
        public void Should_not_match_when_fuzzy_matching_is_disabled_below_threshold()
        {
            var movie = CreateMovie("To the Last Man: The Gathering Storm");

            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie> { movie });
            _configServiceMock.SetupGet(c => c.WhisparrFuzzyTitleMatchingThreshold).Returns(0); // below 70 disables fuzzy matching; the shipped default is 80

            var result = _movieService.FindFuzzyMovieByYear("GAY: To the Last Man: The Gathering Storm", ReleaseYear);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Should_not_match_when_no_candidates_for_year()
        {
            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie>());

            var result = _movieService.FindFuzzyMovieByYear("GAY: To the Last Man: The Gathering Storm", ReleaseYear);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Should_match_when_clean_title_was_never_populated()
        {
            // A movie added without a metadata refresh has a null CleanTitle; the fallback cleans Title instead.
            var movie = new Movie { Title = "To the Last Man: The Gathering Storm" };

            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie> { movie });

            var result = _movieService.FindFuzzyMovieByYear("GAY: To the Last Man: The Gathering Storm", ReleaseYear);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Title, Is.EqualTo(movie.Title));
        }

        [Test]
        public void Should_not_match_when_two_candidates_score_within_the_margin()
        {
            // Same-year near-duplicates (e.g. the same title from two studios) are ambiguous - returning either one would be a guess.
            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie>
                {
                    CreateMovie("To the Last Man: The Gathering Storm", 1),
                    CreateMovie("To the Last Man: The Gathering Storms", 2)
                });

            var result = _movieService.FindFuzzyMovieByYear("GAY: To the Last Man: The Gathering Storm", ReleaseYear);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Should_match_the_clear_winner_when_the_runner_up_is_outside_the_margin()
        {
            var winner = CreateMovie("To the Last Man: The Gathering Storm", 1);

            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie> { winner, CreateMovie("To the Last Woman", 2) });

            var result = _movieService.FindFuzzyMovieByYear("GAY: To the Last Man: The Gathering Storm", ReleaseYear);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Title, Is.EqualTo(winner.Title));
        }

        // A sequel scores ~95 against its predecessor, which is well above any usable threshold - only the trailing number tells them apart.
        [TestCase("Taboo 2", "Taboo")]
        [TestCase("Taboo", "Taboo 2")]
        [TestCase("Bad Boys 3", "Bad Boys")]
        [TestCase("Office Affairs Volume 2", "Office Affairs Volume 1")]
        [TestCase("Taboo III", "Taboo 2")]
        public void Should_not_match_across_a_different_sequel_number(string releaseTitle, string libraryTitle)
        {
            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie> { CreateMovie(libraryTitle) });

            var result = _movieService.FindFuzzyMovieByYear(releaseTitle, ReleaseYear);

            Assert.That(result, Is.Null);
        }

        [TestCase("GAY: Taboo 2", "Taboo 2")]
        [TestCase("GAY: Taboo II", "Taboo II")]
        public void Should_still_match_when_the_sequel_number_agrees(string releaseTitle, string libraryTitle)
        {
            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie> { CreateMovie(libraryTitle) });

            var result = _movieService.FindFuzzyMovieByYear(releaseTitle, ReleaseYear);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Title, Is.EqualTo(libraryTitle));
        }

        // Documents a known limitation rather than asserting desirable behaviour: the sequel guard accepts these (II and 2 are the same number), but the cleaned strings still differ enough that Fuzz.Ratio falls below the threshold. Exact matching already handles roman/arabic pairs, so this only bites a roman-numeral release whose title also failed exact matching.
        [TestCase("GAY: Taboo II", "Taboo 2")]
        [TestCase("GAY: Taboo 2", "Taboo II")]
        public void Should_not_currently_match_roman_and_arabic_forms_of_the_same_sequel(string releaseTitle, string libraryTitle)
        {
            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie> { CreateMovie(libraryTitle) });

            var result = _movieService.FindFuzzyMovieByYear(releaseTitle, ReleaseYear);

            Assert.That(result, Is.Null);
        }

        [Test]
        public void Should_not_match_unrelated_title_even_when_threshold_low()
        {
            var movie = CreateMovie("Some Completely Different Film");

            _movieRepositoryMock.Setup(r => r.FindByYear(ItemType.Movie, ReleaseYear))
                .Returns(new List<Movie> { movie });
            _configServiceMock.SetupGet(c => c.WhisparrFuzzyTitleMatchingThreshold).Returns(70);

            var result = _movieService.FindFuzzyMovieByYear("GAY: To the Last Man: The Gathering Storm", ReleaseYear);

            Assert.That(result, Is.Null);
        }
    }
}
