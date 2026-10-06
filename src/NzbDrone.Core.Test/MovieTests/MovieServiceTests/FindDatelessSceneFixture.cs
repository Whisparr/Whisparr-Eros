using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests.MovieServiceTests
{
    [TestFixture]
    public class FindDatelessSceneFixture : CoreTest<MovieService>
    {
        private const string StudioForeignId = "helix-studios";

        // Where the release comes from: RSS sync (no search criteria), an automatic search or an interactive search
        public enum Source
        {
            Rss,
            Search,
            Interactive
        }

        private List<Movie> _scenes;

        [SetUp]
        public void Setup()
        {
            _scenes = new List<Movie>
            {
                CreateScene(1, "Shower Sex", "2019-03-01", "Joey Mills", "Landon Vega"),
                CreateScene(2, "Twinks at Play", "2018-05-02", "Blake Mitchell"),
                CreateScene(3, "Spitroasted", "2020-07-03", "Blake Mitchell", "Corbin Colby", "Clay Turner"),
                CreateScene(4, "Poolside", "2021-08-04", "Dakota Lovell"),
                CreateScene(5, "Locker Room", "2017-01-05", "Kyle Ross"),
                CreateScene(6, "Locker Room", "2022-02-06", "Ashton Summers"),
                CreateScene(7, "Shower Sex", "2023-09-07", "Cameron Parks"),
            };

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.FindAllByTitle(It.Is<string>(t => t == "Helix Studios")))
                .Returns(new List<Studio> { new Studio { ForeignId = StudioForeignId } });

            Mocker.GetMock<IMovieRepository>()
                .Setup(s => s.GetByStudioForeignId(StudioForeignId))
                .Returns(() => _scenes.ToList());
        }

        private static Movie CreateScene(int id, string title, string releaseDate, params string[] performers)
        {
            var movie = new Movie
            {
                Id = id,
                Title = title,
                ForeignId = $"00000000-0000-0000-0000-00000000000{id}"
            };

            movie.MovieMetadata.Value.Id = id;
            movie.MovieMetadata.Value.ReleaseDate = releaseDate;
            movie.MovieMetadata.Value.Credits = performers.Select(p => new Credit { Character = "", Performer = new CreditPerformer { Name = p, Gender = Gender.Male } }).ToList();

            return movie;
        }

        private Movie FindScene(string title, Source source)
        {
            var parsedMovieInfo = Parser.Parser.ParseMovieTitle(title);

            parsedMovieInfo.IsDatelessScene.Should().BeTrue();

            var searchCriteria = source == Source.Rss ? null : new MovieSearchCriteria { InteractiveSearch = source == Source.Interactive };

            return Subject.FindScene(parsedMovieInfo, source == Source.Interactive, searchCriteria);
        }

        [TestCase("Helix Studios - Twinks at Play.mp4", 2)]
        [TestCase("Helix Studios - Poolside (1080p)", 4)]
        public void should_match_exact_title_from_every_source(string title, int id)
        {
            foreach (var source in new[] { Source.Rss, Source.Search, Source.Interactive })
            {
                var movie = FindScene(title, source);

                movie.Should().NotBeNull();
                movie.Id.Should().Be(id);
            }
        }

        // Title & Performer
        [TestCase("Helix Studios - Shower Sex - Joey Mills & Landon Vega [720p].mp4", 1)]
        [TestCase("Helix Studios - Spitroasted - Blake Mitchell, Corbin Colby & Clay Turner [1080p+Photoset]", 3)]
        public void should_only_match_title_and_performer_in_a_search(string title, int id)
        {
            FindScene(title, Source.Rss).Should().BeNull();

            foreach (var source in new[] { Source.Search, Source.Interactive })
            {
                var movie = FindScene(title, source);

                movie.Should().NotBeNull();
                movie.Id.Should().Be(id);
            }
        }

        // Performer only [PerformersTitle]
        [TestCase("Helix Studios - Dakota Lovell [720p]", 4)]

        // All performers, not the title [PerformersNotTitle]
        [TestCase("Helix Studios - Hot Afternoon - Dakota Lovell [720p]", 4)]

        // Title contained, no performer [ParsedTitleContainsCleanTitle]
        [TestCase("Helix Studios - Twinks at Play BTS [720p]", 2)]
        public void should_only_match_weak_dateless_release_in_interactive_search(string title, int id)
        {
            FindScene(title, Source.Rss).Should().BeNull();
            FindScene(title, Source.Search).Should().BeNull();

            var movie = FindScene(title, Source.Interactive);

            movie.Should().NotBeNull();
            movie.Id.Should().Be(id);
        }

        // Two scenes of the studio share the title, nothing distinguishes them
        [TestCase("Helix Studios - Locker Room [720p]")]

        // Title shared by scenes 1 and 7, no performer to tell them apart
        [TestCase("Helix Studios - Shower Sex [720p]")]
        public void should_not_match_ambiguous_dateless_release(string title)
        {
            FindScene(title, Source.Rss).Should().BeNull();
            FindScene(title, Source.Search).Should().BeNull();
            FindScene(title, Source.Interactive).Should().BeNull();
        }

        [Test]
        public void should_use_performer_to_disambiguate_shared_title_in_a_search()
        {
            var movie = FindScene("Helix Studios - Shower Sex - Cameron Parks [720p]", Source.Search);

            movie.Should().NotBeNull();
            movie.Id.Should().Be(7);
        }

        [Test]
        public void should_not_match_another_scene_from_rss_when_the_catalogue_is_missing_the_real_one()
        {
            // The real "Shower Sex" isn't in the library, but a scene titled "Sex" with the same performer is
            _scenes = new List<Movie>
            {
                CreateScene(8, "Sex", "2016-04-08", "Joey Mills"),
                CreateScene(2, "Twinks at Play", "2018-05-02", "Blake Mitchell"),
            };

            FindScene("Helix Studios - Shower Sex - Joey Mills [720p]", Source.Rss).Should().BeNull();
        }

        [Test]
        public void should_only_match_the_scene_title_as_whole_words_in_a_search()
        {
            _scenes = new List<Movie>
            {
                CreateScene(8, "Pool", "2016-04-08", "Joey Mills"),
                CreateScene(2, "Twinks at Play", "2018-05-02", "Blake Mitchell"),
            };

            FindScene("Helix Studios - Poolside Fun - Joey Mills [720p]", Source.Search).Should().BeNull();
        }

        [Test]
        public void should_only_match_a_performer_as_whole_words_in_a_search()
        {
            _scenes = new List<Movie>
            {
                CreateScene(8, "Shower Sex", "2016-04-08", "Alex"),
                CreateScene(2, "Twinks at Play", "2018-05-02", "Blake Mitchell"),
            };

            FindScene("Helix Studios - Shower Sex - Alexander Volkov [720p]", Source.Search).Should().BeNull();

            var movie = FindScene("Helix Studios - Shower Sex - Alex [720p]", Source.Search);

            movie.Should().NotBeNull();
            movie.Id.Should().Be(8);
        }

        [Test]
        public void should_not_load_credits_from_rss()
        {
            GivenScenesWithoutCredits();

            FindScene("Helix Studios - Shower Sex - Joey Mills & Landon Vega [720p].mp4", Source.Rss).Should().BeNull();

            Mocker.GetMock<ICreditService>()
                  .Verify(v => v.GetAllCreditsForMovieMetadata(It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_only_load_credits_of_scenes_named_in_the_release_in_a_search()
        {
            GivenScenesWithoutCredits();

            FindScene("Helix Studios - Shower Sex - Joey Mills & Landon Vega [720p].mp4", Source.Search);

            // Scenes 1 and 7 are both titled "Shower Sex"
            Mocker.GetMock<ICreditService>()
                  .Verify(v => v.GetAllCreditsForMovieMetadata(It.Is<int>(id => id != 1 && id != 7)), Times.Never());
        }

        [Test]
        public void should_not_match_unknown_studio()
        {
            FindScene("Unknown Studio - Shower Sex - Joey Mills & Landon Vega [720p]", Source.Interactive).Should().BeNull();
        }

        [Test]
        public void should_not_change_dated_release_matching()
        {
            Mocker.GetMock<IMovieRepository>()
                .Setup(s => s.FindByStudioAndDate(StudioForeignId, "2021-08-04"))
                .Returns(new List<Movie> { CreateScene(4, "Poolside", "2021-08-04", "Dakota Lovell") });

            var parsedMovieInfo = Parser.Parser.ParseMovieTitle("Helix Studios - 2021-08-04 - Dakota Lovell [720p]");

            parsedMovieInfo.IsDatelessScene.Should().BeFalse();

            // Performer-only match with a matching date stays an automatic match
            var movie = Subject.FindScene(parsedMovieInfo, false, null);

            movie.Should().NotBeNull();
            movie.Id.Should().Be(4);
        }

        private void GivenScenesWithoutCredits()
        {
            foreach (var scene in _scenes)
            {
                scene.MovieMetadata.Value.Credits = new List<Credit>();
            }

            Mocker.GetMock<ICreditService>()
                  .Setup(s => s.GetAllCreditsForMovieMetadata(It.IsAny<int>()))
                  .Returns(new List<Credit>());
        }
    }
}
