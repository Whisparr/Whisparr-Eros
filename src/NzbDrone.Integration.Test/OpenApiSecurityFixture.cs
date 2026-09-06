using System.Net.Http;
using System.Text.Json;
using FluentAssertions;
using NUnit.Framework;

namespace NzbDrone.Integration.Test
{
    [TestFixture]
    public class OpenApiSecurityFixture : IntegrationTest
    {
        private HttpClient _httpClient = new HttpClient();

        [Test]
        public void should_serve_both_api_key_schemes_in_root_security()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, RootUrl + "docs/v3/openapi.json");
            var response = _httpClient.Send(request);
            var text = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

            var security = JsonDocument.Parse(text).RootElement.GetProperty("security");

            security.GetArrayLength().Should().Be(2);
            security[0].EnumerateObject().Should().ContainSingle(property => property.Name == "X-Api-Key");
            security[1].EnumerateObject().Should().ContainSingle(property => property.Name == "apikey");
        }
    }
}
