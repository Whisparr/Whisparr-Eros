using System;
using System.IO;
using NLog;
using NzbDrone.Common.Disk;

namespace NzbDrone.Core.MediaCover
{
    public interface ICoverExistsSpecification
    {
        bool AlreadyExists(string url, string path);
        void RecordSource(string url, string path);
    }

    // Each cover keeps the URL it was downloaded from in a file beside it. The metadata sources
    // give every image its own URL, so a different URL means the image was replaced. Comparing
    // URLs needs no request; the HEAD size check was dropped in #519 because StashDB's CDN
    // doesn't support it.
    public class CoverAlreadyExistsSpecification : ICoverExistsSpecification
    {
        internal const string SourceExtension = ".source";

        private readonly IDiskProvider _diskProvider;
        private readonly Logger _logger;

        public CoverAlreadyExistsSpecification(IDiskProvider diskProvider, Logger logger)
        {
            _diskProvider = diskProvider;
            _logger = logger;
        }

        public bool AlreadyExists(string url, string path)
        {
            if (!_diskProvider.FileExists(path, DiskProviderBase.PathStringComparison))
            {
                return false;
            }

            var sourcePath = path + SourceExtension;

            if (!_diskProvider.FileExists(sourcePath, DiskProviderBase.PathStringComparison))
            {
                // Covers downloaded before sources were recorded count as current, so upgrading
                // doesn't download the whole library again.
                RecordSource(url, path);
                return true;
            }

            string recordedUrl;

            try
            {
                recordedUrl = _diskProvider.ReadAllText(sourcePath).Trim();
            }
            catch (Exception e) when (e is IOException or UnauthorizedAccessException)
            {
                _logger.Warn(e, "Couldn't read the source of cover {0}, keeping the current file", path);
                return true;
            }

            if (recordedUrl == (url ?? string.Empty))
            {
                return true;
            }

            _logger.Debug("Cover {0} was downloaded from {1}, the source is now {2}", path, recordedUrl, url);

            return false;
        }

        public void RecordSource(string url, string path)
        {
            try
            {
                _diskProvider.WriteAllText(path + SourceExtension, url ?? string.Empty);
            }
            catch (Exception e) when (e is IOException or UnauthorizedAccessException)
            {
                _logger.Warn(e, "Couldn't record the source of cover {0}", path);
            }
        }
    }
}
