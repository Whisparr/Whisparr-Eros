using System;
using System.IO;
using NetVips;
using NLog;
using NzbDrone.Common.Disk;
using VipsImage = NetVips.Image;

namespace NzbDrone.Core.MediaCover
{
    public interface IImageResizer
    {
        void Resize(string source, string destination, int height);
    }

    public class ImageResizer : IImageResizer
    {
        // ForeignKeep, used when saving, needs 8.15. The bundled NetVips.Native is newer; this
        // only gates a system libvips on platforms with no bundled build (freebsd-x64, linux-musl-arm).
        internal const int MinimumVersion = (8 << 16) | (15 << 8);

        // libvips' VIPS_MAX_COORD. Thumbnail needs a width bound, and this lets height alone decide.
        private const int UnboundedWidth = 10_000_000;

        private static readonly Lazy<string> UnavailableReason = new(Initialize);

        private readonly IDiskProvider _diskProvider;
        private readonly bool _enabled;

        public ImageResizer(IDiskProvider diskProvider, Logger logger)
        {
            _diskProvider = diskProvider;

            var reason = UnavailableReason.Value;
            _enabled = reason == null;

            if (!_enabled)
            {
                logger.Info("Cover thumbnails are disabled, full size covers will be served instead: {0}. Install libvips 8.15 or later to enable them.", reason);
            }
        }

        public void Resize(string source, string destination, int height)
        {
            if (!_enabled)
            {
                return;
            }

            try
            {
                using var image = VipsImage.Thumbnail(source, UnboundedWidth, height: height);

                // Covers are saved as .jpg, apart from clearlogos, which keep their transparency as .png
                if (Path.GetExtension(destination).Equals(".png", StringComparison.OrdinalIgnoreCase))
                {
                    image.Pngsave(destination, keep: Enums.ForeignKeep.None);
                }
                else
                {
                    // Thumbnails don't need super high quality. libvips stops chroma subsampling
                    // from Q90 up, which made thumbnails ~25% larger for no visible gain at these sizes.
                    image.Jpegsave(destination, q: 92, subsampleMode: Enums.ForeignSubsample.On, keep: Enums.ForeignKeep.None);
                }
            }
            catch
            {
                if (_diskProvider.FileExists(destination))
                {
                    _diskProvider.DeleteFile(destination);
                }

                throw;
            }
        }

        internal static string GetUnavailableReason(bool initialized, Exception exception, int? version)
        {
            if (!initialized)
            {
                return $"libvips could not be loaded ({exception?.Message ?? "not found"})";
            }

            if (version is not { } v || v < MinimumVersion)
            {
                return $"libvips {FormatVersion(version)} is older than 8.15";
            }

            return null;
        }

        private static string FormatVersion(int? version)
        {
            return version is { } v ? $"{v >> 16}.{(v >> 8) & 0xFF}.{v & 0xFF}" : "of unknown version";
        }

        private static string Initialize()
        {
            var reason = GetUnavailableReason(ModuleInitializer.VipsInitialized, ModuleInitializer.Exception, ModuleInitializer.Version);

            if (reason != null)
            {
                return reason;
            }

            // Covers come from metadata sources, so only the loaders for the formats they serve
            // are reachable. Everything else, TIFF and ICC-heavy formats included, is refused.
            Operation.Block("VipsForeignLoad", true);
            Operation.Block("VipsForeignLoadJpeg", false);
            Operation.Block("VipsForeignLoadPng", false);
            Operation.Block("VipsForeignLoadWebp", false);

            // The operation cache holds source files open, which blocks replacing a cover on
            // Windows, and its reuse buys nothing when each cover is resized once.
            Cache.Max = 0;
            Cache.MaxFiles = 0;

            // MediaCoverService already runs resizes on a worker pool, so one libvips thread
            // per resize avoids oversubscribing the CPU.
            NetVips.NetVips.Concurrency = 1;

            return null;
        }
    }
}
