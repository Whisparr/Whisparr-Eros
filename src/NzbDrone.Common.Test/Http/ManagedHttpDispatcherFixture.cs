using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Http;
using NzbDrone.Common.Http.Dispatchers;
using NzbDrone.Common.Http.Proxy;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Security;
using NzbDrone.Test.Common;

namespace NzbDrone.Common.Test.Http
{
    [TestFixture]
    public class ManagedHttpDispatcherFixture : TestBase<ManagedHttpDispatcher>
    {
        [SetUp]
        public void SetUp()
        {
            Mocker.GetMock<IPlatformInfo>().Setup(c => c.Version).Returns(new Version("1.0.0"));
            Mocker.GetMock<IOsInfo>().Setup(c => c.Name).Returns("TestOS");
            Mocker.GetMock<IOsInfo>().Setup(c => c.Version).Returns("9.0.0");

            Mocker.GetMock<IConfigService>().SetupGet(x => x.CertificateValidation).Returns(CertificateValidationType.Enabled);

            Mocker.SetConstant<IUserAgentBuilder>(Mocker.Resolve<UserAgentBuilder>());
            Mocker.SetConstant<ICacheManager>(Mocker.Resolve<CacheManager>());
            Mocker.SetConstant<ICreateManagedWebProxy>(Mocker.Resolve<ManagedWebProxyFactory>());
            Mocker.SetConstant<ICertificateValidationService>(new X509CertificateValidationService(Mocker.GetMock<IConfigService>().Object, TestLogger));
        }

        [Test]
        public async Task should_send_basic_auth_credentials_as_utf8()
        {
            // ISO-8859-1 cannot represent either of these, and encodes both as '?'.
            var username = "tèst";
            var password = "pâsswörd_ș";

            using var server = new CapturingServer();

            var request = new HttpRequest($"http://127.0.0.1:{server.Port}/")
            {
                Credentials = new BasicNetworkCredential(username, password)
            };

            await Subject.GetResponseAsync(request, new CookieContainer());

            var header = server.Headers["Authorization"];
            header.Should().StartWith("Basic ");

            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(header["Basic ".Length..]));

            decoded.Should().Be($"{username}:{password}");
        }

        // A loopback listener rather than a request to httpbin: the header is the
        // whole assertion, and reading it off the wire needs nothing more than a
        // socket that answers once.
        private sealed class CapturingServer : IDisposable
        {
            private readonly TcpListener _listener;
            private readonly Task _accepting;

            public CapturingServer()
            {
                _listener = new TcpListener(IPAddress.Loopback, 0);
                _listener.Start();

                Port = ((IPEndPoint)_listener.LocalEndpoint).Port;
                Headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

                _accepting = AcceptOneAsync();
            }

            public int Port { get; }
            public Dictionary<string, string> Headers { get; }

            private async Task AcceptOneAsync()
            {
                using var client = await _listener.AcceptTcpClientAsync();
                using var stream = client.GetStream();

                var buffer = new byte[8192];
                var read = 0;

                // Requests here carry no body, so the blank line ends them.
                while (read < buffer.Length)
                {
                    var count = await stream.ReadAsync(buffer.AsMemory(read, buffer.Length - read));

                    if (count == 0)
                    {
                        break;
                    }

                    read += count;

                    if (Encoding.UTF8.GetString(buffer, 0, read).Contains("\r\n\r\n"))
                    {
                        break;
                    }
                }

                foreach (var line in Encoding.UTF8.GetString(buffer, 0, read).Split("\r\n"))
                {
                    var separator = line.IndexOf(':');

                    if (separator > 0)
                    {
                        Headers[line[..separator]] = line.Substring(separator + 1).Trim();
                    }
                }

                var response = Encoding.ASCII.GetBytes("HTTP/1.1 200 OK\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
                await stream.WriteAsync(response);
                await stream.FlushAsync();
            }

            public void Dispose()
            {
                _accepting.GetAwaiter().GetResult();
                _listener.Stop();
            }
        }
    }
}
