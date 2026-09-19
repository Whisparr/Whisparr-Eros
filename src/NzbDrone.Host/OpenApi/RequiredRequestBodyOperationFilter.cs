using System.Linq;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace NzbDrone.Host.OpenApi
{
    // Every [FromBody] parameter here is mandatory: none is nullable and none has a default, so a
    // request without a body is rejected with a 400 before the action runs. ApiExplorer still
    // reports the body as optional because nullable reference types are off, which left the
    // document telling a client the body could be omitted.
    public class RequiredRequestBodyOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            if (operation.RequestBody is not OpenApiRequestBody requestBody)
            {
                return;
            }

            var hasBodyParameter = context.ApiDescription.ParameterDescriptions
                .Any(p => p.Source == BindingSource.Body);

            if (hasBodyParameter)
            {
                requestBody.Required = true;
            }
        }
    }
}
