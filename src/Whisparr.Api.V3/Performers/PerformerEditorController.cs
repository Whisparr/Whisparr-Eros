using System;
using System.Collections.Generic;
using System.Globalization;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Movies.Performers;
using Whisparr.Http;

namespace Whisparr.Api.V3.Performers
{
    [V3ApiController("performer/editor")]
    public class PerformerEditorController : Controller
    {
        private readonly IPerformerService _performerService;
        private readonly IManageCommandQueue _commandQueueManager;
        private readonly IUpgradableSpecification _upgradableSpecification;
        private readonly PerformerEditorValidator _performerEditorValidator;

        public PerformerEditorController(IPerformerService performerService, IManageCommandQueue commandQueueManager, IUpgradableSpecification upgradableSpecification, PerformerEditorValidator performerEditorValidator)
        {
            _performerService = performerService;
            _commandQueueManager = commandQueueManager;
            _upgradableSpecification = upgradableSpecification;
            _performerEditorValidator = performerEditorValidator;
        }

        /// <summary>
        /// Edits multiple performers
        /// </summary>
        /// <param name="resource"></param>
        /// <returns>PerformerEditorResource containing as-edited values</returns>
        [HttpPut]
        [Consumes("application/json")]
        [Produces("application/json")]
        public IActionResult SaveAll([FromBody] PerformerEditorResource resource)
        {
            var performersToUpdate = _performerService.GetPerformers(resource.PerformerIds);

            // A bulk date has three states the wire can't express with a plain DateTime?:
            // absent leaves each performer's own date alone, empty clears it, and anything
            // else has to parse here rather than silently clearing every selected performer.
            DateTime? afterDate = null;

            if (resource.AfterDate.IsNotNullOrWhiteSpace())
            {
                if (!DateTime.TryParse(resource.AfterDate, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal, out var parsedAfterDate))
                {
                    throw new ValidationException(new[] { new ValidationFailure(nameof(resource.AfterDate), $"Invalid after date: {resource.AfterDate}") });
                }

                afterDate = parsedAfterDate;
            }

            foreach (var performer in performersToUpdate)
            {
                if (resource.Monitored.HasValue)
                {
                    performer.Monitored = resource.Monitored.Value;
                }

                if (resource.MoviesMonitored.HasValue)
                {
                    performer.MoviesMonitored = resource.MoviesMonitored.Value;
                }

                if (resource.QualityProfileId.HasValue)
                {
                    performer.QualityProfileId = resource.QualityProfileId.Value;
                }

                if (resource.RootFolderPath.IsNotNullOrWhiteSpace())
                {
                    performer.RootFolderPath = resource.RootFolderPath;
                }

                if (resource.SearchOnAdd.HasValue)
                {
                    performer.SearchOnAdd = resource.SearchOnAdd.Value;
                }

                if (resource.AfterDate != null)
                {
                    performer.AfterDate = afterDate;
                }

                if (resource.Tags != null)
                {
                    var newTags = resource.Tags;
                    var applyTags = resource.ApplyTags;

                    switch (applyTags)
                    {
                        case ApplyTags.Add:
                            newTags.ForEach(t => performer.Tags.Add(t));
                            break;
                        case ApplyTags.Remove:
                            newTags.ForEach(t => performer.Tags.Remove(t));
                            break;
                        case ApplyTags.Replace:
                            performer.Tags = new HashSet<int>(newTags);
                            break;
                    }
                }

                var validationResult = _performerEditorValidator.Validate(performer);

                if (!validationResult.IsValid)
                {
                    throw new ValidationException(validationResult.Errors);
                }
            }

            return Accepted(_performerService.Update(performersToUpdate).ToResource());
        }

        [HttpDelete]
        public object DeletePerformers([FromBody] PerformerEditorResource resource)
        {
            _performerService.DeletePerformers(resource.PerformerIds, resource.DeleteFiles, resource.AddImportExclusion);

            return new { };
        }
    }
}
