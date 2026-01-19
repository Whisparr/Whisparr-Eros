using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Whisparr.Http.Middleware
{
    public class BrowserRedirectMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<BrowserRedirectMiddleware> _logger;

        public BrowserRedirectMiddleware(RequestDelegate next, ILogger<BrowserRedirectMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only act on browser requests (Accept: text/html), not /api or /signalr
            var path = context.Request.Path.Value ?? string.Empty;
            if (path.StartsWith("/api", StringComparison.OrdinalIgnoreCase) ||
                path.StartsWith("/signalr", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            // Buffer the response
            var originalBody = context.Response.Body;
            using (var memStream = new System.IO.MemoryStream())
            {
                context.Response.Body = memStream;
                await _next(context);
                memStream.Position = 0;

                // Check if we should redirect
                var isBrowser = context.Request.Headers["Accept"].ToString().Contains("text/html", StringComparison.OrdinalIgnoreCase);
                var is401 = context.Response.StatusCode == StatusCodes.Status401Unauthorized;
                var hasLocation = context.Response.Headers.ContainsKey("Location");

                if (isBrowser && is401 && hasLocation)
                {
                    var location = context.Response.Headers["Location"].ToString();
                    _logger.LogDebug("BrowserRedirectMiddleware: Converting 401+Location to 302 for {Path} -> {Location}", path, location);
                    context.Response.Clear();
                    context.Response.StatusCode = StatusCodes.Status302Found;
                    context.Response.Headers["Location"] = location;
                }
                else
                {
                    memStream.Position = 0;
                    await memStream.CopyToAsync(originalBody);
                }

                context.Response.Body = originalBody;
            }
        }
    }

    public static class BrowserRedirectMiddlewareExtensions
    {
        public static Microsoft.AspNetCore.Builder.IApplicationBuilder UseBrowserRedirect(this Microsoft.AspNetCore.Builder.IApplicationBuilder builder)
        {
            return builder.UseMiddleware<BrowserRedirectMiddleware>();
        }
    }
}
