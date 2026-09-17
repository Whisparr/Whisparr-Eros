using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace NzbDrone.Host.OpenApi
{
    /// <summary>
    /// Clears the document-level security requirement on actions marked [AllowAnonymous].
    /// An empty list is how OpenAPI spells "this operation takes no credentials". Without it the
    /// root requirement applies to everything and the document claims endpoints such as /ping and
    /// /login need an API key.
    /// </summary>
    public class AllowAnonymousOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var allowsAnonymous = context.ApiDescription.ActionDescriptor.EndpointMetadata
                .OfType<IAllowAnonymous>()
                .Any();

            if (allowsAnonymous)
            {
                operation.Security = new List<OpenApiSecurityRequirement>();
            }
        }
    }
}
