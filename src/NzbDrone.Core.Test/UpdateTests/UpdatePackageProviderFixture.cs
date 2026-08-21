using System;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cloud;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Update;

namespace NzbDrone.Core.Test.UpdateTests
{
    public class UpdatePackageProviderFixture : CoreTest<GithubUpdatePackageProvider>
    {
        private const string ListUrl = "https://api.github.com/repos/{githubownerrepo}/releases";
        private const string LatestUrl = "https://api.github.com/repos/{githubownerrepo}/releases/latest";

        [SetUp]
        public void Setup()
        {
            var mockCloudRequestBuilder = new Mock<IWhisparrCloudRequestBuilder>();
            mockCloudRequestBuilder.SetupGet(c => c.GithubReleases).Returns(BuilderFor(ListUrl));
            mockCloudRequestBuilder.SetupGet(c => c.GithubLatestRelease).Returns(BuilderFor(LatestUrl));
            Mocker.SetConstant<IWhisparrCloudRequestBuilder>(mockCloudRequestBuilder.Object);

            Mocker.GetMock<IPlatformInfo>().SetupGet(c => c.Version).Returns(new Version("9.9.9"));
            Mocker.GetMock<IConfigFileProvider>()
                .SetupGet(c => c.GithubOwnerRepo)
                .Returns("whisparr/whisparr-eros");

            // Both endpoints are stubbed by default. The list endpoint returns one stable and
            // one develop release; the latest endpoint returns the stable one on its own.
            GivenList("GithubReleasesResponse.json");
            GivenLatest("GithubLatestReleaseResponse.json");
        }

        private static IHttpRequestBuilderFactory BuilderFor(string url)
        {
            var factory = new Mock<IHttpRequestBuilderFactory>();
            factory.Setup(f => f.Create()).Returns(() => new HttpRequestBuilder(url));
            return factory.Object;
        }

        private static string ReadTestData(string fileName)
        {
            var path = System.IO.Path.Combine(AppContext.BaseDirectory, "UpdateTests", "TestData", fileName);
            return System.IO.File.ReadAllText(path);
        }

        private static HttpResponse ResponseFor(string url, string content, System.Net.HttpStatusCode statusCode)
        {
            return new HttpResponse(new HttpRequest(url), new HttpHeader(), content, statusCode);
        }

        /// <summary>Stubs the paged release-list endpoint.</summary>
        private void GivenList(string fileName, System.Net.HttpStatusCode statusCode = System.Net.HttpStatusCode.OK)
        {
            var content = statusCode == System.Net.HttpStatusCode.OK ? ReadTestData(fileName) : "{}";

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Get(It.Is<HttpRequest>(r => !r.Url.ToString().Contains("/releases/latest"))))
                .Returns(ResponseFor("https://api.github.com/repos/whisparr/whisparr-eros/releases", content, statusCode));
        }

        /// <summary>Stubs the single-release "latest" endpoint.</summary>
        private void GivenLatest(string fileName, System.Net.HttpStatusCode statusCode = System.Net.HttpStatusCode.OK)
        {
            var content = statusCode == System.Net.HttpStatusCode.OK ? ReadTestData(fileName) : "{}";

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Get(It.Is<HttpRequest>(r => r.Url.ToString().Contains("/releases/latest"))))
                .Returns(ResponseFor("https://api.github.com/repos/whisparr/whisparr-eros/releases/latest", content, statusCode));
        }

        [Test]
        public void no_update_when_version_higher()
        {
            Subject.GetLatestUpdate("eros", new Version(10, 0, 0)).Should().BeNull();
        }

        [Test]
        public void finds_update_when_version_lower()
        {
            Subject.GetLatestUpdate("eros", new Version(2, 0, 0)).Should().NotBeNull();
        }

        [Test]
        [Ignore("TODO: Update API")]
        public void should_get_master_if_branch_doesnt_exit()
        {
            Subject.GetLatestUpdate("invalid_branch", new Version(0, 2)).Should().NotBeNull();
        }

        [Test]
        public void should_get_recent_updates()
        {
            const string branch = "eros";
            var recent = Subject.GetRecentUpdates(branch, new Version(3, 0), null);
            var recentWithChanges = recent.Where(c => c.Changes != null);

            recent.Should().NotBeEmpty();
            recent.Should().OnlyContain(c => c.Hash.IsNotNullOrWhiteSpace());
            recent.Should().OnlyContain(c => c.FileName.Contains("Whisparr"));
            recent.Should().OnlyContain(c => c.ReleaseDate.Year >= 2014);

            if (recentWithChanges.Any())
            {
                recentWithChanges.Should().OnlyContain(c => c.Changes.New != null);
                recentWithChanges.Should().OnlyContain(c => c.Changes.Fixed != null);
            }

            recent.Should().OnlyContain(c => c.Branch == branch);
        }

        [Test]
        public void should_find_stable_update_when_the_release_list_is_all_develop()
        {
            // The regression this fixes: eros-develop publishes a release per merge, so every
            // entry in the first page of the list is a prerelease and the stable branch used
            // to come back empty. The latest-release endpoint is not affected by that.
            GivenList("GithubDevelopOnlyPageResponse.json");

            var update = Subject.GetLatestUpdate("eros", new Version(2, 0, 0));

            update.Should().NotBeNull();
            update.Version.ToString().Should().NotContain("develop");
        }

        [Test]
        public void should_not_offer_a_stable_release_to_a_develop_branch()
        {
            var update = Subject.GetLatestUpdate("eros-develop", new Version(2, 0, 0));

            update.Should().NotBeNull();
            update.Version.ToString().Should().Contain("develop");
        }

        [Test]
        public void should_ignore_a_draft_release()
        {
            GivenLatest("GithubDraftReleaseResponse.json");
            GivenList("GithubDevelopOnlyPageResponse.json");

            Subject.GetLatestUpdate("eros", new Version(2, 0, 0)).Should().BeNull();
        }

        [Test]
        public void should_fall_back_to_the_release_list_when_there_is_no_latest_release()
        {
            // A repository with no stable release answers 404 here.
            GivenLatest("GithubLatestReleaseResponse.json", System.Net.HttpStatusCode.NotFound);

            Subject.GetLatestUpdate("eros", new Version(2, 0, 0)).Should().NotBeNull();
        }

        [Test]
        public void should_leave_changes_empty_for_a_chore_only_release()
        {
            // Whisparr/Whisparr#1125: a release with no "- New"/"- Fix" lines used to produce
            // a single empty string, which the update modal reads as real content and renders
            // as a blank "What's new?" instead of the maintenance-release line.
            GivenLatest("GithubChoreOnlyReleaseResponse.json");

            var update = Subject.GetLatestUpdate("eros", new Version(2, 0, 0));

            update.Should().NotBeNull();
            update.Changes.New.Should().BeEmpty();
            update.Changes.Fixed.Should().BeEmpty();
        }

        [Test]
        public void should_cap_the_number_of_packages_returned()
        {
            // A single page of 100 can be almost entirely develop releases. The Updates page
            // renders one row per package, so the list must not grow just because the page
            // size did.
            GivenList("GithubDevelopOnlyPageResponse.json");

            Subject.GetRecentUpdates("eros-develop", new Version(3, 0), null)
                .Count.Should().BeLessThanOrEqualTo(25);
        }

        [Test]
        public void should_cap_the_number_of_pages_requested()
        {
            // Unauthenticated GitHub allows 60 requests an hour per IP, and this runs on every
            // load of System -> Updates, so the paging loop must not be unbounded.
            GivenList("GithubDevelopOnlyPageResponse.json");

            Subject.GetRecentUpdates("eros", new Version(3, 0), null);

            Mocker.GetMock<IHttpClient>()
                .Verify(c => c.Get(It.IsAny<HttpRequest>()), Times.AtMost(3));
        }
    }
}
