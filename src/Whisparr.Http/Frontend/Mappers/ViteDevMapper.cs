using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NLog;
using NzbDrone.Common.Extensions;

namespace Whisparr.Http.Frontend.Mappers
{
    // Proxies Vite's module graph (/@vite/client, /frontend/src/..., /node_modules/.vite/...)
    // to the dev server. Only active when IViteDevServer is enabled, so never in a release build.
    public class ViteDevMapper : IMapHttpRequestsToDisk
    {
        private readonly IViteDevServer _viteDevServer;
        private readonly Logger _logger;

        public ViteDevMapper(IViteDevServer viteDevServer, Logger logger)
        {
            _viteDevServer = viteDevServer;
            _logger = logger;
        }

        public string Map(string resourceUrl)
        {
            return null;
        }

        public bool CanHandle(string resourceUrl)
        {
            return _viteDevServer.HandlesPath(resourceUrl);
        }

        public Task<IActionResult> GetResponse(string resourceUrl)
        {
            return GetResponse(resourceUrl, string.Empty);
        }

        // Vite marks module requests with query strings (?import, ?t=...), so they are passed through.
        public async Task<IActionResult> GetResponse(string resourcePath, string queryString)
        {
            HttpResponseMessage response;

            try
            {
                response = await _viteDevServer.GetAsync(resourcePath, queryString).ConfigureAwait(false);
            }
            catch (HttpRequestException ex)
            {
                _logger.Error(ex, "Unable to reach the Vite dev server for {0}. Is it running, and does WHISPARR_VITE_DEV_SERVER point at it?", resourcePath.ForLog());

                return null;
            }
            catch (ArgumentException ex)
            {
                _logger.Debug(ex, "Refusing to proxy {0} to the Vite dev server", resourcePath.ForLog());

                return null;
            }
            catch (TaskCanceledException ex)
            {
                _logger.Error(ex, "Timed out waiting for the Vite dev server for {0}. Is it running, and does WHISPARR_VITE_DEV_SERVER point at it?", resourcePath.ForLog());

                return null;
            }

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                _logger.Warn("Vite dev server returned {0} for {1}: {2}", response.StatusCode, resourcePath.ForLog(), body.ForLog());

                return null;
            }

            var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";

            return new FileStreamResult(await response.Content.ReadAsStreamAsync().ConfigureAwait(false), contentType);
        }
    }
}
