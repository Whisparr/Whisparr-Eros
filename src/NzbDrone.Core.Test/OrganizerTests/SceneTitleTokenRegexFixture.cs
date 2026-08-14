using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.OrganizerTests
{
    [TestFixture]
    public class SceneTitleTokenRegexFixture : CoreTest
    {
        // Every scene-title token that FileNameBuilder registers must be accepted by the
        // Scene Folder Format validator, otherwise a valid token is rejected on save.
        [TestCase("{Scene Title}")]
        [TestCase("{Scene CleanTitle}")]
        [TestCase("{Scene CleanTitleNoSeasonEpisode}")]
        [TestCase("{Scene TitleThe}")]
        [TestCase("{Scene.CleanTitle}")]
        [TestCase("{Scene-CleanTitle}")]
        [TestCase("{Scene_CleanTitle}")]
        public void should_accept_scene_title_token(string format)
        {
            FileNameBuilder.SceneTitleTokenRegex.IsMatch(format).Should().BeTrue();
        }

        // Truncation suffixes are part of the token, ex. {Scene CleanTitle:100}
        [TestCase("{Scene Title:16}")]
        [TestCase("{Scene CleanTitle:100}")]
        [TestCase("{Scene CleanTitle:-30}")]
        [TestCase("{Scene TitleThe:17}")]
        [TestCase("{Scene CleanTitleNoSeasonEpisode:50}")]
        [TestCase("{Scene.CleanTitle:100}")]
        [TestCase("scenes/{Studio CleanTitle}/{Release Date} - {Scene CleanTitle:100}")]
        public void should_accept_scene_title_token_with_truncation(string format)
        {
            FileNameBuilder.SceneTitleTokenRegex.IsMatch(format).Should().BeTrue();
        }

        [TestCase("no scene token here")]
        [TestCase("{Studio CleanTitle}")]
        [TestCase("{Scene Performers}")]
        [TestCase("{SceneCleanTitle}")]
        public void should_reject_format_without_scene_title_token(string format)
        {
            FileNameBuilder.SceneTitleTokenRegex.IsMatch(format).Should().BeFalse();
        }

        // The file name (Standard Scene Format) validator has to accept the same suffixes.
        [TestCase("{Scene CleanTitle:100}")]
        [TestCase("{Scene CleanTitle:-30}")]
        [TestCase("{Studio CleanTitleSlug} - {Release-Date} - {Scene CleanTitle:100}")]
        public void should_accept_truncated_scene_title_in_scene_format(string format)
        {
            FileNameBuilder.SceneTitleRegex.IsMatch(format).Should().BeTrue();
        }
    }
}
