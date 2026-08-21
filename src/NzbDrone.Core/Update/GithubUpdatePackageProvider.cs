using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.RegularExpressions;
using NLog;
using NzbDrone.Common;
using NzbDrone.Common.Cloud;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Http;
using NzbDrone.Core.Analytics;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Datastore;
using Semver;

namespace NzbDrone.Core.Update
{
    public class GithubUpdatePackageProvider : IUpdatePackageProvider
    {
        private const int PageSize = 100;
        private const int MaxPages = 3;

        // Enough matches to stop paging early. Deliberately low: a page of 100 is ~3MB, and
        // page one currently holds four stable releases, so this keeps the common case to a
        // single request while still paging when stable releases are sparser than that.
        private const int WantedPackages = 3;

        // Ceiling on what is handed back, matching the old per_page=25 behaviour. A single
        // page of 100 can contain ~96 develop releases, and the Updates page renders each.
        private const int MaxPackages = 25;

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
            _logger.Debug("Checking for latest update (branch: {0}, currentVersion: {1})", branch, currentVersion);

            // A stable branch asks GitHub for the newest non-prerelease release directly.
            // Paging the full list does not work here: develop publishes a release per
            // merge, so the newest stable release sits far past any page size we would
            // pick, and every entry in that window gets filtered out.
            var latest = IsDevelopBranch(branch)
                ? GetRecentUpdates(branch, currentVersion).FirstOrDefault()
                : GetLatestStableUpdate(branch) ?? GetRecentUpdates(branch, currentVersion).FirstOrDefault();

            if (latest != null)
            {
                _logger.Info("Update found: {0} ({1})", latest.Version, latest.FileName);

                // Convert latest.Version (SemVersion) to .NET Version for comparison
                var latestDotNetVersion = releaseVersionAsAssemblyVersion(latest.Version.ToString());

                if (currentVersion >= latestDotNetVersion)
                {
                    _logger.Info("Current version '{0}' is up-to-date or newer than the latest available update '{1}'.",
                        currentVersion,
                        latestDotNetVersion);
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
            _logger.Debug("Fetching recent updates from GitHub releases (branch: {0}, currentVersion: {1}, previousVersion: {2}",
                branch,
                currentVersion,
                previousVersion);

            var packages = new List<UpdatePackage>();

            // Page until we have enough matching releases or hit the cap. The cap matters:
            // unauthenticated GitHub allows 60 requests an hour per IP, and this runs on
            // every load of System -> Updates, not just on the six-hourly check.
            for (var page = 1; page <= MaxPages && packages.Count < WantedPackages; page++)
            {
                var builder = _cloudRequestBuilder.GithubReleases.Create();
                builder.SetSegment("githubownerrepo", ownerRepo);
                builder.AddQueryParam("per_page", PageSize.ToString());

                if (page > 1)
                {
                    builder.AddQueryParam("page", page.ToString());
                }

                var request = builder.Build();
                _logger.Debug($"Requesting: {request.Url}");

                List<GithubRelease> releases;

                try
                {
                    var response = _httpClient.Get(request);
                    _logger.Trace($"GitHub API response: {response.StatusCode}, {response.Content?.Length ?? 0} bytes");

                    releases = JsonSerializer.Deserialize<List<GithubRelease>>(response.Content) ?? new List<GithubRelease>();
                }
                catch (Exception ex) when (page > 1)
                {
                    // GitHub returns the occasional transient 5xx. Losing a later page costs
                    // a few changelog entries; letting it throw would blank the whole page.
                    _logger.Debug(ex, "Failed to fetch page {0} of releases; returning what we have.", page);
                    break;
                }

                foreach (var release in releases)
                {
                    if (!MatchesBranch(release, branch))
                    {
                        continue;
                    }

                    if (TryBuildPackage(release, branch, out var package))
                    {
                        packages.Add(package);
                    }

                    if (packages.Count >= MaxPackages)
                    {
                        break;
                    }
                }

                if (packages.Count >= MaxPackages)
                {
                    break;
                }

                // A short page is the end of the list; there is nothing further to ask for.
                if (releases.Count < PageSize)
                {
                    break;
                }
            }

            _logger.Debug($"Total updates found: {packages.Count}");
            return packages;
        }

        /// <summary>
        /// Asks GitHub for the newest non-draft, non-prerelease release. Returns null if the
        /// repository has no stable release yet, or if the request or the release is unusable.
        /// </summary>
        private UpdatePackage GetLatestStableUpdate(string branch)
        {
            var builder = _cloudRequestBuilder.GithubLatestRelease.Create();
            builder.SetSegment("githubownerrepo", _configFileProvider.GithubOwnerRepo);

            var request = builder.Build();

            // A repository with no stable release answers 404 here; fall back to the list.
            request.SuppressHttpError = true;

            _logger.Debug($"Requesting: {request.Url}");

            var response = _httpClient.Get(request);
            _logger.Trace($"GitHub API response: {response.StatusCode}, {response.Content?.Length ?? 0} bytes");

            if (response.StatusCode != HttpStatusCode.OK)
            {
                _logger.Debug("No latest release available ({0}); falling back to the release list.", response.StatusCode);
                return null;
            }

            var release = JsonSerializer.Deserialize<GithubRelease>(response.Content);

            if (release == null)
            {
                _logger.Debug("Latest release response could not be read; falling back to the release list.");
                return null;
            }

            // This endpoint is documented to exclude drafts and prereleases, but run the same
            // check as the list path rather than trusting that -- both paths must agree on
            // what counts as a release for this branch.
            if (!MatchesBranch(release, branch))
            {
                return null;
            }

            return TryBuildPackage(release, branch, out var package) ? package : null;
        }

        /// <summary>
        /// Decides whether a release belongs to the requested branch. GitHub's own
        /// <c>prerelease</c> flag is the source of truth; the tag-name check is kept as a
        /// fallback in case a release is ever published without the flag set correctly.
        /// </summary>
        private bool MatchesBranch(GithubRelease release, string branch)
        {
            if (release.draft)
            {
                _logger.Debug($"Skipping draft {release.tag_name}.");
                return false;
            }

            if (string.IsNullOrEmpty(branch))
            {
                return true;
            }

            var wantsPrerelease = IsDevelopBranch(branch);
            var tagLower = release.tag_name?.ToLowerInvariant() ?? string.Empty;
            var tagLooksLikePrerelease = tagLower.Contains("develop");

            if (release.prerelease != wantsPrerelease)
            {
                _logger.Debug($"Skipping {release.tag_name} (prerelease={release.prerelease}) for branch {branch}.");
                return false;
            }

            if (tagLooksLikePrerelease != wantsPrerelease)
            {
                _logger.Debug($"Skipping {release.tag_name}: tag does not match branch {branch}.");
                return false;
            }

            return true;
        }

        private static bool IsDevelopBranch(string branch)
        {
            return branch?.ToLowerInvariant().Contains("develop") == true;
        }

        /// <summary>
        /// Builds an <see cref="UpdatePackage"/> from a release, selecting the asset for the
        /// running OS and architecture. Shared by the list and latest-release paths.
        /// </summary>
        private bool TryBuildPackage(GithubRelease release, string branch, out UpdatePackage package)
        {
            package = null;

            if (release.assets == null)
            {
                _logger.Debug($"Release {release.tag_name} has no package assets, skipping.");
                return false;
            }

            var osAssetString = GetOsAssetString(OsInfo.Os);
            var arch = RuntimeInformation.OSArchitecture.ToString().ToLowerInvariant();

            // Prefer .tar.gz for Osx, fallback to .zip/.app
            GithubAsset asset = null;
            if (OsInfo.Os == Os.Osx)
            {
                asset = release.assets.FirstOrDefault(a =>
                    a.name.Contains(osAssetString, StringComparison.OrdinalIgnoreCase) &&
                    a.name.Contains(arch, StringComparison.OrdinalIgnoreCase) &&
                    a.name.EndsWith(".tar.gz", StringComparison.OrdinalIgnoreCase));
                if (asset == null)
                {
                    asset = release.assets.FirstOrDefault(a =>
                        a.name.Contains(osAssetString, StringComparison.OrdinalIgnoreCase) &&
                        a.name.Contains(arch, StringComparison.OrdinalIgnoreCase) &&
                        (a.name.EndsWith(".zip", StringComparison.OrdinalIgnoreCase) || a.name.EndsWith(".app", StringComparison.OrdinalIgnoreCase)));
                }
            }
            else if (OsInfo.Os == Os.Windows)
            {
                asset = release.assets.FirstOrDefault(a =>
                    a.name.Contains(osAssetString, StringComparison.OrdinalIgnoreCase) &&
                    a.name.Contains(arch, StringComparison.OrdinalIgnoreCase) &&
                    a.name.EndsWith(".zip", StringComparison.OrdinalIgnoreCase));
            }
            else if (OsInfo.Os == Os.Linux)
            {
                // Exclude musl assets for non-musl Linux: "linux" matches "linux-musl-x64" too
                asset = release.assets.FirstOrDefault(a =>
                    a.name.Contains(osAssetString, StringComparison.OrdinalIgnoreCase) &&
                    a.name.Contains(arch, StringComparison.OrdinalIgnoreCase) &&
                    !a.name.Contains("musl", StringComparison.OrdinalIgnoreCase));
            }
            else
            {
                asset = release.assets.FirstOrDefault(a =>
                    a.name.Contains(osAssetString, StringComparison.OrdinalIgnoreCase) &&
                    a.name.Contains(arch, StringComparison.OrdinalIgnoreCase));
            }

            if (asset == null)
            {
                _logger.Debug("No asset found for release {0} matching OS asset string '{1}' and arch '{2}'",
                    release.tag_name,
                    osAssetString,
                    arch);
                return false;
            }

            _logger.Debug($"Found update: {release.tag_name} - {asset.name}");
            var tag = release.tag_name.TrimStart('v');

            // Attempt to strip "what's new", as it's repetitive in our UI
            var body = release.body != null
                ? Regex.Replace(release.body, @"^## What's Changed\s*\r?\n", "", RegexOptions.Multiline, RegexDefaults.Timeout)
                : string.Empty;

            // Strip out lines that are not New: or Fix:
            body = string.Join("\n",
                body.Split('\n')
                    .Where(line => line.StartsWith("- New", StringComparison.OrdinalIgnoreCase) ||
                                   line.StartsWith("- Fix", StringComparison.OrdinalIgnoreCase))
                    .Select(line => line.Trim()));

            var version = SemVersion.Parse(tag);
            if (version == null)
            {
                _logger.Warn("Could not parse semver from tag '{0}' (parsed: '{1}'). Skipping this release.",
                    release.tag_name,
                    tag);
                return false;
            }

            // A chore-only release filters down to nothing. Leave the list empty rather than
            // handing the UI a single empty string: the "What's new?" modal decides whether
            // to show its maintenance-release fallback by looking at the length of this list,
            // and a one-element list of "" reads as real content and renders blank.
            var changes = new UpdateChanges();

            if (!string.IsNullOrWhiteSpace(body))
            {
                changes.New = new List<string> { body };
            }

            package = new UpdatePackage
            {
                Version = version,
                ReleaseDate = release.published_at,
                FileName = asset.name,
                Url = asset.browser_download_url,
                Changes = changes,
                Hash = asset.digest?.Replace("sha256:", "", StringComparison.OrdinalIgnoreCase),
                Branch = branch
            };

            return true;
        }

        /// <summary> Converts a GitHub release version string to a .NET Version object.</summary>
        /// <param name="releaseTag">The release version string (e.g., "v3.2.0-develop.23").</param>
        /// <returns>The corresponding .NET Assembly Version object.(e.e., 3.2.0.27)</returns>
        private static Version releaseVersionAsAssemblyVersion(string releaseTag)
        {
            var semver = SemVersion.Parse(releaseTag.TrimStart('v'));
            if (semver == null)
            {
                throw new ArgumentException($"Invalid semver: {releaseTag}", nameof(releaseTag));
            }

            // Use major, minor, patch, and if available, the last numeric part of prerelease as revision
            var major = (int)semver.Major;
            var minor = (int)semver.Minor;
            var build = (int)semver.Patch;

            // Try to extract revision from prerelease (e.g., 3.2.0-develop.23)
            var revision = 0;

            if (!string.IsNullOrEmpty(semver.Prerelease))
            {
                var parts = semver.Prerelease.Split('.');
                if (parts.Length > 0 && int.TryParse(parts.Last(), out var rev))
                {
                    revision = rev;
                }
            }

            return new Version(major, minor, build, revision);
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

        internal class GithubRelease
        {
            /// <summary>The tag name of the release.</summary>
            public string tag_name { get; set; }

            /// <summary>Whether GitHub marks this release as a prerelease. Develop builds set this.</summary>
            public bool prerelease { get; set; }

            /// <summary>Whether the release is still a draft and should never be offered.</summary>
            public bool draft { get; set; }

            /// <summary>The body/description of the release.</summary>
            public string body { get; set; }

            /// <summary>The publication date/time of the release.</summary>
            public DateTime published_at { get; set; }

            /// <summary>The list of assets (packages) associated with the release.</summary>
            public List<GithubAsset> assets { get; set; }
        }

        /// <summary>Represents an asset in a GitHub release.</summary>
        internal class GithubAsset
        {
            /// <summary>The name of the asset file.</summary>
            public string name { get; set; }

            /// <summary>The digest (sha256 hash) of the asset.</summary>
            public string digest { get; set; }

            /// <summary>The download URL of the asset.</summary>
            public string browser_download_url { get; set; }
        }
    }
}
