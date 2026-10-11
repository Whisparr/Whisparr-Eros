using System.IO;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;

namespace Whisparr.Http.Frontend.Mappers
{
    public class StaticResourceMapper : StaticResourceMapperBase
    {
        private readonly IAppFolderInfo _appFolderInfo;
        private readonly IViteDevServer _viteDevServer;

        public StaticResourceMapper(IAppFolderInfo appFolderInfo, IDiskProvider diskProvider, IViteDevServer viteDevServer, Logger logger)
            : base(diskProvider, logger)
        {
            _appFolderInfo = appFolderInfo;
            _viteDevServer = viteDevServer;
        }

        protected override string FolderPath => _appFolderInfo.GetUiFolder();

        protected override string MapPath(string resourceUrl)
        {
            var path = resourceUrl.Replace('/', Path.DirectorySeparatorChar);
            path = path.Trim(Path.DirectorySeparatorChar);

            return Path.Combine(_appFolderInfo.GetUiFolder(), path);
        }

        public override bool CanHandle(string resourceUrl)
        {
            if (_viteDevServer.HandlesPath(resourceUrl))
            {
                return false;
            }

            resourceUrl = resourceUrl.ToLowerInvariant();

            if (resourceUrl.StartsWith("/content/images/icons/manifest") ||
                resourceUrl.StartsWith("/content/images/icons/browserconfig") ||
                resourceUrl.StartsWith("/docs"))
            {
                return false;
            }

            return resourceUrl.StartsWith("/content") ||
                   resourceUrl.EndsWith(".js") ||
                   resourceUrl.EndsWith(".map") ||
                   resourceUrl.EndsWith(".css") ||
                   (resourceUrl.EndsWith(".ico") && !resourceUrl.Equals("/favicon.ico")) ||
                   resourceUrl.EndsWith(".swf") ||
                   resourceUrl.EndsWith("oauth.html");
        }
    }
}
