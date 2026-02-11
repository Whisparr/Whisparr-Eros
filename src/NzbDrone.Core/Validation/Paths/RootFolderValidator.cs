using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.RootFolders;

namespace NzbDrone.Core.Validation.Paths
{
    public class RootFolderValidator<T> : PropertyValidator<T, string>
    {
        private readonly IRootFolderService _rootFolderService;

        public RootFolderValidator(IRootFolderService rootFolderService)
        {
            _rootFolderService = rootFolderService;
        }

        public override string Name => "RootFolderValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Path '{path}' is already configured as a root folder";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            context.MessageFormatter.AppendArgument("path", value);

            if (value == null)
            {
                return true;
            }

            return !_rootFolderService.All().Exists(r => r.Path.IsPathValid(PathValidationType.CurrentOs) && r.Path.PathEquals(value));
        }
    }
}
