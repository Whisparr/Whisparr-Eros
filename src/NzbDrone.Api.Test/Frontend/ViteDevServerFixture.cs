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
            using var handler = new RecordingHandler(string.Empty);
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

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
            using var handler = new RecordingHandler(string.Empty);
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            ViteDevServer.IsViteDevPath(resourcePath).Should().BeFalse();
            subject.HandlesPath(resourcePath).Should().BeFalse();
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public void should_not_be_enabled_without_a_dev_server_address(string baseAddress)
        {
            using var handler = new RecordingHandler(string.Empty);
            using var subject = new TestViteDevServer(baseAddress, isDebug: true, handler);

            subject.IsEnabled.Should().BeFalse();
            subject.HandlesPath("/@vite/client").Should().BeFalse();
        }

        [Test]
        public void should_be_enabled_with_a_dev_server_address_in_a_debug_build()
        {
            using var handler = new RecordingHandler(string.Empty);
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            subject.IsEnabled.Should().BeTrue();
        }

        [Test]
        public void should_never_be_enabled_in_a_release_build()
        {
            using var handler = new RecordingHandler(string.Empty);
            using var subject = new TestViteDevServer(DevServer, isDebug: false, handler);

            subject.IsEnabled.Should().BeFalse();
            subject.HandlesPath("/frontend/src/index.ts").Should().BeFalse();
        }

        [Test]
        public void should_default_to_the_yarn_start_port_in_a_debug_build()
        {
            WithEnvironment(null, null, () => ViteDevServer.GetDefaultAddress(true).Should().Be("http://localhost:6939"));
        }

        [Test]
        public void should_default_to_the_configured_vite_port_in_a_debug_build()
        {
            WithEnvironment(null, "7000", () => ViteDevServer.GetDefaultAddress(true).Should().Be("http://localhost:7000"));
        }

        [Test]
        public void should_prefer_the_dev_server_address_from_the_environment()
        {
            WithEnvironment("http://127.0.0.1:5000", null, () => ViteDevServer.GetDefaultAddress(true).Should().Be("http://127.0.0.1:5000"));
        }

        [Test]
        public void should_have_no_default_address_in_a_release_build()
        {
            WithEnvironment(null, null, () => ViteDevServer.GetDefaultAddress(false).Should().BeNull());
        }

        [Test]
        public void should_not_be_enabled_while_the_dev_server_is_not_running()
        {
            using var handler = new RecordingHandler(string.Empty) { Status = HttpStatusCode.NotFound };
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            subject.IsEnabled.Should().BeFalse();
            subject.HandlesPath("/frontend/src/index.ts").Should().BeFalse();
        }

        [Test]
        public void should_not_be_enabled_while_the_dev_server_is_unreachable()
        {
            using var handler = new RecordingHandler(string.Empty) { Throws = true };
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            subject.IsEnabled.Should().BeFalse();
        }

        [Test]
        public void should_follow_the_dev_server_starting_and_stopping()
        {
            using var handler = new RecordingHandler(string.Empty) { Status = HttpStatusCode.NotFound };
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            subject.IsEnabled.Should().BeFalse();

            handler.Status = HttpStatusCode.OK;
            subject.RefreshNow();
            subject.IsEnabled.Should().BeTrue();

            handler.Status = HttpStatusCode.NotFound;
            subject.RefreshNow();
            subject.IsEnabled.Should().BeFalse();
        }

        [Test]
        public void should_probe_for_the_vite_client()
        {
            using var handler = new RecordingHandler(string.Empty);
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            subject.IsEnabled.Should().BeTrue();
            handler.Requests.Should().Equal(new Uri("http://localhost:6939/@vite/client"));
        }

        [Test]
        public void should_follow_the_build_configuration_by_default()
        {
            using var handler = new RecordingHandler(string.Empty);
            using var subject = new TestViteDevServer(DevServer, null, handler);

            subject.IsEnabled.Should().Be(BuildInfo.IsDebug);
        }

        [Test]
        public async Task should_request_the_path_and_query_from_the_dev_server()
        {
            using var handler = new RecordingHandler("export {};");
            using var subject = new TestViteDevServer(DevServer, isDebug: true, handler);

            using var response = await subject.GetAsync("/frontend/src/index.ts", "?import");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            handler.Requests.Should().EndWith(new Uri("http://localhost:6939/frontend/src/index.ts?import"));
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
            handler.Requests.Should().OnlyContain(uri => uri.AbsolutePath == "/@vite/client");
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

        private static void WithEnvironment(string devServer, string port, Action test)
        {
            var previousDevServer = Environment.GetEnvironmentVariable("WHISPARR_VITE_DEV_SERVER");
            var previousPort = Environment.GetEnvironmentVariable("WHISPARR_VITE_PORT");

            try
            {
                Environment.SetEnvironmentVariable("WHISPARR_VITE_DEV_SERVER", devServer);
                Environment.SetEnvironmentVariable("WHISPARR_VITE_PORT", port);

                test();
            }
            finally
            {
                Environment.SetEnvironmentVariable("WHISPARR_VITE_DEV_SERVER", previousDevServer);
                Environment.SetEnvironmentVariable("WHISPARR_VITE_PORT", previousPort);
            }
        }

        private class TestViteDevServer : ViteDevServer
        {
            private readonly bool? _isDebug;

            public TestViteDevServer(string baseAddress, bool? isDebug, HttpMessageHandler handler)
                : base(baseAddress, handler)
            {
                _isDebug = isDebug;
            }

            protected override bool IsDebugBuild => _isDebug ?? base.IsDebugBuild;

            public void RefreshNow() => Refresh();
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
            public HttpStatusCode Status { get; set; } = HttpStatusCode.OK;
            public bool Throws { get; set; }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Requests.Add(request.RequestUri);

                if (Throws)
                {
                    throw new HttpRequestException("Connection refused");
                }

                return Task.FromResult(new HttpResponseMessage(Status) { Content = new StringContent(_body) });
            }

            protected override void Dispose(bool disposing)
            {
                IsDisposed = true;
                base.Dispose(disposing);
            }
        }
    }
}
