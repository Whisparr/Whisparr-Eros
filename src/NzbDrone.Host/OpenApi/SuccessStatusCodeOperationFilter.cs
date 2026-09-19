using System.Reflection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using Whisparr.Http.REST.Attributes;

namespace NzbDrone.Host.OpenApi
{
    public class SuccessStatusCodeOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var statusCode = GetStatusCode(context.MethodInfo);

            if (statusCode == null || operation.Responses == null || !operation.Responses.Remove("200", out var response))
            {
                return;
            }

            var key = statusCode.Value.ToString();

            if (response is OpenApiResponse openApiResponse)
            {
                // An action documenting its own <response code="201"> already has an entry here, and
                // its description says more than the reason phrase would. Keep it and take only the
                // schema from the 200.
                openApiResponse.Description = operation.Responses.TryGetValue(key, out var documented) &&
                                              !string.IsNullOrWhiteSpace(documented.Description)
                    ? documented.Description
                    : ReasonPhrases.GetReasonPhrase(statusCode.Value);
            }

            operation.Responses[key] = response;
        }

        private static int? GetStatusCode(MethodInfo method)
        {
            if (method.GetCustomAttribute<RestPostByIdAttribute>(true) != null)
            {
                return StatusCodes.Status201Created;
            }

            if (method.GetCustomAttribute<RestPutByIdAttribute>(true) != null)
            {
                return StatusCodes.Status202Accepted;
            }

            return null;
        }
    }
}
