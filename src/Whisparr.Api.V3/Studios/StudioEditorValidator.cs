using FluentValidation;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Validation;
using NzbDrone.Core.Validation.Paths;

namespace Whisparr.Api.V3.Studios
{
    public class StudioEditorValidator : AbstractValidator<Studio>
    {
        public StudioEditorValidator(RootFolderExistsValidator<Studio> rootFolderExistsValidator, QualityProfileExistsValidator<Studio> qualityProfileExistsValidator)
        {
            RuleFor(s => s.RootFolderPath).Cascade(CascadeMode.Stop)
                .IsValidPath()
                .SetValidator(rootFolderExistsValidator)
                .When(s => s.RootFolderPath.IsNotNullOrWhiteSpace());

            RuleFor(s => s.QualityProfileId).Cascade(CascadeMode.Stop)
                .ValidId()
                .SetValidator(qualityProfileExistsValidator);
        }
    }
}
