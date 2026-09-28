using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NLog;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Configuration;
using NzbDrone.Test.Common;
using Whisparr.Http.Frontend;
using Whisparr.Http.Frontend.Mappers;

namespace NzbDrone.Api.Test.Frontend.Mappers
{
    [TestFixture]
    public class ViteDevMapperFixture : TestBase
    {
        private const string ModulePath = "/frontend/src/index.ts";

        private ViteDevMapper Subject => new(Mocker.GetMock<IViteDevServer>().Object, LogManager.GetCurrentClassLogger());

        [Test]
        public void should_only_handle_what_the_dev_server_handles()
        {
            Mocker.GetMock<IViteDevServer>().Setup(s => s.HandlesPath(ModulePath)).Returns(true);

            Subject.CanHandle(ModulePath).Should().BeTrue();
            Subject.CanHandle("/movies").Should().BeFalse();
            Subject.Map(ModulePath).Should().BeNull();
        }

        [Test]
        public async Task should_stream_the_dev_server_response()
        {
            GivenDevServerResponse(HttpStatusCode.OK, "export {};");

            var result = await Subject.GetResponse(ModulePath, "?import");

            var file = result.Should().BeOfType<FileStreamResult>().Subject;
            file.ContentType.Should().StartWith("text/javascript");
            ReadBody(file).Should().Be("export {};");

            Mocker.GetMock<IViteDevServer>().Verify(s => s.GetAsync(ModulePath, "?import"), Times.Once());
        }

        [Test]
        public async Task should_send_no_query_string_when_none_is_given()
        {
            GivenDevServerResponse(HttpStatusCode.OK, string.Empty);

            await Subject.GetResponse(ModulePath);

            Mocker.GetMock<IViteDevServer>().Verify(s => s.GetAsync(ModulePath, string.Empty), Times.Once());
        }

        [Test]
        public async Task should_return_nothing_when_the_dev_server_does_not_have_it()
        {
            GivenDevServerResponse(HttpStatusCode.NotFound, "missing");

            (await Subject.GetResponse(ModulePath, string.Empty)).Should().BeNull();

            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public async Task should_return_nothing_when_the_dev_server_is_unreachable()
        {
            GivenDevServerThrows(new HttpRequestException("refused"));

            (await Subject.GetResponse(ModulePath, string.Empty)).Should().BeNull();

            ExceptionVerification.ExpectedErrors(1);
        }

        [Test]
        public async Task should_return_nothing_when_the_dev_server_times_out()
        {
            GivenDevServerThrows(new TaskCanceledException());

            (await Subject.GetResponse(ModulePath, string.Empty)).Should().BeNull();

            ExceptionVerification.ExpectedErrors(1);
        }

        [Test]
        public async Task should_return_nothing_for_a_path_the_dev_server_refuses()
        {
            GivenDevServerThrows(new ArgumentException("Not a Vite dev server path"));

            (await Subject.GetResponse("/frontend/src/../secret", string.Empty)).Should().BeNull();
        }

        [Test]
        public async Task should_pass_the_request_query_string_through_the_controller()
        {
            Mocker.GetMock<IViteDevServer>().Setup(s => s.HandlesPath(ModulePath)).Returns(true);
            GivenDevServerResponse(HttpStatusCode.OK, "export {};");

            using var controller = new StaticResourceController(new IMapHttpRequestsToDisk[] { Subject }, LogManager.GetCurrentClassLogger())
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };
            controller.ControllerContext.HttpContext.Request.QueryString = new QueryString("?t=123");

            var result = await controller.Index("frontend/src/index.ts");

            result.Should().BeOfType<FileStreamResult>();
            Mocker.GetMock<IViteDevServer>().Verify(s => s.GetAsync(ModulePath, "?t=123"), Times.Once());
        }

        [Test]
        public void should_leave_dev_server_paths_to_the_vite_mapper_when_enabled()
        {
            Mocker.GetMock<IViteDevServer>().Setup(s => s.HandlesPath(It.IsAny<string>())).Returns<string>(ViteDevServer.IsViteDevPath);

            var staticMapper = new StaticResourceMapper(Mocker.GetMock<IAppFolderInfo>().Object,
                                                        Mocker.GetMock<IDiskProvider>().Object,
                                                        Mocker.GetMock<IConfigFileProvider>().Object,
                                                        Mocker.GetMock<IViteDevServer>().Object,
                                                        LogManager.GetCurrentClassLogger());

            staticMapper.CanHandle("/frontend/src/Components/Page/Page.module.css").Should().BeFalse();
            staticMapper.CanHandle("/assets/index-abc123.js").Should().BeTrue();

            var indexMapper = GivenIndexMapper();

            indexMapper.CanHandle("/@react-refresh").Should().BeFalse();
            indexMapper.CanHandle("/movies").Should().BeTrue();
        }

        [Test]
        public async Task should_serve_index_html_from_the_dev_server_without_a_build_on_disk()
        {
            Mocker.GetMock<IViteDevServer>().SetupGet(s => s.IsEnabled).Returns(true);
            Mocker.GetMock<IViteDevServer>()
                  .Setup(s => s.GetIndexHtmlAsync())
                  .ReturnsAsync("<script type=\"module\" src=\"/frontend/src/index.ts\" data-no-hash></script><html class=\"_THEME_\">");

            var result = await GivenIndexMapper().GetResponse("/movies");

            var file = result.Should().BeOfType<FileStreamResult>().Subject;
            ReadBody(file)
                .Should().Be("<script type=\"module\" src=\"/whisparr/frontend/src/index.ts\"></script><html class=\"dark\">");

            Mocker.GetMock<IDiskProvider>().Verify(s => s.ReadAllText(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public async Task should_serve_the_built_index_html_when_the_dev_server_is_off()
        {
            Mocker.GetMock<IDiskProvider>().Setup(s => s.FileExists(It.IsAny<string>(), It.IsAny<StringComparison>())).Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(s => s.ReadAllText(It.IsAny<string>())).Returns("<html class=\"_THEME_\">");

            var result = await GivenIndexMapper().GetResponse("/movies");

            ReadBody(result.Should().BeOfType<FileStreamResult>().Subject)
                .Should().Be("<html class=\"dark\">");

            Mocker.GetMock<IViteDevServer>().Verify(s => s.GetIndexHtmlAsync(), Times.Never());
        }

        private static string ReadBody(FileStreamResult file)
        {
            using var reader = new StreamReader(file.FileStream);

            return reader.ReadToEnd();
        }

        private void GivenDevServerResponse(HttpStatusCode status, string body, string contentType = "text/javascript")
        {
            Mocker.GetMock<IViteDevServer>()
                  .Setup(s => s.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                  .ReturnsAsync(() => new HttpResponseMessage(status) { Content = new StringContent(body, null, contentType) });
        }

        private void GivenDevServerThrows(Exception exception)
        {
            Mocker.GetMock<IViteDevServer>()
                  .Setup(s => s.GetAsync(It.IsAny<string>(), It.IsAny<string>()))
                  .ThrowsAsync(exception);
        }

        private IndexHtmlMapper GivenIndexMapper()
        {
            Mocker.GetMock<IAppFolderInfo>().SetupGet(s => s.StartUpFolder).Returns(Path.GetTempPath());
            Mocker.GetMock<IConfigFileProvider>().SetupGet(s => s.UiFolder).Returns("UI");
            Mocker.GetMock<IConfigFileProvider>().SetupGet(s => s.UrlBase).Returns("/whisparr");
            Mocker.GetMock<IConfigFileProvider>().SetupGet(s => s.Theme).Returns("dark");
            Mocker.GetMock<ICacheBreakerProvider>()
                  .Setup(s => s.AddCacheBreakerToPath(It.IsAny<string>()))
                  .Returns<string>(path => path);

            return new IndexHtmlMapper(Mocker.GetMock<IAppFolderInfo>().Object,
                                       Mocker.GetMock<IDiskProvider>().Object,
                                       Mocker.GetMock<IConfigFileProvider>().Object,
                                       Mocker.GetMock<IViteDevServer>().Object,
                                       new Lazy<ICacheBreakerProvider>(() => Mocker.GetMock<ICacheBreakerProvider>().Object),
                                       LogManager.GetCurrentClassLogger());
        }
    }
}
