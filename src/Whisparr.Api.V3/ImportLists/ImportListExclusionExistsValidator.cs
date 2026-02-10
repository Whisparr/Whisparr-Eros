using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Core.ImportLists.ImportExclusions;

namespace Whisparr.Api.V3.ImportLists
{
    public class ImportListExclusionExistsValidator : PropertyValidator<ImportListExclusionResource, string>
    {
        private readonly IImportListExclusionService _importListExclusionService;

        public ImportListExclusionExistsValidator(IImportListExclusionService importListExclusionService)
        {
            _importListExclusionService = importListExclusionService;
        }

        public override string Name => "ImportListExclusionExistsValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "This exclusion has already been added.";

        public override bool IsValid(ValidationContext<ImportListExclusionResource> context, string value)
        {
            if (value == null)
            {
                return true;
            }

            if (context.InstanceToValidate is not ImportListExclusionResource listExclusionResource)
            {
                return true;
            }

            return !_importListExclusionService.GetAllExclusions().Exists(v => v.ForeignId == value && v.Id != listExclusionResource.Id);
        }
    }
}
