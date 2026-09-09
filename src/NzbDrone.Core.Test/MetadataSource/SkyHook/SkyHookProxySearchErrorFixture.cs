using System.Collections.Generic;
using System.Net;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Core.MetadataSource.SkyHook;
using NzbDrone.Core.MetadataSource.SkyHook.Resource;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MetadataSource.SkyHook
{
    [TestFixture]
    public class SkyHookProxySearchErrorFixture : CoreTest<SkyHookProxy>
    {
        private HttpRequest _capturedRequest;

        [SetUp]
        public void Setup()
        {
            _capturedRequest = null;
        }

        private void GivenSearchResponds(HttpStatusCode statusCode)
        {
            Mocker.GetMock<IHttpClient>()
                .Setup(v => v.Get<List<MovieResource>>(It.IsAny<HttpRequest>()))
                .Returns((HttpRequest request) =>
                {
                    _capturedRequest = request;

                    var content = statusCode == HttpStatusCode.OK ? "[]" : string.Empty;
                    var response = new HttpResponse(request, new HttpHeader(), content, statusCode);

                    // Mirrors HttpClient: a failed status throws unless the request suppresses it.
                    if (!request.SuppressHttpError && response.HasHttpError)
                    {
                        throw new HttpException(request, response);
                    }

                    return new HttpResponse<List<MovieResource>>(response);
                });
        }

        [Test]
        public void search_should_not_suppress_http_errors()
        {
            GivenSearchResponds(HttpStatusCode.OK);

            Subject.SearchForNewTmdbMovie("some title");

            _capturedRequest.Should().NotBeNull();
            _capturedRequest.SuppressHttpError.Should().BeFalse();
        }

        [Test]
        public void search_should_still_follow_redirects()
        {
            GivenSearchResponds(HttpStatusCode.OK);

            Subject.SearchForNewTmdbMovie("some title");

            _capturedRequest.AllowAutoRedirect.Should().BeTrue();
        }

        [TestCase(HttpStatusCode.InternalServerError)]
        [TestCase(HttpStatusCode.BadGateway)]
        [TestCase(HttpStatusCode.ServiceUnavailable)]
        public void search_should_report_a_server_error_as_a_communication_failure(HttpStatusCode statusCode)
        {
            GivenSearchResponds(statusCode);

            var exception = Assert.Throws<SkyHookException>(() => Subject.SearchForNewTmdbMovie("some title"));

            // Not "Invalid response received", which is what the generic catch reported
            // while the suppressed status let a deserialization failure surface instead.
            exception.Message.Should().Contain("Unable to communicate with WhisparrAPI");

            ExceptionVerification.IgnoreWarns();
        }
    }
}
