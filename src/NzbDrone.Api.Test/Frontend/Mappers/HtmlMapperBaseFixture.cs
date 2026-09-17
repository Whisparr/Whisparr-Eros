using System;
using System.IO;
using FluentAssertions;
using Moq;
using NLog;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Test.Common;
using Whisparr.Http.Frontend.Mappers;

namespace NzbDrone.Api.Test.Frontend.Mappers
{
    [TestFixture]
    public class HtmlMapperBaseFixture : TestBase
    {
        private const string IndexPath = "/ui/index.html";

        private string Render(string html)
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.ReadAllText(IndexPath))
                  .Returns(html);

            Mocker.GetMock<ICacheBreakerProvider>()
                  .Setup(s => s.AddCacheBreakerToPath(It.IsAny<string>()))
                  .Returns<string>(path => path + "?h=hash");

            var subject = new TestMapper(Mocker.GetMock<IDiskProvider>().Object,
                                         new Lazy<ICacheBreakerProvider>(() => Mocker.GetMock<ICacheBreakerProvider>().Object),
                                         LogManager.GetCurrentClassLogger());

            return subject.Render();
        }

        [TestCase("<script src=\"/index.js\"></script>", "<script src=\"/whisparr/index.js?h=hash\"></script>")]
        [TestCase("<link rel=\"icon\" href=\"/Content/favicon.png\"/>", "<link rel=\"icon\" href=\"/whisparr/Content/favicon.png?h=hash\"/>")]
        [TestCase("<script src=\"/index.js\" data-no-hash></script>", "<script src=\"/whisparr/index.js\"></script>")]
        public void should_prefix_quoted_attributes(string html, string expected)
        {
            Render(html).Should().Be(expected);
        }

        [TestCase("<script src=/index-ed23d8e8.js></script>", "<script src=\"/whisparr/index-ed23d8e8.js?h=hash\"></script>")]
        [TestCase("<link rel=stylesheet href=/Content/styles.css>", "<link rel=stylesheet href=\"/whisparr/Content/styles.css?h=hash\">")]
        [TestCase("<link rel=manifest href=/Content/manifest.json crossorigin=use-credentials>", "<link rel=manifest href=\"/whisparr/Content/manifest.json?h=hash\" crossorigin=use-credentials>")]
        [TestCase("<script src=/index-ed23d8e8.js data-no-hash></script>", "<script src=\"/whisparr/index-ed23d8e8.js\"></script>")]
        public void should_prefix_unquoted_attributes(string html, string expected)
        {
            Render(html).Should().Be(expected);
        }

        [TestCase("<a href=/jsdocs>")]
        [TestCase("<a href=/styles.css/more>")]
        public void should_not_rewrite_an_unquoted_value_that_does_not_end_in_an_asset_extension(string html)
        {
            Render(html).Should().Be(html);
        }

        [Test]
        public void should_replace_the_url_base_placeholder()
        {
            Render("<script>window.Whisparr={urlBase:\"__URL_BASE__\"};</script>")
                .Should().Be("<script>window.Whisparr={urlBase:\"/whisparr\"};</script>");
        }

        private sealed class TestMapper : HtmlMapperBase
        {
            public TestMapper(IDiskProvider diskProvider, Lazy<ICacheBreakerProvider> cacheBreakProviderFactory, Logger logger)
                : base(diskProvider, cacheBreakProviderFactory, logger)
            {
                HtmlPath = IndexPath;
                UrlBase = "/whisparr";
            }

            protected override string FolderPath => Path.GetDirectoryName(HtmlPath);

            public string Render()
            {
                return GetHtmlText();
            }

            protected override string MapPath(string resourceUrl)
            {
                return HtmlPath;
            }

            public override bool CanHandle(string resourceUrl)
            {
                return true;
            }
        }
    }
}
