using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Core.Profiles.Qualities;

namespace NzbDrone.Core.Validation
{
    public class QualityProfileExistsValidator<T> : PropertyValidator<T, int>
    {
        private readonly IQualityProfileService _qualityProfileService;

        public QualityProfileExistsValidator(IQualityProfileService qualityProfileService)
        {
            _qualityProfileService = qualityProfileService;
        }

        public override string Name => "QualityProfileExistsValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Quality Profile does not exist";

        public override bool IsValid(ValidationContext<T> context, int value)
        {
            if (value == 0)
            {
                return true;
            }

            return _qualityProfileService.Exists(value);
        }
    }
}
