using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.Validation
{
    public class FolderValidator<T> : PropertyValidator<T, string>
    {
        public override string Name => "FolderValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Invalid Path: '{path}'";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            if (value == null)
            {
                return false;
            }

            context.MessageFormatter.AppendArgument("path", value);

            return value.IsPathValid(PathValidationType.CurrentOs);
        }
    }
}
