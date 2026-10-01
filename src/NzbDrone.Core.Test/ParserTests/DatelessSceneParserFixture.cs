using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.ParserTests
{
    [TestFixture]
    public class DatelessSceneParserFixture : CoreTest
    {
        [TestCase("Helix - Twinks at Play.mp4", "Helix", "twinks at play")]
        [TestCase("Helix Studios - Shower Sex - Joey Mills & Landon Vega [720p].mp4", "Helix Studios", "shower sex joey mills and landon vega")]
        [TestCase("Helix Studios - Spitroasted - Blake Mitchell, Corbin Colby & Clay Turner [1080p+Photoset]", "Helix Studios", "spitroasted blake mitchell corbin colby and clay turner")]
        [TestCase("Helix - Return to Helix Academy ~HEVC (1080p)", "Helix", "return to helix academy")]
        [TestCase("Bully Him – You can't Hide From Me – Cyrus Stark & Jack Waters (1080P)", "Bully Him", "you can t hide from me cyrus stark and jack waters")]
        [TestCase("[Bromo] Bet Your Ass - Ryan Jacobs & Sunny D (1080p).mp4", "Bromo", "bet your ass ryan jacobs and sunny d")]
        [TestCase("SayUncle Labs - Concept - Gay Sex Confessions No 2 - Luke Hudson and Ricky Larkin (720p)", "SayUncle Labs", "concept gay sex confessions no 2 luke hudson and ricky larkin")]
        [TestCase("Next Door Originals - Nico Coopa & Joseph Castlian - Helping You Out [720p].mp4", "Next Door Originals", "nico coopa and joseph castlian helping you out")]
        [TestCase("Sketchy Sex - Big Dick Stairway - 0116.mp4", "Sketchy Sex", "big dick stairway 0116")]
        [TestCase("TwinkPOP - Sweet Twink Sweat - Callum West, Maverick Sun BB 1080p.mp4", "TwinkPOP", "sweet twink sweat callum west maverick sun bb")]
        public void should_parse_dateless_studio_title_release(string title, string studio, string releaseTokens)
        {
            var result = Parser.Parser.ParseMovieTitle(title);

            result.Should().NotBeNull();
            result.IsScene.Should().BeTrue();
            result.IsDatelessScene.Should().BeTrue();
            result.StudioTitle.Should().Be(studio);
            result.ReleaseDate.Should().BeNullOrEmpty();
            result.Episode.Should().BeNullOrEmpty();
            Parser.Parser.NormalizeEpisodeTitle(result.ReleaseTokens).Should().Be(releaseTokens);
        }

        [TestCase("Helix Studios - Shower Sex - Joey Mills & Landon Vega [720p].mp4", 720)]
        [TestCase("Helix Studios - Spitroasted - Blake Mitchell, Corbin Colby & Clay Turner [1080p+Photoset]", 1080)]
        [TestCase("Bully Him – You can't Hide From Me – Cyrus Stark & Jack Waters (1080P)", 1080)]
        public void should_still_parse_quality_of_dateless_release(string title, int resolution)
        {
            Parser.Parser.ParseMovieTitle(title).Quality.Quality.Resolution.Should().Be(resolution);
        }

        // Not "[720p]": ReleaseGroupParser takes a trailing "[720p]" block as the group for any release name, dateless or not
        [TestCase("[Bromo] Bet Your Ass - Ryan Jacobs & Sunny D (1080p).mp4")]
        [TestCase("SayUncle Labs - Concept - Gay Sex Confessions No 2 - Luke Hudson and Ricky Larkin (720p)")]
        [TestCase("Helix - Return to Helix Academy ~HEVC (1080p)")]
        [TestCase("Bully Him – You can't Hide From Me – Cyrus Stark & Jack Waters (1080P)")]
        [TestCase("TwinkPOP - Sweet Twink Sweat - Callum West, Maverick Sun BB 1080p.mp4")]
        public void should_not_parse_release_group_from_dateless_release(string title)
        {
            Parser.Parser.ParseMovieTitle(title).ReleaseGroup.Should().BeNullOrEmpty();
        }

        // Dated patterns keep priority over the dateless one
        [TestCase("Pure Taboo - Sarah Arabic, Lily LaBeau - A Costly Divorce (June 24, 2025) [1080p HEVC x265]", "Pure Taboo", "2025-06-24")]
        [TestCase("Studio - Performer Name - Some Title (10.01.2024)", "Studio", "2024-01-10")]
        [TestCase("Studio - 2017-08-04 - Some Title. [WEBDL-480p]", "Studio", "2017-08-04")]
        [TestCase("[Deeper] Key Mistress - Jessi Rae - 2025-12-18 - 1080p", "Deeper", "2025-12-18")]
        [TestCase("[BellesaFilms] The Sister - Ashley Lane, Mannie Coco (2025-09-28) [2160p]", "BellesaFilms", "2025-09-28")]
        public void should_prefer_dated_patterns(string title, string studio, string releaseDate)
        {
            var result = Parser.Parser.ParseMovieTitle(title);

            result.IsDatelessScene.Should().BeFalse();
            result.StudioTitle.Should().Be(studio);
            result.ReleaseDate.Should().Be(releaseDate);
        }

        [TestCase("The.Movie.Title.2019.1080p.BluRay.x264-GRP", "The Movie Title", 2019)]
        [TestCase("Movie Title - Directors Cut (2010) 1080p", "Movie Title", 2010)]
        [TestCase("Show.Name.S01E02.720p.HDTV.x264-GRP", "Show Name S01E02", 0)]
        [TestCase("Show Name - S01E02 - Episode Title [720p]", "Show Name - S01E02 - Episode Title [", 0)]
        [TestCase("Elegant Angel.2024.Oil Explosion 8.1080p-VERIFIED", "Oil Explosion 8", 2024)]
        [TestCase("Oil Explosion 3 (Elegant Angel) XXX DVDRip NEW 2018", "Oil Explosion 3", 2018)]
        public void should_not_parse_movies_and_tv_as_dateless_scene(string title, string movieTitle, int year)
        {
            var result = Parser.Parser.ParseMovieTitle(title);

            result.IsScene.Should().BeFalse();
            result.IsDatelessScene.Should().BeFalse();
            result.PrimaryMovieTitle.Should().Be(movieTitle);
            result.Year.Should().Be(year);
        }

        [TestCase("A Very Long Studio Name Here - Title")]
        [TestCase("[ABC] Letters Only")]
        [TestCase("No Separator Here")]
        public void should_not_parse_as_dateless_scene(string title)
        {
            var result = Parser.Parser.ParseMovieTitle(title);

            (result == null || !result.IsDatelessScene).Should().BeTrue();
        }

        [Test]
        public void should_keep_full_name_as_movie_title_for_movie_fallback()
        {
            var result = Parser.Parser.ParseMovieTitle("Mission Impossible - Ghost Protocol 1080p");

            result.IsDatelessScene.Should().BeTrue();
            result.StudioTitle.Should().Be("Mission Impossible");
            result.PrimaryMovieTitle.Should().Be("Mission Impossible - Ghost Protocol");
        }
    }
}
