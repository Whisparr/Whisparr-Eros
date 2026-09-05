using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.StudioTests
{
    [TestFixture]
    public class StudioRepositoryFixture : DbTest<StudioRepository, Studio>
    {
        private Studio GivenStudio(string title, string cleanSearchTitle)
        {
            var studio = new Studio
            {
                ForeignId = title.ToLowerInvariant() + "-id",
                Title = title,
                CleanTitle = title.ToLowerInvariant(),
                RootFolderPath = "/movies",
                CleanSearchTitle = cleanSearchTitle
            };

            return Subject.Insert(studio);
        }

        [Test]
        public void should_find_studio_by_clean_title()
        {
            GivenStudio("Cosmid", null);

            Subject.FindAllByTitle("cosmid").Should().HaveCount(1);
        }

        [Test]
        public void should_find_studio_by_clean_search_title()
        {
            GivenStudio("Cosmid", "cosmidsearch");

            Subject.FindAllByTitle("cosmidsearch").Should().HaveCount(1);
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public void should_return_empty_for_a_blank_title(string title)
        {
            GivenStudio("Cosmid", string.Empty);
            GivenStudio("Transfixed", null);

            Subject.FindAllByTitle(title).Should().BeEmpty();
        }

        [Test]
        public void should_not_match_studios_with_an_empty_clean_search_title()
        {
            // CleanSearchTitle is written as string.Empty by the API's resource mapper when a
            // studio has no search title, and left null by the metadata and scan paths. An
            // empty lookup used to return every studio saved through the UI.
            GivenStudio("Cosmid", string.Empty);
            GivenStudio("Transfixed", string.Empty);

            Subject.FindAllByTitle(string.Empty).Should().BeEmpty();
        }
    }
}
