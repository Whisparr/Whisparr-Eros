using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.MetadataSource.SkyHook;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MetadataSource.SkyHook
{
    [TestFixture]
    public class SkyHookProxyInvalidSearchTermFixture : CoreTest<SkyHookProxy>
    {
        [TestCase("/movies/Some.Movie.2024.1080p.WEB-DL")]
        [TestCase("/tmp/Some.Movie.2024.mkv")]
        public void should_reject_search_terms_that_are_file_paths(string title)
        {
            var act = () => Subject.SearchForNewEntity(title);

            act.Should().Throw<InvalidSearchTermException>();
        }
    }
}
