using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Datastore.Events;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.SignalR;

namespace Whisparr.Http.REST
{
    public abstract class RestControllerWithSignalR<TResource, TModel> : RestController<TResource>, IHandle<ModelEvent<TModel>>
        where TResource : RestResource, new()
        where TModel : ModelBase, new()
    {
        private const int DefaultBatchChunkSize = 50;

        protected string Resource { get; }
        private readonly IBroadcastSignalRMessage _signalRBroadcaster;

        protected RestControllerWithSignalR(IBroadcastSignalRMessage signalRBroadcaster)
        {
            _signalRBroadcaster = signalRBroadcaster;

            var apiAttribute = GetType().GetCustomAttribute<VersionedApiControllerAttribute>();
            if (apiAttribute != null && apiAttribute.Resource != VersionedApiControllerAttribute.CONTROLLER_RESOURCE)
            {
                Resource = apiAttribute.Resource;
            }
            else
            {
                Resource = new TResource().ResourceName.Trim('/');
            }
        }

        [NonAction]
        public void Handle(ModelEvent<TModel> message)
        {
            if (!_signalRBroadcaster.IsConnected)
            {
                return;
            }

            if (message.Action == ModelAction.Deleted || message.Action == ModelAction.Sync)
            {
                BroadcastResourceChange(message.Action);
            }

            BroadcastResourceChange(message.Action, message.Model.Id);
        }

        protected void BroadcastResourceChange(ModelAction action, int id)
        {
            if (!_signalRBroadcaster.IsConnected)
            {
                return;
            }

            if (action == ModelAction.Deleted)
            {
                BroadcastResourceChange(action, new TResource { Id = id });
            }
            else
            {
                var resource = GetResourceById(id);
                BroadcastResourceChange(action, resource);
            }
        }

        protected void BroadcastResourceChange(ModelAction action, TResource resource)
        {
            if (!_signalRBroadcaster.IsConnected)
            {
                return;
            }

            if (GetType().Namespace.Contains("V3"))
            {
                var signalRMessage = new SignalRMessage
                {
                    Name = Resource,
                    Body = new ResourceChangeMessage<TResource>(resource, action),
                    Action = action
                };

                _signalRBroadcaster.BroadcastMessage(signalRMessage);
            }
        }

        // New: Batch broadcast method with chunking
        protected void BroadcastResourceChangeBatch(ModelAction action, IEnumerable<TResource> resources, int chunkSize = DefaultBatchChunkSize)
        {
            if (!_signalRBroadcaster.IsConnected)
            {
                return;
            }

            if (!GetType().Namespace.Contains("V3"))
            {
                return;
            }

            foreach (var chunk in Chunk(resources, chunkSize))
            {
                var signalRMessage = new SignalRMessage
                {
                    Name = Resource,
                    Body = new ResourceChangeMessage<TResource>(chunk.ToList(), action),
                    Action = action
                };
                _signalRBroadcaster.BroadcastMessage(signalRMessage);
            }
        }

        // Helper: Chunk an IEnumerable<T> into batches
        private static IEnumerable<IEnumerable<T>> Chunk<T>(IEnumerable<T> source, int size)
        {
            if (source == null)
            {
                yield break;
            }

            var enumerator = source.GetEnumerator();
            while (enumerator.MoveNext())
            {
                yield return YieldChunkElements(enumerator, size);
            }
        }

        private static IEnumerable<T> YieldChunkElements<T>(IEnumerator<T> source, int size)
        {
            var i = 0;
            do
            {
                yield return source.Current;
            }
            while (++i < size && source.MoveNext());
        }

        protected void BroadcastResourceChange(ModelAction action)
        {
            if (!_signalRBroadcaster.IsConnected)
            {
                return;
            }

            if (GetType().Namespace.Contains("V3"))
            {
                var signalRMessage = new SignalRMessage
                {
                    Name = Resource,
                    Body = new ResourceChangeMessage<TResource>(action),
                    Action = action
                };

                _signalRBroadcaster.BroadcastMessage(signalRMessage);
            }
        }
    }
}
