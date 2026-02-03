using System;
using System.Collections.Generic;
using NzbDrone.Core.Datastore.Events;
using Whisparr.Http.REST;

namespace Whisparr.Http
{
    public class ResourceChangeMessage<TResource>
        where TResource : RestResource
    {
        public TResource Resource { get; private set; }
        public IReadOnlyList<TResource> Resources { get; private set; }
        public ModelAction Action { get; private set; }

        public ResourceChangeMessage(ModelAction action)
        {
            if (action != ModelAction.Deleted && action != ModelAction.Sync)
            {
                throw new InvalidOperationException("Resource message without a resource needs to have Delete or Sync as action");
            }

            Action = action;
        }

        public ResourceChangeMessage(TResource resource, ModelAction action)
        {
            Resource = resource;
            Action = action;
        }

        public ResourceChangeMessage(IEnumerable<TResource> resources, ModelAction action)
        {
            if (resources == null)
            {
                throw new ArgumentNullException(nameof(resources));
            }

            Resources = new List<TResource>(resources);
            Action = action;
        }
    }
}
