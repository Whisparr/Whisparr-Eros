using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
using FluentAssertions;
using NUnit.Framework;

namespace NzbDrone.Integration.Test
{
    [TestFixture]
    public class OpenApiFixture : IntegrationTest
    {
        private static readonly string[] Verbs = { "get", "put", "post", "delete", "patch", "head", "options" };
        private static readonly Regex ParameterRegex = new Regex(@"\{[^}]+\}", RegexOptions.Compiled);

        private readonly HttpClient _httpClient = new HttpClient();
        private JsonElement _document;

        [OneTimeSetUp]
        public void FetchDocument()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, RootUrl + "docs/v3/openapi.json");
            using var response = _httpClient.Send(request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var text = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            _document = JsonDocument.Parse(text).RootElement.Clone();
        }

        [Test]
        public void every_path_parameter_should_appear_in_its_template()
        {
            // An operation declaring a path parameter its own template has no slot for makes the
            // whole document fail validation, not just that operation.
            foreach (var (path, verb, operation) in GetOperations())
            {
                if (!operation.TryGetProperty("parameters", out var parameters))
                {
                    continue;
                }

                foreach (var parameter in parameters.EnumerateArray().Where(p => p.GetProperty("in").GetString() == "path"))
                {
                    var name = parameter.GetProperty("name").GetString();

                    path.Should().Contain("{" + name + "}", "{0} {1} declares {2} as a path parameter", verb, path, name);
                }
            }
        }

        [Test]
        public void no_two_paths_should_differ_only_by_parameter_name()
        {
            // The spec treats these as the same path, so a document carrying both is invalid even
            // though ASP.NET can tell them apart with a route constraint.
            var byTemplate = GetPaths().GroupBy(path => ParameterRegex.Replace(path, "{}"));

            foreach (var group in byTemplate)
            {
                group.Should().HaveCount(1, "these paths are identical once the parameter names are removed");
            }
        }

        [TestCase("post", "/api/v3/autotagging", "201")]
        [TestCase("post", "/api/v3/customformat", "201")]
        [TestCase("post", "/api/v3/tag", "201")]
        [TestCase("put", "/api/v3/autotagging/{id}", "202")]
        [TestCase("put", "/api/v3/collection/{id}", "202")]
        [TestCase("put", "/api/v3/tag/{id}", "202")]
        public void should_document_the_status_code_the_rest_convention_returns(string verb, string path, string statusCode)
        {
            var responses = GetOperation(verb, path).GetProperty("responses");

            responses.EnumerateObject().Select(r => r.Name).Should().Contain(statusCode);
            responses.EnumerateObject().Select(r => r.Name).Should().NotContain("200");
        }

        [Test]
        public void json_request_bodies_should_be_required()
        {
            // Every [FromBody] parameter is mandatory, so a body the document calls optional would
            // have a client build a request the server answers with a 400.
            foreach (var (path, verb, operation) in GetOperations())
            {
                if (!operation.TryGetProperty("requestBody", out var body) ||
                    !body.GetProperty("content").TryGetProperty("application/json", out _))
                {
                    continue;
                }

                body.TryGetProperty("required", out var required).Should().BeTrue("{0} {1} takes a body", verb, path);
                required.GetBoolean().Should().BeTrue("{0} {1} takes a body", verb, path);
            }
        }

        [Test]
        public void backup_restore_upload_should_document_its_multipart_body()
        {
            // The action reads Request.Form.Files rather than binding a parameter, so nothing is
            // described unless the filter supplies it.
            var operation = GetOperation("post", "/api/v3/system/backup/restore/upload");

            operation.TryGetProperty("requestBody", out var body).Should().BeTrue("the upload takes a multipart body");
            body.GetProperty("required").GetBoolean().Should().BeTrue();

            var schema = body.GetProperty("content").GetProperty("multipart/form-data").GetProperty("schema");

            schema.GetProperty("properties").GetProperty("restore").GetProperty("format").GetString().Should().Be("binary");
            schema.GetProperty("required").EnumerateArray().Select(r => r.GetString()).Should().Contain("restore");
        }

        [Test]
        public void frontend_routes_should_not_be_documented()
        {
            // StaticResourceController serves the UI rather than API data, and its empty route is
            // what made the document invalid.
            GetPaths().Should().NotContain(new[] { "/", "/{path}", "/content/{path}" });
        }

        private JsonElement GetOperation(string verb, string path)
        {
            _document.GetProperty("paths").TryGetProperty(path, out var item).Should().BeTrue("{0} should be documented", path);
            item.TryGetProperty(verb, out var operation).Should().BeTrue("{0} {1} should be documented", verb, path);

            return operation;
        }

        private List<string> GetPaths()
        {
            return _document.GetProperty("paths").EnumerateObject().Select(p => p.Name).ToList();
        }

        private List<(string Path, string Verb, JsonElement Operation)> GetOperations()
        {
            var operations = new List<(string, string, JsonElement)>();

            foreach (var path in _document.GetProperty("paths").EnumerateObject())
            {
                foreach (var verb in Verbs)
                {
                    if (path.Value.TryGetProperty(verb, out var operation))
                    {
                        operations.Add((path.Name, verb, operation));
                    }
                }
            }

            return operations;
        }
    }
}
