using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Disk;

namespace NzbDrone.Core.Validation.Paths
{
    public class PathExistsValidator<T> : PropertyValidator<T, string>
    {
        private readonly IDiskProvider _diskProvider;

        public PathExistsValidator(IDiskProvider diskProvider)
        {
            _diskProvider = diskProvider;
        }

        public override string Name => "PathExistsValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Path '{path}' does not exist";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            if (value == null)
            {
                return false;
            }

            context.MessageFormatter.AppendArgument("path", value);

            return _diskProvider.FolderExists(value);
        }
    }
}
