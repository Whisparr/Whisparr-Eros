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
        public void should_leave_a_value_without_line_breaks_alone(string input, string expected)
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
    }
}
