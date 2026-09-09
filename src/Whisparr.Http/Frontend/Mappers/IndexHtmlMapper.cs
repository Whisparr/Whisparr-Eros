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
        private readonly string _folderPath;

        public IndexHtmlMapper(IAppFolderInfo appFolderInfo,
                               IDiskProvider diskProvider,
                               IConfigFileProvider configFileProvider,
                               Lazy<ICacheBreakerProvider> cacheBreakProviderFactory,
                               Logger logger)
            : base(diskProvider, cacheBreakProviderFactory, logger)
        {
            _configFileProvider = configFileProvider;

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

        protected override string MapPath(string resourceUrl)
        {
            return HtmlPath;
        }

        public override bool CanHandle(string resourceUrl)
        {
            resourceUrl = resourceUrl.ToLowerInvariant();

            return !resourceUrl.StartsWith("/content") &&
                   !resourceUrl.StartsWith("/mediacover") &&
                   !resourceUrl.Contains('.') &&
                   !resourceUrl.StartsWith("/login");
        }
    }
}
