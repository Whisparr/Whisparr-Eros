using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.Validation.Paths
{
    public class StartupFolderValidator<T> : PropertyValidator<T, string>
    {
        private readonly IAppFolderInfo _appFolderInfo;

        public StartupFolderValidator(IAppFolderInfo appFolderInfo)
        {
            _appFolderInfo = appFolderInfo;
        }

        public override string Name => "StartupFolderValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Path '{path}' cannot be {relationship} the start up folder";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            if (value == null)
            {
                return true;
            }

            var startupFolder = _appFolderInfo.StartUpFolder;
            var folder = value;
            context.MessageFormatter.AppendArgument("path", folder);

            if (startupFolder.PathEquals(folder))
            {
                context.MessageFormatter.AppendArgument("relationship", "set to");

                return false;
            }

            if (startupFolder.IsParentPath(folder))
            {
                context.MessageFormatter.AppendArgument("relationship", "child of");

                return false;
            }

            return true;
        }
    }
}
