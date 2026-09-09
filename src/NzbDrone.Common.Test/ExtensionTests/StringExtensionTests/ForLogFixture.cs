using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Common.Test.ExtensionTests.StringExtensionTests
{
    [TestFixture]
    public class ForLogFixture
    {
        [TestCase("Studio.Name.26.09.01.1080p", "Studio.Name.26.09.01.1080p")]
        [TestCase("", "")]
        [TestCase(null, null)]
        public void should_leave_a_value_without_control_characters_alone(string input, string expected)
        {
            input.ForLog().Should().Be(expected);
        }

        [TestCase("Title\n[Fatal] Everything is fine", "Title[Fatal] Everything is fine")]
        [TestCase("Title\r\n[Fatal] Everything is fine", "Title[Fatal] Everything is fine")]
        [TestCase("Title\r[Fatal] Everything is fine", "Title[Fatal] Everything is fine")]
        [TestCase("\n\r\n\rTitle", "Title")]
        public void should_strip_line_breaks_so_a_value_cannot_forge_a_log_entry(string input, string expected)
        {
            input.ForLog().Should().Be(expected);
        }

        // Not line breaks, but they still let a value rewrite what the log viewer shows.
        [TestCase("Title\tIndented", "TitleIndented")]
        [TestCase("Title\u0000Null", "TitleNull")]
        [TestCase("Title\u001b[31mRed", "Title[31mRed")]
        [TestCase("Title\u0007Bell", "TitleBell")]
        public void should_strip_other_control_characters(string input, string expected)
        {
            input.ForLog().Should().Be(expected);
        }
    }
}
