using System.IO;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;

namespace Whisparr.Http.Frontend.Mappers
{
    public class BrowserConfig : StaticResourceMapperBase
    {
        private readonly IAppFolderInfo _appFolderInfo;

        public BrowserConfig(IAppFolderInfo appFolderInfo, IDiskProvider diskProvider, Logger logger)
            : base(diskProvider, logger)
        {
            _appFolderInfo = appFolderInfo;
        }

        protected override string FolderPath => _appFolderInfo.GetUiFolder();

        protected override string MapPath(string resourceUrl)
        {
            var path = resourceUrl.Replace('/', Path.DirectorySeparatorChar);
            path = path.Trim(Path.DirectorySeparatorChar);

            return Path.ChangeExtension(Path.Combine(_appFolderInfo.GetUiFolder(), path), "xml");
        }

        public override bool CanHandle(string resourceUrl)
        {
            return resourceUrl.StartsWith("/content/images/icons/browserconfig");
        }
    }
}
