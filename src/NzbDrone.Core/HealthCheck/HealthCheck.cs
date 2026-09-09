using System;
using System.Text.RegularExpressions;
using NzbDrone.Common;
using NzbDrone.Common.Http;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.HealthCheck
{
    public class HealthCheck : ModelBase
    {
        private static readonly Regex CleanFragmentRegex = new Regex("[^a-z ]", RegexOptions.Compiled, RegexDefaults.Timeout);

        public Type Source { get; set; }
        public HealthCheckResult Type { get; set; }
        public HealthCheckReason Reason { get; set; }
        public string Message { get; set; }
        public HttpUri WikiUrl { get; set; }

        public HealthCheck()
        {
        }

        public HealthCheck(Type source)
        {
            Source = source;
            Type = HealthCheckResult.Ok;
        }

        public HealthCheck(Type source, HealthCheckResult type, HealthCheckReason reason, string message, string wikiFragment = null)
        {
            Source = source;
            Type = type;
            Reason = reason;
            Message = message;
            WikiUrl = MakeWikiUrl(wikiFragment ?? MakeWikiFragment(message));
        }

        private static string MakeWikiFragment(string message)
        {
            return "#" + CleanFragmentRegex.Replace(message.ToLower(), string.Empty).Replace(' ', '-');
        }

        private static HttpUri MakeWikiUrl(string fragment)
        {
            return new HttpUri("https://wiki.servarr.com/whisparr/system#") + new HttpUri(fragment);
        }
    }

    public enum HealthCheckResult
    {
        Ok = 0,
        Notice = 1,
        Warning = 2,
        Error = 3
    }

    public enum HealthCheckReason
    {
        // Diverges from Radarr, which has no zero member. Without it the 43 call sites that
        // report Ok via HealthCheck(Type) would default to whichever reason sorts first.
        None = 0,

        AllowedHostsNotConfigured,
        AppDataLocation,
        DownloadClientCheckNoneAvailable,
        DownloadClientCheckUnableToCommunicate,
        DownloadClientRemovesCompletedDownloads,
        DownloadClientRootFolder,
        DownloadClientSorting,
        DownloadClientStatusAllClients,
        DownloadClientStatusSingleClient,
        ImportListRootFolderMissing,
        ImportListRootFolderMultipleMissing,
        ImportListStatusAllUnavailable,
        ImportListStatusUnavailable,
        ImportMechanismHandlingDisabled,
        IndexerDownloadClient,
        IndexerJackettAll,
        IndexerLongTermStatusAllUnavailable,
        IndexerLongTermStatusUnavailable,
        IndexerRssNoIndexersAvailable,
        IndexerRssNoIndexersEnabled,
        IndexerSearchNoAutomatic,
        IndexerSearchNoAvailableIndexers,
        IndexerSearchNoInteractive,
        IndexerStatusAllUnavailable,
        IndexerStatusUnavailable,
        MetadataUrlMismatch,
        MinimumApiKeyLength,
        MountMovies,
        NotificationStatusAll,
        NotificationStatusSingle,
        Package,
        ProxyBadRequest,
        ProxyFailed,
        ProxyResolveIp,
        RecycleBinUnableToWrite,
        ReleaseBranch,
        RemotePathMappingBadDockerPath,
        RemotePathMappingDockerFolderMissing,
        RemotePathMappingDownloadPermissionsMovie,
        RemotePathMappingFileRemoved,
        RemotePathMappingFilesBadDockerPath,
        RemotePathMappingFilesGenericPermissions,
        RemotePathMappingFilesLocalWrongOSPath,
        RemotePathMappingFilesWrongOSPath,
        RemotePathMappingFolderPermissions,
        RemotePathMappingGenericPermissions,
        RemotePathMappingImportMovieFailed,
        RemotePathMappingLocalFolderMissing,
        RemotePathMappingLocalWrongOSPath,
        RemotePathMappingRemoteDownloadClient,
        RemotePathMappingWrongOSPath,
        RemovedMovie,
        RootFolderMissing,
        RootFolderMultipleMissing,
        ServerNotification,
        SlackUrl,
        SqliteVersion,
        SystemTime,
        UpdateAvailable,
        UpdateStartupNotWritable,
        UpdateStartupTranslocation,
        UpdateUiNotWritable,
    }
}
