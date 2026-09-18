using System.Collections.Generic;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Validation;
using NzbDrone.SignalR;
using Whisparr.Http;

namespace Whisparr.Api.V3.Indexers
{
    [V3ApiController]
    public class IndexerController : ProviderControllerBase<IndexerResource, IndexerBulkResource, IIndexer, IndexerDefinition>
    {
        // Overridden only to name the response. The base returns a list, and an attribute on a
        // generic method cannot say List<TProviderResource>.
        [ProducesResponseType(typeof(List<IndexerResource>), StatusCodes.Status202Accepted)]
        public override ActionResult<List<IndexerResource>> UpdateProvider([FromBody] IndexerBulkResource providerResource)
        {
            return base.UpdateProvider(providerResource);
        }

        public static readonly IndexerResourceMapper ResourceMapper = new ();
        public static readonly IndexerBulkResourceMapper BulkResourceMapper = new ();

        public IndexerController(IBroadcastSignalRMessage signalRBroadcaster,
            IndexerFactory indexerFactory,
            DownloadClientExistsValidator<IndexerResource> downloadClientExistsValidator)
            : base(signalRBroadcaster, indexerFactory, "indexer", ResourceMapper, BulkResourceMapper)
        {
            SharedValidator.RuleFor(c => c.Priority).InclusiveBetween(1, 50);
            SharedValidator.RuleFor(c => c.DownloadClientId).SetValidator(downloadClientExistsValidator);
        }
    }
}
