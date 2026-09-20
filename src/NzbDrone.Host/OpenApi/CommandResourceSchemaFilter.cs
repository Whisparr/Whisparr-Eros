using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using Whisparr.Api.V3.Commands;

namespace NzbDrone.Host.OpenApi
{
    /// <summary>
    /// Allows a command body to carry the arguments of the command being sent.
    /// CommandController reads the request body a second time and deserialises it into the
    /// concrete command type, so a command's own arguments travel at the top level alongside the
    /// CommandResource fields. Swashbuckle closes every object schema with
    /// additionalProperties: false, which forbids exactly those, leaving a document that no
    /// conforming client can use to send a command that takes arguments.
    /// </summary>
    public class CommandResourceSchemaFilter : ISchemaFilter
    {
        public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(CommandResource) && schema is OpenApiSchema concrete)
            {
                concrete.AdditionalPropertiesAllowed = true;
                concrete.AdditionalProperties = null;
            }
        }
    }
}
