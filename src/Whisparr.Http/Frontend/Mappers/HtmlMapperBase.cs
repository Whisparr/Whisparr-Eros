using System;
using System.IO;
using System.Text.RegularExpressions;
using NLog;
using NzbDrone.Common;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;

namespace Whisparr.Http.Frontend.Mappers
{
    public abstract class HtmlMapperBase : StaticResourceMapperBase
    {
        private readonly IDiskProvider _diskProvider;
        private readonly Lazy<ICacheBreakerProvider> _cacheBreakProviderFactory;

        // A minifier may drop the quotes (src=/index.js), so match both forms or the url base is never applied.
        private static readonly Regex ReplaceRegex = new Regex(@"(?<attribute>href|src)=(?:\""(?<path>.*?(?:css|js|png|ico|ics|svg|json))\""|(?<path>[^\s\""'<>=`]+?(?:css|js|png|ico|ics|svg|json))(?=[\s>]))(?:\s(?<nohash>data-no-hash))?", RegexOptions.Compiled | RegexOptions.IgnoreCase, RegexDefaults.Timeout);

        private string _generatedContent;

        protected HtmlMapperBase(IDiskProvider diskProvider,
                                 Lazy<ICacheBreakerProvider> cacheBreakProviderFactory,
                                 Logger logger)
            : base(diskProvider, logger)
        {
            _diskProvider = diskProvider;
            _cacheBreakProviderFactory = cacheBreakProviderFactory;
        }

        protected string HtmlPath;
        protected string UrlBase;

        protected override Stream GetContentStream(string filePath)
        {
            var text = GetHtmlText();

            var stream = new MemoryStream();
            var writer = new StreamWriter(stream);
            writer.Write(text);
            writer.Flush();
            stream.Position = 0;
            return stream;
        }

        protected virtual string GetHtmlText()
        {
            if (RuntimeInfo.IsProduction && _generatedContent != null)
            {
                return _generatedContent;
            }

            var text = _diskProvider.ReadAllText(HtmlPath);
            var cacheBreakProvider = _cacheBreakProviderFactory.Value;

            text = ReplaceRegex.Replace(text, match =>
            {
                string url;

                if (match.Groups["nohash"].Success)
                {
                    url = match.Groups["path"].Value;
                }
                else
                {
                    url = cacheBreakProvider.AddCacheBreakerToPath(match.Groups["path"].Value);
                }

                return $"{match.Groups["attribute"].Value}=\"{UrlBase}{url}\"";
            });

            text = text.Replace("__URL_BASE__", UrlBase);

            _generatedContent = text;

            return _generatedContent;
        }
    }
}
