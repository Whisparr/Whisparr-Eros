using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using NLog;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Instrumentation;

namespace Whisparr.Http.Frontend
{
    public interface IViteDevServer
    {
        bool IsEnabled { get; }
        bool HandlesPath(string resourcePath);
        Task<HttpResponseMessage> GetAsync(string resourcePath, string queryString);
        Task<string> GetIndexHtmlAsync();
    }

    // In a debug build the app serves index.html and the module graph from the Vite
    // dev server (`yarn start`, http://localhost:6939 unless WHISPARR_VITE_DEV_SERVER
    // or WHISPARR_VITE_PORT say otherwise) whenever it is running, so frontend edits
    // reload without a rebuild. While it isn't, the built UI is served from disk.
    public class ViteDevServer : IViteDevServer, IDisposable
    {
        private const int DefaultPort = 6939;

        private static readonly TimeSpan ProbeInterval = TimeSpan.FromSeconds(2);
        private static readonly TimeSpan ProbeTimeout = TimeSpan.FromSeconds(1);

        private static readonly string[] Prefixes =
        {
            "/@vite/", "/@react-refresh", "/@id/", "/@fs/", "/node_modules/", "/frontend/src/"
        };

        private readonly Logger _logger = NzbDroneLogger.GetLogger(typeof(ViteDevServer));
        private readonly HttpClient _httpClient;
        private readonly Uri _baseUri;
        private readonly object _probeLock = new();

        private Timer _probeTimer;
        private volatile bool _isRunning;

        public ViteDevServer()
            : this(GetDefaultAddress(BuildInfo.IsDebug), null)
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

        public bool IsEnabled => IsDebugBuild && _baseUri != null && IsRunning();

        protected virtual bool IsDebugBuild => BuildInfo.IsDebug;

        public static string GetDefaultAddress(bool isDebug)
        {
            var address = Environment.GetEnvironmentVariable("WHISPARR_VITE_DEV_SERVER");

            if (address.IsNotNullOrWhiteSpace() || !isDebug)
            {
                return address;
            }

            var port = int.TryParse(Environment.GetEnvironmentVariable("WHISPARR_VITE_PORT"), out var vitePort) ? vitePort : DefaultPort;

            return $"http://localhost:{port}";
        }

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
                _probeTimer?.Dispose();
                _httpClient.Dispose();
            }
        }

        // ProbeAsync never throws, so nothing is lost when the timer doesn't await this.
        protected async Task RefreshAsync()
        {
            UpdateRunning(await ProbeAsync().ConfigureAwait(false));
        }

        // Asks for Vite's own client script, which only a running Vite dev server serves.
        private async Task<bool> ProbeAsync()
        {
            using var cancellation = new CancellationTokenSource(ProbeTimeout);

            try
            {
                using var response = await _httpClient.GetAsync(new Uri(_baseUri, "@vite/client"), HttpCompletionOption.ResponseHeadersRead, cancellation.Token).ConfigureAwait(false);

                return response.IsSuccessStatusCode;
            }
            catch (HttpRequestException)
            {
                return false;
            }
            catch (OperationCanceledException)
            {
                return false;
            }
        }

        // The first check waits for the answer, so the first page is served from the right
        // place; after that a timer keeps the answer current, so starting or stopping
        // `yarn start` switches over within a couple of seconds without a restart.
        private bool IsRunning()
        {
            if (_probeTimer == null)
            {
                lock (_probeLock)
                {
                    if (_probeTimer == null)
                    {
                        UpdateRunning(ProbeAsync().GetAwaiter().GetResult());

                        _probeTimer = new Timer(_ => _ = RefreshAsync(), null, ProbeInterval, ProbeInterval);
                    }
                }
            }

            return _isRunning;
        }

        private void UpdateRunning(bool isRunning)
        {
            if (isRunning == _isRunning)
            {
                return;
            }

            _isRunning = isRunning;

            if (isRunning)
            {
                _logger.Info("Serving the UI from the Vite dev server at {0}", _baseUri);
            }
            else
            {
                _logger.Info("The Vite dev server at {0} stopped responding, serving the UI from disk", _baseUri);
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
