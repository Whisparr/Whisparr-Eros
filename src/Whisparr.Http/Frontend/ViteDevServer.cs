using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;

namespace Whisparr.Http.Frontend
{
    public interface IViteDevServer
    {
        bool IsEnabled { get; }
        bool HandlesPath(string resourcePath);
        Task<HttpResponseMessage> GetAsync(string resourcePath, string queryString);
        Task<string> GetIndexHtmlAsync();
    }

    // In a debug build with WHISPARR_VITE_DEV_SERVER set (e.g. http://localhost:6939,
    // where `yarn start` runs Vite), the app serves index.html and the module graph
    // from the dev server, so frontend edits reload without a rebuild.
    public class ViteDevServer : IViteDevServer, IDisposable
    {
        private static readonly string[] Prefixes =
        {
            "/@vite/", "/@react-refresh", "/@id/", "/@fs/", "/node_modules/", "/frontend/src/"
        };

        private readonly HttpClient _httpClient;
        private readonly Uri _baseUri;

        public ViteDevServer()
            : this(Environment.GetEnvironmentVariable("WHISPARR_VITE_DEV_SERVER"), null)
        {
        }

        // Tests pass a handler; otherwise HttpClient creates and owns its own.
        protected ViteDevServer(string baseAddress, HttpMessageHandler handler)
        {
            // The dev server is addressed at its root, so request paths resolve against that.
            if (baseAddress.IsNotNullOrWhiteSpace() && Uri.TryCreate(baseAddress.Trim(), UriKind.Absolute, out var baseUri))
            {
                _baseUri = baseUri;
            }

            _httpClient = handler == null ? new HttpClient() : new HttpClient(handler);
            _httpClient.Timeout = TimeSpan.FromSeconds(10);
        }

        public bool IsEnabled => IsDebugBuild && _baseUri != null;

        protected virtual bool IsDebugBuild => BuildInfo.IsDebug;

        public static bool IsViteDevPath(string resourcePath)
        {
            var path = resourcePath.ToLowerInvariant();

            return Prefixes.Any(prefix => path.StartsWith(prefix, StringComparison.Ordinal) ||
                                          path.Equals(prefix.TrimEnd('/'), StringComparison.Ordinal));
        }

        public bool HandlesPath(string resourcePath)
        {
            return IsEnabled && IsViteDevPath(resourcePath);
        }

        public Task<HttpResponseMessage> GetAsync(string resourcePath, string queryString)
        {
            return _httpClient.GetAsync(BuildDevServerUri(resourcePath, queryString));
        }

        public Task<string> GetIndexHtmlAsync()
        {
            return _httpClient.GetStringAsync(new Uri(_baseUri, "index.html"));
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _httpClient.Dispose();
            }
        }

        // Only Vite's own paths are proxied, and the result has to stay on the dev
        // server: no traversal out of it, and no absolute or scheme-relative URL.
        private Uri BuildDevServerUri(string resourcePath, string queryString)
        {
            if (!IsEnabled || !IsViteDevPath(resourcePath) || resourcePath.Contains("..", StringComparison.Ordinal) || resourcePath.StartsWith("//", StringComparison.Ordinal))
            {
                throw new ArgumentException("Not a Vite dev server path", nameof(resourcePath));
            }

            var uri = new Uri(_baseUri, resourcePath + queryString);

            if (!_baseUri.IsBaseOf(uri))
            {
                throw new ArgumentException("Not a Vite dev server path", nameof(resourcePath));
            }

            return uri;
        }
    }
}
