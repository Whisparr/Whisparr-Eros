using System.IO;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;

namespace Whisparr.Http.Frontend.Mappers
{
    public class FaviconMapper : StaticResourceMapperBase
    {
        private readonly IAppFolderInfo _appFolderInfo;

        public FaviconMapper(IAppFolderInfo appFolderInfo, IDiskProvider diskProvider, Logger logger)
            : base(diskProvider, logger)
        {
            _appFolderInfo = appFolderInfo;
        }

        protected override string FolderPath => _appFolderInfo.GetUiFolder();

        protected override string MapPath(string resourceUrl)
        {
            var fileName = "favicon.ico";

            if (BuildInfo.IsDebug)
            {
                fileName = "favicon-debug.ico";
            }

            var path = Path.Combine("Content", "Images", "Icons", fileName);

            return Path.Combine(_appFolderInfo.GetUiFolder(), path);
        }

        public override bool CanHandle(string resourceUrl)
        {
            return resourceUrl.Equals("/favicon.ico");
        }
    }
}
