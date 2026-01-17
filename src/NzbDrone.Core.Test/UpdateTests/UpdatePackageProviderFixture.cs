using System;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Update;

namespace NzbDrone.Core.Test.UpdateTests
{
    public class UpdatePackageProviderFixture : CoreTest<GithubUpdatePackageProvider>
    {
        [SetUp]
        public void Setup()
        {
            // Mock IWhisparrCloudRequestBuilder to ensure GithubReleases.Create() returns a working builder
            var realBuilder = new NzbDrone.Common.Http.HttpRequestBuilder("https://api.github.com/repos/{githubownerrepo}/releases");
            var mockBuilderFactory = new Moq.Mock<NzbDrone.Common.Http.IHttpRequestBuilderFactory>();
            mockBuilderFactory.Setup(f => f.Create()).Returns(realBuilder);
            var mockCloudRequestBuilder = new Moq.Mock<NzbDrone.Common.Cloud.IWhisparrCloudRequestBuilder>();
            mockCloudRequestBuilder.SetupGet(c => c.GithubReleases).Returns(mockBuilderFactory.Object);
            Mocker.SetConstant<NzbDrone.Common.Cloud.IWhisparrCloudRequestBuilder>(mockCloudRequestBuilder.Object);

            Mocker.GetMock<IPlatformInfo>().SetupGet(c => c.Version).Returns(new Version("9.9.9"));
            Mocker.GetMock<IConfigFileProvider>()
                .SetupGet(c => c.GithubOwnerRepo)
                .Returns("whisparr/whisparr-eros");

            // Mock IHttpClient to return a simulated GitHub releases API response from file
            var testDataPath = System.IO.Path.Combine(AppContext.BaseDirectory, "UpdateTests", "TestData", "GithubReleasesResponse.json");
            var fakeResponse = System.IO.File.ReadAllText(testDataPath);
            var request = new NzbDrone.Common.Http.HttpRequest("https://api.github.com/repos/whisparr/whisparr-eros/releases?per_page=5");
            var headers = new NzbDrone.Common.Http.HttpHeader();
            var httpResponse = new NzbDrone.Common.Http.HttpResponse(request, headers, fakeResponse, System.Net.HttpStatusCode.OK);
            Mocker.GetMock<NzbDrone.Common.Http.IHttpClient>()
                .Setup(c => c.Get(It.IsAny<NzbDrone.Common.Http.HttpRequest>()))
                .Returns(httpResponse);
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

            // Console output for validation
            Console.WriteLine($"Recent updates count: {recent.Count}");
            foreach (var update in recent)
            {
                Console.WriteLine($"Update: Version={update.Version}, FileName={update.FileName}, Hash={update.Hash}, Branch={update.Branch}, ReleaseDate={update.ReleaseDate}");
            }

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
    }
}
