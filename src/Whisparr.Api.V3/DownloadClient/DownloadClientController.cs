using System.Collections.Generic;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Download;
using NzbDrone.SignalR;
using Whisparr.Http;

namespace Whisparr.Api.V3.DownloadClient
{
    [V3ApiController]
    public class DownloadClientController : ProviderControllerBase<DownloadClientResource, DownloadClientBulkResource, IDownloadClient, DownloadClientDefinition>
    {
        public static readonly DownloadClientResourceMapper ResourceMapper = new ();
        public static readonly DownloadClientBulkResourceMapper BulkResourceMapper = new ();

        public DownloadClientController(IBroadcastSignalRMessage signalRBroadcaster, IDownloadClientFactory downloadClientFactory)
            : base(signalRBroadcaster, downloadClientFactory, "downloadclient", ResourceMapper, BulkResourceMapper)
        {
            SharedValidator.RuleFor(c => c.Priority).InclusiveBetween(1, 50);
        }

        // Overridden only to name the response. The base returns a list, and an attribute on a
        // generic method cannot say List<TProviderResource>.
        [ProducesResponseType(typeof(List<DownloadClientResource>), StatusCodes.Status202Accepted)]
        public override ActionResult<List<DownloadClientResource>> UpdateProvider([FromBody] DownloadClientBulkResource providerResource)
        {
            return base.UpdateProvider(providerResource);
        }
    }
}
