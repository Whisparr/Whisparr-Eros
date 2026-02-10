using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.Validation.Paths
{
    public class SystemFolderValidator<T> : PropertyValidator<T, string>
    {
        public override string Name => "SystemFolderValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Path '{path}' is {relationship} system folder {systemFolder}";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            var folder = value;
            context.MessageFormatter.AppendArgument("path", folder);

            foreach (var systemFolder in SystemFolders.GetSystemFolders())
            {
                context.MessageFormatter.AppendArgument("systemFolder", systemFolder);

                if (systemFolder.PathEquals(folder))
                {
                    context.MessageFormatter.AppendArgument("relationship", "set to");

                    return false;
                }

                if (systemFolder.IsParentPath(folder))
                {
                    context.MessageFormatter.AppendArgument("relationship", "child of");

                    return false;
                }
            }

            return true;
        }
    }
}
