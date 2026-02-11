using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.Validation
{
    public static class UrlValidation
    {
        public static IRuleBuilderOptions<T, string> IsValidUrl<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new UrlValidator<T>());
        }
    }

    public class UrlValidator<T> : PropertyValidator<T, string>
    {
        public override string Name => "UrlValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Invalid Url: '{url}'";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            if (value == null)
            {
                return false;
            }

            context.MessageFormatter.AppendArgument("url", value);

            return value.IsValidUrl();
        }
    }
}
