using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using FluentAssertions;
using NUnit.Framework;

namespace NzbDrone.Integration.Test
{
    [TestFixture]
    public class OpenApiSecurityFixture : IntegrationTest
    {
        private readonly HttpClient _httpClient = new HttpClient();

        [Test]
        public void should_serve_both_api_key_schemes_in_root_security()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, RootUrl + "docs/v3/openapi.json");
            using var response = _httpClient.Send(request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var text = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            var security = JsonDocument.Parse(text).RootElement.GetProperty("security");

            var requirements = security.EnumerateArray()
                .Select(requirement => requirement.EnumerateObject().Select(property => property.Name).ToList())
                .ToList();

            // Two requirements each naming one scheme means either key is sufficient. A single
            // requirement naming both would mean both are required at once.
            requirements.Should().HaveCount(2);
            requirements.Should().OnlyContain(schemeNames => schemeNames.Count == 1);

            requirements.SelectMany(schemeNames => schemeNames)
                .Should().BeEquivalentTo(new List<string> { "X-Api-Key", "apikey" });
        }
    }
}
