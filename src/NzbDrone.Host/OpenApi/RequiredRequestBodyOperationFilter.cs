using System.Linq;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace NzbDrone.Host.OpenApi
{
    // Every [FromBody] parameter here is mandatory, but ApiExplorer reports the body as optional
    // because nullable reference types are off and it cannot tell.
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
