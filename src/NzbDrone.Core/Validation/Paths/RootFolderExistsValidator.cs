using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.RootFolders;

namespace NzbDrone.Core.Validation.Paths
{
    public class RootFolderExistsValidator<T> : PropertyValidator<T, string>
    {
        private readonly IRootFolderService _rootFolderService;

        public RootFolderExistsValidator(IRootFolderService rootFolderService)
        {
            _rootFolderService = rootFolderService;
        }

        public override string Name => "RootFolderExistsValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Root folder '{path}' does not exist";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            context.MessageFormatter.AppendArgument("path", value);

            return value == null || _rootFolderService.All().Exists(r => r.Path.IsPathValid(PathValidationType.CurrentOs) && r.Path.PathEquals(value));
        }
    }
}
