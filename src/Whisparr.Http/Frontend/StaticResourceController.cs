using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using NLog;
using NzbDrone.Common.Extensions;
using Whisparr.Http.Extensions;
using Whisparr.Http.Frontend.Mappers;

namespace Whisparr.Http.Frontend
{
    // Kept out of the API document. Every action here serves the frontend through MapResource,
    // the SPA shell, its static assets and the login page, so none of it is API surface. Index
    // also carries two routes, and the empty one has no {path} slot, so the operation generated
    // for it declared a required path parameter nothing could resolve and no validator would
    // accept the document.
    [ApiExplorerSettings(IgnoreApi = true)]
    [Authorize(Policy="UI")]
    [ApiController]
    public class StaticResourceController : Controller
    {
        private readonly IEnumerable<IMapHttpRequestsToDisk> _requestMappers;
        private readonly Logger _logger;

        public StaticResourceController(IEnumerable<IMapHttpRequestsToDisk> requestMappers,
            Logger logger)
        {
            _requestMappers = requestMappers;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpGet("login")]
        public async Task<IActionResult> LoginPage()
        {
            return await MapResource("login");
        }

        [EnableCors("AllowGet")]
        [AllowAnonymous]
        [HttpGet("/content/{**path:regex(^(?!api/).*)}")]
        public async Task<IActionResult> IndexContent([FromRoute] string path)
        {
            return await MapResource("Content/" + path);
        }

        [HttpGet("")]
        [HttpGet("/{**path:regex(^(?!(api|feed|docs)/).*)}")]
        public async Task<IActionResult> Index([FromRoute] string path)
        {
            return await MapResource(path);
        }

        private async Task<IActionResult> MapResource(string path)
        {
            path = "/" + (path ?? "");

            var mapper = _requestMappers.SingleOrDefault(m => m.CanHandle(path));

            if (mapper != null)
            {
                var result = await mapper.GetResponse(path);

                if (result != null)
                {
                    if ((result as FileResult)?.ContentType == "text/html")
                    {
                        Response.Headers.DisableCache();
                    }

                    return result;
                }

                return NotFound();
            }

            _logger.Warn("Couldn't find handler for {0}", path.ForLog());

            return NotFound();
        }
    }
}
