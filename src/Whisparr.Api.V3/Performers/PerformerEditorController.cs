using System;
using System.Collections.Generic;
using System.Globalization;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Movies.Performers;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Performers
{
    [V3ApiController("performer/editor")]
    public class PerformerEditorController : Controller
    {
        private readonly IPerformerService _performerService;
        private readonly PerformerEditorValidator _performerEditorValidator;

        public PerformerEditorController(IPerformerService performerService, PerformerEditorValidator performerEditorValidator)
        {
            _performerService = performerService;
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
        [ProducesResponseType(typeof(List<PerformerResource>), StatusCodes.Status202Accepted)]
        public ActionResult<List<PerformerResource>> SaveAll([FromBody] PerformerEditorResource resource)
        {
            if (resource.PerformerIds == null || resource.PerformerIds.Count == 0)
            {
                throw new BadRequestException("performerIds must be provided");
            }

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
        public void DeletePerformers([FromBody] PerformerEditorResource resource)
        {
            if (resource.PerformerIds == null || resource.PerformerIds.Count == 0)
            {
                throw new BadRequestException("performerIds must be provided");
            }

            _performerService.DeletePerformers(resource.PerformerIds, resource.DeleteFiles, resource.AddImportExclusion);
        }
    }
}
