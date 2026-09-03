using System.Collections.Generic;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Movies.Studios;
using Whisparr.Http;

namespace Whisparr.Api.V3.Studios
{
    [V3ApiController("studio/editor")]
    public class StudioEditorController : Controller
    {
        private readonly IStudioService _studioService;
        private readonly IManageCommandQueue _commandQueueManager;
        private readonly IUpgradableSpecification _upgradableSpecification;
        private readonly StudioEditorValidator _studioEditorValidator;

        public StudioEditorController(IStudioService studioService, IManageCommandQueue commandQueueManager, IUpgradableSpecification upgradableSpecification, StudioEditorValidator studioEditorValidator)
        {
            _studioService = studioService;
            _commandQueueManager = commandQueueManager;
            _upgradableSpecification = upgradableSpecification;
            _studioEditorValidator = studioEditorValidator;
        }

        /// <summary>
        /// Edits multiple studios
        /// </summary>
        /// <param name="resource"></param>
        /// <returns>StudioEditorResource containing as-edited values</returns>
        [HttpPut]
        [Consumes("application/json")]
        [Produces("application/json")]
        public IActionResult SaveAll([FromBody] StudioEditorResource resource)
        {
            var studiosToUpdate = _studioService.GetStudios(resource.StudioIds);

            foreach (var studios in studiosToUpdate)
            {
                if (resource.Monitored.HasValue)
                {
                    studios.Monitored = resource.Monitored.Value;
                }

                if (resource.QualityProfileId.HasValue)
                {
                    studios.QualityProfileId = resource.QualityProfileId.Value;
                }

                if (resource.RootFolderPath.IsNotNullOrWhiteSpace())
                {
                    studios.RootFolderPath = resource.RootFolderPath;
                }

                if (resource.SearchOnAdd.HasValue)
                {
                    studios.SearchOnAdd = resource.SearchOnAdd.Value;
                }

                if (resource.Tags != null)
                {
                    var newTags = resource.Tags;
                    var applyTags = resource.ApplyTags;

                    switch (applyTags)
                    {
                        case ApplyTags.Add:
                            newTags.ForEach(t => studios.Tags.Add(t));
                            break;
                        case ApplyTags.Remove:
                            newTags.ForEach(t => studios.Tags.Remove(t));
                            break;
                        case ApplyTags.Replace:
                            studios.Tags = new HashSet<int>(newTags);
                            break;
                    }
                }

                var validationResult = _studioEditorValidator.Validate(studios);

                if (!validationResult.IsValid)
                {
                    throw new ValidationException(validationResult.Errors);
                }
            }

            return Accepted(_studioService.Update(studiosToUpdate).ToResource());
        }
    }
}
