using System.Collections.Generic;
using NzbDrone.Common.Messaging;

namespace NzbDrone.Core.Movies.Performers.Events
{
    public class PerformersDeletedEvent : IEvent
    {
        public List<Performer> Performers { get; private set; }

        public PerformersDeletedEvent(List<Performer> performers)
        {
            Performers = performers;
        }
    }
}
