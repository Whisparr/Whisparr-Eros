using System;
using System.IO;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Configuration;

namespace Whisparr.Http.Frontend.Mappers
{
    public class LoginHtmlMapper : HtmlMapperBase
    {
        private readonly IConfigFileProvider _configFileProvider;
        private readonly string _folderPath;

        public LoginHtmlMapper(IAppFolderInfo appFolderInfo,
                               IDiskProvider diskProvider,
                               Lazy<ICacheBreakerProvider> cacheBreakProviderFactory,
                               IConfigFileProvider configFileProvider,
                               Logger logger)
            : base(diskProvider, cacheBreakProviderFactory, logger)
        {
            _configFileProvider = configFileProvider;
            _folderPath = Path.Combine(appFolderInfo.StartUpFolder, configFileProvider.UiFolder);

            HtmlPath = Path.Combine(_folderPath, "login.html");
            UrlBase = configFileProvider.UrlBase;
        }

        protected override string FolderPath => _folderPath;

        protected override string MapPath(string resourceUrl)
        {
            return HtmlPath;
        }

        public override bool CanHandle(string resourceUrl)
        {
            return resourceUrl.StartsWith("/login");
        }

        protected override string GetHtmlText()
        {
            var html = base.GetHtmlText();
            var theme = _configFileProvider.Theme;

            html = html.Replace("_THEME_", theme);

            return html;
        }
    }
}
