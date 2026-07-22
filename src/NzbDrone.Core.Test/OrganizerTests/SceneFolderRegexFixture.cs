using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.OrganizerTests
{
    [TestFixture]
    public class SceneFolderRegexFixture : CoreTest
    {
        // Every studio-title token that FileNameBuilder registers must be accepted by the
        // Scene Folder Format validator, otherwise a valid token is rejected on save.
        [TestCase("{Studio Title}")]
        [TestCase("{Studio TitleSlug}")]
        [TestCase("{Studio CleanTitle}")]
        [TestCase("{Studio CleanTitleSlug}")]
        [TestCase("{Studio TitleThe}")]
        [TestCase("{Studio TitleFirstCharacter}")]
        public void should_accept_studio_title_token(string format)
        {
            FileNameBuilder.SceneFolderRegex.IsMatch(format).Should().BeTrue();
        }

        [TestCase("no studio token here")]
        [TestCase("{Scene CleanTitle}")]
        public void should_reject_format_without_studio_token(string format)
        {
            FileNameBuilder.SceneFolderRegex.IsMatch(format).Should().BeFalse();
        }
    }
}
