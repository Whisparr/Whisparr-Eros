using System.Linq;

using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Whisparr.Http.Middleware
{
    /// <summary>
    /// Middleware to convert 401+Location responses to 302 for browser (text/html) requests.
    /// This ensures browsers are redirected to login instead of receiving a 401 with a Location header.
    /// </summary>
    public class BrowserRedirectMiddleware
    {
        private readonly RequestDelegate _next;

        public BrowserRedirectMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            await _next(context);

            if (context.Response.StatusCode == 401 &&
                context.Response.Headers.ContainsKey("Location") &&
                context.Request.Headers["Accept"].Any(a => a.Contains("text/html")))
            {
                context.Response.StatusCode = 302;
            }
        }
    }

    public static class BrowserRedirectMiddlewareExtensions
    {
        public static IApplicationBuilder UseBrowserRedirect(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<BrowserRedirectMiddleware>();
        }
    }
}
