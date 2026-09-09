using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Http;
using NzbDrone.Core.Download.Clients.QBittorrent;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Download.DownloadClientTests.QBittorrentTests
{
    [TestFixture]
    public class QBittorrentProxyV2Fixture : CoreTest<QBittorrentProxyV2>
    {
        private List<HttpRequest> _requests;

        [SetUp]
        public void Setup()
        {
            _requests = new List<HttpRequest>();

            Mocker.SetConstant<ICacheManager>(Mocker.Resolve<CacheManager>());

            Mocker.GetMock<IHttpClient>()
                  .Setup(s => s.Execute(It.IsAny<HttpRequest>()))
                  .Returns<HttpRequest>(r =>
                  {
                      _requests.Add(r);

                      if (r.Url.Path.EndsWith("/auth/login"))
                      {
                          var headers = new HttpHeader();
                          headers.Add("Set-Cookie", "SID=abc123; path=/");

                          return new HttpResponse(r, headers, "Ok.");
                      }

                      return new HttpResponse(r, new HttpHeader(), "[]");
                  });
        }

        private static QBittorrentSettings GivenSettings(string username, string password)
        {
            return new QBittorrentSettings
            {
                Host = "127.0.0.1",
                Port = 2222,
                Username = username,
                Password = password
            };
        }

        private int LoginCount => _requests.Count(r => r.Url.Path.EndsWith("/auth/login"));

        [Test]
        public void should_reuse_the_auth_cookie_for_unchanged_credentials()
        {
            Subject.GetTorrents(GivenSettings("admin", "pass"));
            Subject.GetTorrents(GivenSettings("admin", "pass"));

            LoginCount.Should().Be(1);
        }

        [Test]
        public void should_reauthenticate_when_the_username_changes()
        {
            Subject.GetTorrents(GivenSettings("admin", "pass"));
            Subject.GetTorrents(GivenSettings("someone-else", "pass"));

            LoginCount.Should().Be(2);
        }

        [Test]
        public void should_reauthenticate_when_the_password_changes()
        {
            Subject.GetTorrents(GivenSettings("admin", "pass"));
            Subject.GetTorrents(GivenSettings("admin", "different"));

            LoginCount.Should().Be(2);
        }

        [Test]
        public void should_not_persist_the_auth_cookie_beyond_the_request()
        {
            Subject.GetTorrents(GivenSettings("admin", "pass"));

            _requests.Should().NotBeEmpty();
            _requests.Should().OnlyContain(r => r.StoreRequestCookie == false);
        }

        [Test]
        public void should_send_the_auth_cookie_on_subsequent_requests()
        {
            Subject.GetTorrents(GivenSettings("admin", "pass"));

            var torrentsRequest = _requests.Last();

            torrentsRequest.Url.Path.Should().EndWith("/torrents/info");
            torrentsRequest.Cookies.Should().Contain(new KeyValuePair<string, string>("SID", "abc123"));
        }

        [Test]
        public void should_use_the_api_key_header_and_skip_login_when_an_api_key_is_set()
        {
            var settings = GivenSettings(null, null);
            settings.ApiKey = "some-api-key";

            Subject.GetTorrents(settings);

            LoginCount.Should().Be(0);
            _requests.Should().OnlyContain(r => r.Headers["Authorization"] == "Bearer some-api-key");
        }
    }
}
