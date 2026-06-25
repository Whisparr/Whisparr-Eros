using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.ParserTests
{
    [TestFixture]
    public class NoDateEpisodicParserFixture : CoreTest
    {
        [TestCase("[Wildeer Studio] Lara In Trouble S01 E01 [1080p]", "Wildeer Studio", "Lara In Trouble", "1", "S01E01", "1", null, false)]
        [TestCase("[Wildeer Studio] Lara In Trouble S01E01 [1080p]", "Wildeer Studio", "Lara In Trouble", "1", "S01E01", "1", null, false)]
        [TestCase("[Wildeer Studio] Lara In Trouble S01 E01 - E06 [1080p]", "Wildeer Studio", "Lara In Trouble", "1", "S01E01", "1", "6", true)]
        [TestCase("[AgentRedGirl] All My Roommates Love Season 2: Episode 2", "AgentRedGirl", "All My Roommates Love", "2", "S02E02", "2", null, false)]
        [TestCase("[AgentRedGirl] All My Roommates Love Season 2 - Episode 2", "AgentRedGirl", "All My Roommates Love", "2", "S02E02", "2", null, false)]
        public void should_parse_no_date_episodic_release(
            string title,
            string studioTitle,
            string releaseTokens,
            string season,
            string episode,
            string episodeStart,
            string episodeEnd,
            bool isRange)
        {
            var result = Parser.Parser.ParseMovieTitle(title);

            result.Should().NotBeNull();
            result.IsScene.Should().BeTrue();
            result.IsNoDateEpisodic.Should().BeTrue();
            result.ParserSource.Should().Be("NoDateEpisodic");
            result.StudioTitle.Should().Be(studioTitle);
            result.ReleaseTokens.Should().Be(releaseTokens);
            result.MovieTitles[0].Should().Be(releaseTokens);
            result.Season.Should().Be(season);
            result.Episode.Should().Be(episode);
            result.EpisodeStart.Should().Be(episodeStart);
            result.EpisodeEnd.Should().Be(episodeEnd);
            result.IsEpisodeRange.Should().Be(isRange);
            result.ReleaseDate.Should().BeNullOrWhiteSpace();
        }

        [Test]
        public void should_parse_1080p_quality_for_no_date_episodic_release()
        {
            var result = Parser.Parser.ParseMovieTitle("[Wildeer Studio] Lara In Trouble S01 E01 [1080p]");

            result.Quality.Quality.Should().Be(Quality.WEBDL1080p);
        }

        [Test]
        public void should_override_weak_regex_match_for_wildeer_title()
        {
            var result = Parser.Parser.ParseMovieTitle("[Wildeer Studio] Lara In Trouble S01 E01 [1080p]");

            result.StudioTitle.Should().Be("Wildeer Studio");
            result.StudioTitle.Should().NotContain("[");
            result.ReleaseTokens.Should().Be("Lara In Trouble");
        }

        [TestCase("[Studio] Random Scene Title [1080p]")]
        [TestCase("[Studio] The S01 Experiment [1080p]")]
        [TestCase("[Studio] Some Title Part 01 [1080p]")]
        [TestCase("[Studio] Episode Title Without Number [1080p]")]
        public void should_not_parse_generic_bracketed_release_as_no_date_episodic(string title)
        {
            var result = Parser.Parser.ParseMovieTitle(title);

            if (result != null)
            {
                result.IsNoDateEpisodic.Should().BeFalse();
            }
        }

        [TestCase("Studio.24.06.14.Some.Scene.Title.1080p.WEB-DL")]
        [TestCase("Studio.2024.06.14.Some.Scene.Title.2160p.WEB-DL")]
        [TestCase("[Vixen] Matthew Meie, Erica Mori & Era Queen - Bratty College Girls Have Naughty Threesome (2025-12-03) [2160p]")]
        public void should_not_mark_dated_scenes_as_no_date_episodic(string title)
        {
            var result = Parser.Parser.ParseMovieTitle(title);

            result.Should().NotBeNull();
            result.IsNoDateEpisodic.Should().BeFalse();
        }
    }
}
