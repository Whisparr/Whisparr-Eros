using System;
using System.IO;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Configuration;

namespace Whisparr.Http.Frontend.Mappers
{
    public class IndexHtmlMapper : HtmlMapperBase
    {
        private readonly IConfigFileProvider _configFileProvider;
        private readonly IViteDevServer _viteDevServer;
        private readonly string _folderPath;

        public IndexHtmlMapper(IAppFolderInfo appFolderInfo,
                               IDiskProvider diskProvider,
                               IConfigFileProvider configFileProvider,
                               IViteDevServer viteDevServer,
                               Lazy<ICacheBreakerProvider> cacheBreakProviderFactory,
                               Logger logger)
            : base(diskProvider, cacheBreakProviderFactory, logger)
        {
            _configFileProvider = configFileProvider;
            _viteDevServer = viteDevServer;

            _folderPath = Path.Combine(appFolderInfo.StartUpFolder, configFileProvider.UiFolder);

            HtmlPath = Path.Combine(_folderPath, "index.html");
            UrlBase = configFileProvider.UrlBase;
        }

        protected override string FolderPath => _folderPath;

        // Applied outside the base's cached copy: Theme is a config value that can change without
        // a restart, and the cached text keeps the placeholder so each request re-substitutes it.
        protected override string GetHtmlText()
        {
            return base.GetHtmlText().Replace("_THEME_", _configFileProvider.Theme);
        }

        // Under the Vite dev server, index.html comes from Vite so its module
        // script and HMR client are current.
        protected override string ReadHtml()
        {
            if (_viteDevServer.IsEnabled)
            {
                return _viteDevServer.GetIndexHtmlAsync().GetAwaiter().GetResult();
            }

            return base.ReadHtml();
        }

        // The dev server has index.html even when no build has written one to disk.
        protected override bool ResourceExists(string filePath)
        {
            return _viteDevServer.IsEnabled || base.ResourceExists(filePath);
        }

        protected override string MapPath(string resourceUrl)
        {
            return HtmlPath;
        }

        public override bool CanHandle(string resourceUrl)
        {
            if (_viteDevServer.HandlesPath(resourceUrl))
            {
                return false;
            }

            resourceUrl = resourceUrl.ToLowerInvariant();

            return !resourceUrl.StartsWith("/content") &&
                   !resourceUrl.StartsWith("/mediacover") &&
                   !resourceUrl.Contains('.') &&
                   !resourceUrl.StartsWith("/login");
        }
    }
}
