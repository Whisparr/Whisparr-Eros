using System.Collections.Generic;
using System.Linq;
using System.Web;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Core.ImportLists.TMDb.Company;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.ImportListTests.TMDb
{
    [TestFixture]
    public class TMDbCompanyRequestGeneratorFixture : CoreTest
    {
        private TMDbCompanyRequestGenerator _generator;
        private List<HttpRequest> _sentRequests;

        [SetUp]
        public void Setup()
        {
            _sentRequests = new List<HttpRequest>();

            Mocker.GetMock<IHttpClient>()
                .Setup(v => v.Get(It.IsAny<HttpRequest>()))
                .Callback<HttpRequest>(r => _sentRequests.Add(r))
                .Returns<HttpRequest>(r => new HttpResponse(r, new HttpHeader(), "{\"page\":1,\"total_pages\":4,\"total_results\":71,\"results\":[]}"));

            _generator = new TMDbCompanyRequestGenerator
            {
                Settings = new TMDbCompanySettings { CompanyId = "67059" },
                HttpClient = Mocker.GetMock<IHttpClient>().Object,
                RequestBuilder = new HttpRequestBuilder("https://api.themoviedb.org/{api}/{route}/{id}{secondaryRoute}").CreateFactory(),
                Logger = TestLogger
            };
        }

        [Test]
        public void should_request_every_page_exactly_once_with_a_single_page_parameter()
        {
            var requests = _generator.GetMovies().GetAllTiers().SelectMany(t => t).ToList();

            requests.Should().HaveCount(4);

            var pages = requests
                .Select(r => HttpUtility.ParseQueryString(r.HttpRequest.Url.Query).GetValues("page"))
                .ToList();

            pages.Should().AllSatisfy(p => p.Should().ContainSingle());
            pages.Select(p => p.Single()).Should().Equal("1", "2", "3", "4");
        }

        [Test]
        public void should_send_the_initial_total_pages_request_with_a_single_page_parameter()
        {
            _generator.GetMovies();

            _sentRequests.Should().ContainSingle();

            var query = HttpUtility.ParseQueryString(_sentRequests.Single().Url.Query);
            query.GetValues("page").Should().Equal("1");
            query["with_companies"].Should().Be("67059");
        }

        [Test]
        public void should_keep_company_and_adult_parameters_on_every_page()
        {
            var requests = _generator.GetMovies().GetAllTiers().SelectMany(t => t).ToList();

            requests.Should().AllSatisfy(r =>
            {
                var query = HttpUtility.ParseQueryString(r.HttpRequest.Url.Query);
                query["with_companies"].Should().Be("67059");
                query["include_adult"].Should().Be("true");
            });
        }
    }
}
