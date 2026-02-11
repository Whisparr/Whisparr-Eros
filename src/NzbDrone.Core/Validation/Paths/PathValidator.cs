using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.Validation.Paths
{
    public static class PathValidation
    {
        public static IRuleBuilderOptions<T, string> IsValidPath<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.SetValidator(new PathValidator<T>());
        }
    }

    public class PathValidator<T> : PropertyValidator<T, string>
    {
        public override string Name => "PathValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Invalid Path: '{path}'";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            context.MessageFormatter.AppendArgument("path", value);

            return value != null && value.IsPathValid(PathValidationType.CurrentOs);
        }
    }
}
