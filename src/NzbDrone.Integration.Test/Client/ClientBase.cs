using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using FluentAssertions;
using NLog;
using NzbDrone.Common.Serializer;
using RestSharp;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace NzbDrone.Integration.Test.Client
{
    public class ClientBase
    {
        protected readonly IRestClient _restClient;
        protected readonly string _resource;
        protected readonly string _apiKey;
        protected readonly Logger _logger;

        public ClientBase(IRestClient restClient, string apiKey, string resource)
        {
            _restClient = restClient;
            _resource = resource;
            _apiKey = apiKey;

            _logger = LogManager.GetLogger("REST");
        }

        public RestRequest BuildRequest(string command = "")
        {
            var request = new RestRequest(_resource + "/" + command.Trim('/'))
            {
                RequestFormat = DataFormat.Json,
            };

            return request;
        }

        public string Execute(RestRequest request, HttpStatusCode statusCode)
        {
            _logger.Info("{0}: {1}", request.Method, _restClient.BuildUri(request));

            var response = _restClient.ExecuteAsync(request).GetAwaiter().GetResult();
            _logger.Info("Response: {0}", response.Content);

            if (response.ErrorException != null)
            {
                throw response.ErrorException;
            }

            AssertDisableCache(response);

            response.ErrorMessage.Should().BeNullOrWhiteSpace();

            response.StatusCode.Should().Be(statusCode, response.Content ?? string.Empty);

            return response.Content;
        }

        public T Execute<T>(RestRequest request, HttpStatusCode statusCode)
            where T : class, new()
        {
            var content = Execute(request, statusCode);

            return Json.Deserialize<T>(content);
        }

        private static void AssertDisableCache(RestResponse response)
        {
            var headers = response.Headers;

            // cache control header gets reordered on net core
            (headers.SingleOrDefault(c => c.Name == "Cache-Control")?.Value ?? string.Empty)
                .Split(',').Select(x => x.Trim())
                .Should().BeEquivalentTo(new[] { "no-store", "no-cache" }, options => options.WithoutStrictOrdering());
        }
    }

    public class ClientBase<TResource> : ClientBase
        where TResource : RestResource, new()
    {
        public ClientBase(IRestClient restClient, string apiKey, string resource = null)
            : base(restClient, apiKey, resource ?? new TResource().ResourceName)
        {
        }

        public List<TResource> All(Dictionary<string, object> queryParams = null)
        {
            var request = BuildRequest();

            if (queryParams != null)
            {
                foreach (var param in queryParams)
                {
                    request.AddQueryParameter(param.Key, param.Value?.ToString());
                }
            }

            return Get<List<TResource>>(request);
        }

        public PagingResource<TResource> GetPaged(int pageNumber, int pageSize, string sortKey, string sortDir, string filterKey = null, object filterValue = null)
        {
            var request = BuildRequest();
            request.AddQueryParameter("page", pageNumber.ToString(System.Globalization.CultureInfo.InvariantCulture));
            request.AddQueryParameter("pageSize", pageSize.ToString(System.Globalization.CultureInfo.InvariantCulture));
            request.AddQueryParameter("sortKey", sortKey);
            request.AddQueryParameter("sortDir", sortDir);

            if (filterKey != null && filterValue != null)
            {
                request.AddQueryParameter(filterKey, filterValue?.ToString());
            }

            return Get<PagingResource<TResource>>(request);
        }

        public TResource Post(TResource body, HttpStatusCode statusCode = HttpStatusCode.Created)
        {
            var request = BuildRequest();
            request.AddJsonBody(body);
            return Post<TResource>(request, statusCode);
        }

        public T Post<T>(RestRequest request, HttpStatusCode statusCode = HttpStatusCode.Created)
            where T : class, new()
        {
            request.Method = Method.Post;
            return Execute<T>(request, statusCode);
        }

        public void InvalidPost(TResource body)
        {
            var request = BuildRequest();
            request.AddJsonBody(body);
            request.Method = Method.Post;
            FluentActions.Invoking(() => Execute<object>(request, HttpStatusCode.BadRequest))
                .Should().Throw<HttpRequestException>();
        }

        public TResource Put(TResource body, HttpStatusCode statusCode = HttpStatusCode.Accepted)
        {
            var request = BuildRequest();
            request.AddJsonBody(body);
            return Put<TResource>(request, statusCode);
        }

        public T Put<T>(RestRequest request, HttpStatusCode statusCode = HttpStatusCode.Accepted)
            where T : class, new()
        {
            request.Method = Method.Put;
            return Execute<T>(request, statusCode);
        }

        public void InvalidPut(TResource body)
        {
            var request = BuildRequest();
            request.AddJsonBody(body);
            request.Method = Method.Put;
            FluentActions.Invoking(() => Execute<object>(request, HttpStatusCode.BadRequest))
                .Should().Throw<HttpRequestException>();
        }

        public TResource Get(int id, HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            var request = BuildRequest(id.ToString());
            return Get<TResource>(request, statusCode);
        }

        public T Get<T>(RestRequest request, HttpStatusCode statusCode = HttpStatusCode.OK)
            where T : class, new()
        {
            request.Method = Method.Get;
            return Execute<T>(request, statusCode);
        }

        public void InvalidGet(int id)
        {
            var request = BuildRequest(id.ToString());
            request.Method = Method.Get;
            FluentActions.Invoking(() => Execute<object>(request, HttpStatusCode.NotFound))
                .Should().Throw<HttpRequestException>();
        }

        public TResource GetSingle(HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            var request = BuildRequest();
            return Get<TResource>(request, statusCode);
        }

        public void Delete(int id)
        {
            var request = BuildRequest(id.ToString());
            Delete(request);
        }

        public void Delete(RestRequest request, HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            request.Method = Method.Delete;
            Execute<object>(request, statusCode);
        }
    }
}
