using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
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

        [SetUp]
        public void Setup()
        {
            var scenes = new List<Movie>
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
                .Returns(() => scenes.ToList());
        }

        private static Movie CreateScene(int id, string title, string releaseDate, params string[] performers)
        {
            var movie = new Movie
            {
                Id = id,
                Title = title,
                ForeignId = $"00000000-0000-0000-0000-00000000000{id}"
            };

            movie.MovieMetadata.Value.ReleaseDate = releaseDate;
            movie.MovieMetadata.Value.Credits = performers.Select(p => new Credit { Character = "", Performer = new CreditPerformer { Name = p, Gender = Gender.Male } }).ToList();

            return movie;
        }

        private Movie FindScene(string title, bool interactive)
        {
            var parsedMovieInfo = Parser.Parser.ParseMovieTitle(title);

            parsedMovieInfo.IsDatelessScene.Should().BeTrue();

            return Subject.FindScene(parsedMovieInfo, interactive, null);
        }

        // Title & Performer
        [TestCase("Helix Studios - Shower Sex - Joey Mills & Landon Vega [720p].mp4", 1)]
        [TestCase("Helix Studios - Spitroasted - Blake Mitchell, Corbin Colby & Clay Turner [1080p+Photoset]", 3)]

        // Exact title
        [TestCase("Helix Studios - Twinks at Play.mp4", 2)]
        [TestCase("Helix Studios - Poolside (1080p)", 4)]
        public void should_match_confident_dateless_release_automatically(string title, int id)
        {
            var movie = FindScene(title, false);

            movie.Should().NotBeNull();
            movie.Id.Should().Be(id);
        }

        [TestCase("Helix Studios - Shower Sex - Joey Mills & Landon Vega [720p].mp4", 1)]
        [TestCase("Helix Studios - Twinks at Play.mp4", 2)]
        public void should_match_confident_dateless_release_interactively(string title, int id)
        {
            var movie = FindScene(title, true);

            movie.Should().NotBeNull();
            movie.Id.Should().Be(id);
        }

        // Performer only [PerformersTitle]
        [TestCase("Helix Studios - Dakota Lovell [720p]", 4)]

        // All performers, not the title [PerformersNotTitle]
        [TestCase("Helix Studios - Hot Afternoon - Dakota Lovell [720p]", 4)]

        // Title contained, no performer [ParsedTitleContainsCleanTitle]
        [TestCase("Helix Studios - Twinks at Play BTS [720p]", 2)]
        public void should_only_match_weak_dateless_release_in_interactive_search(string title, int id)
        {
            FindScene(title, false).Should().BeNull();

            var movie = FindScene(title, true);

            movie.Should().NotBeNull();
            movie.Id.Should().Be(id);
        }

        // Two scenes of the studio share the title, nothing distinguishes them
        [TestCase("Helix Studios - Locker Room [720p]")]

        // Title shared by scenes 1 and 7, no performer to tell them apart
        [TestCase("Helix Studios - Shower Sex [720p]")]
        public void should_not_match_ambiguous_dateless_release(string title)
        {
            FindScene(title, false).Should().BeNull();
            FindScene(title, true).Should().BeNull();
        }

        [Test]
        public void should_use_performer_to_disambiguate_shared_title()
        {
            var movie = FindScene("Helix Studios - Shower Sex - Cameron Parks [720p]", false);

            movie.Should().NotBeNull();
            movie.Id.Should().Be(7);
        }

        [Test]
        public void should_not_match_unknown_studio()
        {
            FindScene("Unknown Studio - Shower Sex - Joey Mills & Landon Vega [720p]", true).Should().BeNull();
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
    }
}
