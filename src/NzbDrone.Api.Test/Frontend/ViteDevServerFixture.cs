using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Test.Common;
using Whisparr.Http.Frontend;

namespace NzbDrone.Api.Test.Frontend
{
    [TestFixture]
    public class ViteDevServerFixture : TestBase
    {
        private const string DevServer = "http://localhost:6939";

        [TestCase("/@vite/client")]
        [TestCase("/@react-refresh")]
        [TestCase("/@id/virtual:module")]
        [TestCase("/@fs/Users/dev/project/file.ts")]
        [TestCase("/node_modules/.vite/deps/react.js")]
        [TestCase("/frontend/src/index.ts")]
        [TestCase("/frontend/src/Components/Page/Page.module.css")]
        public void should_recognise_vite_dev_server_paths(string resourcePath)
        {
            using var subject = new TestViteDevServer(DevServer, isDebug: true);

            ViteDevServer.IsViteDevPath(resourcePath).Should().BeTrue();
            subject.HandlesPath(resourcePath).Should().BeTrue();
        }

        [TestCase("/api/v3/movie")]
        [TestCase("/Content/Fonts/fonts.css")]
        [TestCase("/assets/index-abc123.js")]
        [TestCase("/login")]
        [TestCase("/")]
        [TestCase("/movie/1")]
        public void should_leave_application_paths_alone(string resourcePath)
        {
            using var subject = new TestViteDevServer(DevServer, isDebug: true);

            ViteDevServer.IsViteDevPath(resourcePath).Should().BeFalse();
            subject.HandlesPath(resourcePath).Should().BeFalse();
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public void should_not_be_enabled_without_a_dev_server_address(string baseAddress)
        {
            using var subject = new TestViteDevServer(baseAddress, isDebug: true);

            subject.IsEnabled.Should().BeFalse();
            subject.HandlesPath("/@vite/client").Should().BeFalse();
        }

        [Test]
        public void should_be_enabled_with_a_dev_server_address_in_a_debug_build()
        {
            using var subject = new TestViteDevServer(DevServer, isDebug: true);

            subject.IsEnabled.Should().BeTrue();
        }

        [Test]
        public void should_never_be_enabled_in_a_release_build()
        {
            using var subject = new TestViteDevServer(DevServer, isDebug: false);

            subject.IsEnabled.Should().BeFalse();
            subject.HandlesPath("/frontend/src/index.ts").Should().BeFalse();
        }

        [TestCase(null, false)]
        [TestCase("http://localhost:6939", true)]
        public void should_read_the_dev_server_address_from_the_environment(string address, bool enabledInDebug)
        {
            var previous = Environment.GetEnvironmentVariable("WHISPARR_VITE_DEV_SERVER");

            try
            {
                Environment.SetEnvironmentVariable("WHISPARR_VITE_DEV_SERVER", address);

                using var subject = new ViteDevServer();

                subject.IsEnabled.Should().Be(enabledInDebug && BuildInfo.IsDebug);
            }
            finally
            {
                Environment.SetEnvironmentVariable("WHISPARR_VITE_DEV_SERVER", previous);
            }
        }

        [Test]
        public void should_follow_the_build_configuration_by_default()
        {
            using var subject = new TestViteDevServer(DevServer);

            subject.IsEnabled.Should().Be(BuildInfo.IsDebug);
        }

        [Test]
        public async Task should_request_the_path_and_query_from_the_dev_server()
        {
            using var handler = new RecordingHandler("export {};");
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            using var response = await subject.GetAsync("/frontend/src/index.ts", "?import");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            handler.Requests.Should().Equal(new Uri("http://localhost:6939/frontend/src/index.ts?import"));
        }

        [Test]
        public async Task should_request_index_html_from_the_dev_server()
        {
            using var handler = new RecordingHandler("<html></html>");
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            (await subject.GetIndexHtmlAsync()).Should().Be("<html></html>");
            handler.Requests.Should().Equal(new Uri("http://localhost:6939/index.html"));
        }

        [TestCase("/frontend/src/../../etc/passwd")]
        [TestCase("/api/v3/movie")]
        [TestCase("//evil.example/frontend/src/index.ts")]
        public void should_refuse_to_proxy_anything_but_dev_server_paths(string resourcePath)
        {
            using var handler = new RecordingHandler(string.Empty);
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            Assert.Throws<ArgumentException>(() => subject.GetAsync(resourcePath, string.Empty));
            handler.Requests.Should().BeEmpty();
        }

        [Test]
        public void should_refuse_to_proxy_when_disabled()
        {
            using var handler = new RecordingHandler(string.Empty);
            using var subject = new TestViteDevServer(DevServer, isDebug: false, handler);

            Assert.Throws<ArgumentException>(() => subject.GetAsync("/frontend/src/index.ts", string.Empty));
        }

        [Test]
        public void should_dispose_its_http_client()
        {
            using var handler = new RecordingHandler(string.Empty);
            var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            subject.Dispose();

            handler.IsDisposed.Should().BeTrue();
        }

        private class TestViteDevServer : ViteDevServer
        {
            private readonly bool? _isDebug;

            public TestViteDevServer(string baseAddress, bool? isDebug = null, HttpMessageHandler handler = null)
                : base(baseAddress, handler)
            {
                _isDebug = isDebug;
            }

            protected override bool IsDebugBuild => _isDebug ?? base.IsDebugBuild;
        }

        private class RecordingHandler : HttpMessageHandler
        {
            private readonly string _body;

            public RecordingHandler(string body)
            {
                _body = body;
            }

            public List<Uri> Requests { get; } = new();
            public bool IsDisposed { get; private set; }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Requests.Add(request.RequestUri);

                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(_body) });
            }

            protected override void Dispose(bool disposing)
            {
                IsDisposed = true;
                base.Dispose(disposing);
            }
        }
    }
}
