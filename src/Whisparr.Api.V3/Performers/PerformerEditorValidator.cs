using FluentValidation;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Validation;
using NzbDrone.Core.Validation.Paths;

namespace Whisparr.Api.V3.Performers
{
    public class PerformerEditorValidator : AbstractValidator<Performer>
    {
        public PerformerEditorValidator(RootFolderExistsValidator<Performer> rootFolderExistsValidator, QualityProfileExistsValidator<Performer> qualityProfileExistsValidator)
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
