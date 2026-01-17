using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text.Json;
using NLog;
using NzbDrone.Common.Cloud;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Http;
using NzbDrone.Core.Analytics;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Update
{
    public class GithubUpdatePackageProvider : IUpdatePackageProvider
    {
        private readonly IPlatformInfo _platformInfo;
        private readonly IAnalyticsService _analyticsService;
        private readonly IConfigFileProvider _configFileProvider;
        private readonly IMainDatabase _mainDatabase;
        private readonly IHttpClient _httpClient;
        private readonly IWhisparrCloudRequestBuilder _cloudRequestBuilder;
        private readonly Logger _logger;

        public GithubUpdatePackageProvider(
            IHttpClient httpClient,
            IAnalyticsService analyticsService,
            IPlatformInfo platformInfo,
            IMainDatabase mainDatabase,
            IConfigFileProvider configFileProvider,
            IWhisparrCloudRequestBuilder cloudRequestBuilder)
        {
            _platformInfo = platformInfo;
            _analyticsService = analyticsService;
            _configFileProvider = configFileProvider;
            _httpClient = httpClient;
            _mainDatabase = mainDatabase;
            _cloudRequestBuilder = cloudRequestBuilder;
            _logger = NzbDrone.Common.Instrumentation.NzbDroneLogger.GetLogger(this);
        }

        /// <summary>
        /// Gets the latest update package for the specified branch and current version.
        /// </summary>
        /// <param name="branch">The branch to check for updates (e.g., "master", "develop").</param>
        /// <param name="currentVersion">The current version of the application.</param>
        /// <returns>The latest UpdatePackage if an update is available; otherwise, null.</returns>
        public UpdatePackage GetLatestUpdate(string branch, Version currentVersion)
        {
            _logger.Info("Checking for latest update (branch: {0}, currentVersion: {1})", branch, currentVersion);
            var updates = GetRecentUpdates(branch, currentVersion);
            var latest = updates.FirstOrDefault();
            if (latest != null)
            {
                _logger.Info("Update found: {0} ({1})", latest.Version, latest.FileName);
                if (Semver.SemVersion.ComparePrecedence(Semver.SemVersion.Parse(currentVersion.ToString()), latest.Version) >= 0)
                {
                    _logger.Info("Current version '{0}' is up-to-date or newer than the latest available update '{1}'.",
                        currentVersion,
                        latest.Version);
                    return null;
                }

                return latest;
            }
            else
            {
                _logger.Warn("No update found from GitHub releases.");
                return null;
            }
        }

        /// <summary>
        /// Gets a list of recent update packages for the specified branch and current version.
        /// </summary>
        /// <param name="branch">The branch to check for updates (e.g., "eros", "eros-develop").</param>
        /// <param name="currentVersion">The current version of the application.</param>
        /// <param name="previousVersion">The previous version of the application (optional).</param>
        /// <returns>A list of recent UpdatePackage objects.</returns>
        public List<UpdatePackage> GetRecentUpdates(string branch, Version currentVersion, Version previousVersion = null)
        {
            var ownerRepo = _configFileProvider.GithubOwnerRepo;
            _logger.Info("Fetching recent updates from GitHub releases (branch: {0}, currentVersion: {1}, previousVersion: {2}",
                branch,
                currentVersion,
                previousVersion);

            var builder = _cloudRequestBuilder.GithubReleases.Create();
            builder.SetSegment("githubownerrepo", ownerRepo);
            builder.AddQueryParam("per_page", "5");

            var request = builder.Build();
            _logger.Debug($"Requesting: {request.Url}");

            var response = _httpClient.Get(request);
            _logger.Debug($"GitHub API response: {response.StatusCode}, {response.Content?.Length ?? 0} bytes");

            var releases = JsonSerializer.Deserialize<List<GithubRelease>>(response.Content) ?? new List<GithubRelease>();

            var osAssetString = GetOsAssetString(OsInfo.Os);
            var arch = RuntimeInformation.OSArchitecture.ToString().ToLowerInvariant();

            var packages = new List<UpdatePackage>();
            foreach (var release in releases)
            {
                if (release.assets == null)
                {
                    _logger.Debug($"Release {release.tag_name} has no package assets, skipping.");
                    continue;
                }

                // Filter release assets by mapped OS asset string and architecture
                var asset = release.assets.FirstOrDefault(a =>
                    a.name.Contains(osAssetString, StringComparison.OrdinalIgnoreCase) &&
                    a.name.Contains(arch, StringComparison.OrdinalIgnoreCase));
                if (asset == null)
                {
                    _logger.Debug("No asset found for release {0} matching OS asset string '{1}' and arch '{2}'",
                        release.tag_name,
                        osAssetString,
                        arch);
                    continue;
                }

                _logger.Debug($"Found update: {release.tag_name} - {asset.name}");
                var tag = release.tag_name.TrimStart('v');
                var version = Semver.SemVersion.Parse(tag);
                if (version == null)
                {
                    _logger.Warn("Could not parse semver from tag '{0}' (parsed: '{1}'). Skipping this release.",
                        release.tag_name,
                        tag);
                    continue;
                }

                var semverVersion = version;
                packages.Add(new UpdatePackage
                {
                    Version = semverVersion,
                    ReleaseDate = release.published_at,
                    FileName = asset.name,
                    Url = asset.browser_download_url,
                    Changes = new UpdateChanges { New = new List<string> { release.body } },
                    Hash = asset.digest,
                    Branch = branch
                });
            }

            _logger.Debug($"Total updates found (max 5): {packages.Count}");
            return packages;
        }

        /// <summary>
        /// Maps the OsInfo.Os enum to the asset string prefix used in GitHub release asset names.
        /// </summary>
        /// <param name="os">The OsInfo.Os enum value.</param>
        /// <returns>The asset string prefix (e.g., "win", "linux-musl").</returns>
        private static string GetOsAssetString(Os os)
        {
            switch (os)
            {
                case Os.Windows:
                    return "win";
                case Os.LinuxMusl:
                    return "linux-musl";
                case Os.Linux:
                    return "linux";
                case Os.Osx:
                    return "osx";
                case Os.Bsd:
                    return "freebsd";
                default:
                    throw new ArgumentOutOfRangeException(nameof(os), os, null);
            }
        }

        private class GithubRelease
        {
            /// <summary>The tag name of the release.</summary>
            public string tag_name { get; set; }

            /// <summary>The body/description of the release.</summary>
            public string body { get; set; }

            /// <summary>The publication date/time of the release.</summary>
            public DateTime published_at { get; set; }

            /// <summary>The list of assets (packages) associated with the release.</summary>
            public List<GithubAsset> assets { get; set; }
        }

        /// <summary>Represents an asset in a GitHub release.</summary>
        private class GithubAsset
        {
            /// <summary>The name of the asset file.</summary>
            public string name { get; set; }

            /// <summary>The digest (sha:hash) of the asset.</summary>
            public string digest { get; set; }

            /// <summary>The download URL of the asset.</summary>
            public string browser_download_url { get; set; }
        }
    }
}
