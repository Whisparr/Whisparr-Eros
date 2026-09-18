using System.Collections.Generic;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.ImportLists;
using NzbDrone.Core.Validation;
using NzbDrone.Core.Validation.Paths;
using NzbDrone.SignalR;
using Whisparr.Http;

namespace Whisparr.Api.V3.ImportLists
{
    [V3ApiController]
    public class ImportListController : ProviderControllerBase<ImportListResource, ImportListBulkResource, IImportList, ImportListDefinition>
    {
        // Overridden only to name the response. The base returns a list, and an attribute on a
        // generic method cannot say List<TProviderResource>.
        [ProducesResponseType(typeof(List<ImportListResource>), StatusCodes.Status202Accepted)]
        public override ActionResult<List<ImportListResource>> UpdateProvider([FromBody] ImportListBulkResource providerResource)
        {
            return base.UpdateProvider(providerResource);
        }

        public static readonly ImportListBulkResourceMapper BulkResourceMapper = new ();

        public ImportListController(IBroadcastSignalRMessage signalRBroadcaster,
            IImportListFactory importListFactory,
            RootFolderExistsValidator<ImportListResource> rootFolderExistsValidator,
            ImportListResourceMapper resourceMapper,
            QualityProfileExistsValidator<ImportListResource> qualityProfileExistsValidator)
            : base(signalRBroadcaster, importListFactory, "importlist", resourceMapper, BulkResourceMapper)
        {
            SharedValidator.RuleFor(c => c.RootFolderPath).Cascade(CascadeMode.Stop)
                .IsValidPath()
                .SetValidator(rootFolderExistsValidator);

            SharedValidator.RuleFor(c => c.QualityProfileId).Cascade(CascadeMode.Stop)
                .ValidId()
                .SetValidator(qualityProfileExistsValidator);
        }
    }
}
