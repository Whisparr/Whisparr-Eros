using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests.MovieServiceTests
{
    [TestFixture]
    public class NoDateEpisodicMatchFixture : CoreTest<MovieService>
    {
        private Movie _targetScene;
        private ParsedMovieInfo _singleEpisodeParse;
        private ParsedMovieInfo _rangePackParse;

        [SetUp]
        public void Setup()
        {
            _targetScene = Builder<Movie>.CreateNew()
                .With(m => m.Id = 42)
                .With(m => m.Title = "Lara in Trouble S01 E01")
                .With(m => m.MovieMetadata.Value.StudioTitle = "Wildeer Studio")
                .With(m => m.MovieMetadata.Value.StudioForeignId = "wildeer-studio-id")
                .With(m => m.MovieMetadata.Value.ItemType = ItemType.Scene)
                .Build();

            _singleEpisodeParse = new ParsedMovieInfo
            {
                StudioTitle = "Wildeer Studio",
                ReleaseTokens = "Lara In Trouble",
                Season = "1",
                Episode = "S01E01",
                EpisodeStart = "1",
                IsNoDateEpisodic = true
            };

            _rangePackParse = new ParsedMovieInfo
            {
                StudioTitle = "Wildeer Studio",
                ReleaseTokens = "Lara In Trouble",
                Season = "1",
                Episode = "S01E01",
                EpisodeStart = "1",
                EpisodeEnd = "6",
                IsNoDateEpisodic = true,
                IsEpisodeRange = true
            };

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.FindAllByTitle("Wildeer Studio"))
                .Returns(new List<Studio>
                {
                    new Studio { ForeignId = "wildeer-studio-id", Title = "Wildeer Studio" }
                });

            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.NoDateEpisodicMinimumConfidence)
                .Returns(85);
        }

        [Test]
        public void should_match_single_episode_release_to_target_scene()
        {
            Subject.IsNoDateEpisodicSceneMatch(_singleEpisodeParse, _targetScene, true).Should().BeTrue();
        }

        [Test]
        public void should_match_range_pack_when_target_episode_is_inside_range()
        {
            Subject.IsNoDateEpisodicSceneMatch(_rangePackParse, _targetScene, true).Should().BeTrue();
        }

        [Test]
        public void should_reject_range_pack_when_target_episode_is_outside_range()
        {
            var targetEpisodeSeven = Builder<Movie>.CreateNew()
                .With(m => m.Title = "Lara in Trouble S01 E07")
                .With(m => m.MovieMetadata.Value.StudioTitle = "Wildeer Studio")
                .With(m => m.MovieMetadata.Value.StudioForeignId = "wildeer-studio-id")
                .With(m => m.MovieMetadata.Value.ItemType = ItemType.Scene)
                .Build();

            Subject.IsNoDateEpisodicSceneMatch(_rangePackParse, targetEpisodeSeven, true).Should().BeFalse();
        }

        [Test]
        public void should_reject_when_studio_does_not_match()
        {
            var wrongStudioParse = new ParsedMovieInfo
            {
                StudioTitle = "Other Studio",
                ReleaseTokens = "Lara In Trouble",
                Season = "1",
                Episode = "S01E01",
                EpisodeStart = "1",
                IsNoDateEpisodic = true
            };

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.FindAllByTitle("Other Studio"))
                .Returns(new List<Studio>());

            Subject.IsNoDateEpisodicSceneMatch(wrongStudioParse, _targetScene, true).Should().BeFalse();
        }

        [Test]
        public void should_reject_when_title_does_not_match()
        {
            var wrongTitleParse = new ParsedMovieInfo
            {
                StudioTitle = "Wildeer Studio",
                ReleaseTokens = "Different Title",
                Season = "1",
                Episode = "S01E01",
                EpisodeStart = "1",
                IsNoDateEpisodic = true
            };

            Subject.IsNoDateEpisodicSceneMatch(wrongTitleParse, _targetScene, true).Should().BeFalse();
        }

        [TestCase("Lara in Trouble S01 E01", 1, 1, true)]
        [TestCase("All My Roommates Love Season 2 - Episode 2", 2, 2, true)]
        [TestCase("Some Random Title", 0, 0, false)]
        public void should_extract_season_episode_from_title(string title, int season, int episode, bool expected)
        {
            var result = MovieService.TryExtractSeasonEpisode(title, out var parsedSeason, out var parsedEpisode);

            result.Should().Be(expected);
            if (expected)
            {
                parsedSeason.Should().Be(season);
                parsedEpisode.Should().Be(episode);
            }
        }
    }
}
