using System.Collections.Generic;
using NzbDrone.Common.Messaging;
namespace NzbDrone.Core.Movies.Studios.Events
{
    public class StudiosDeletedEvent : IEvent
    {
        public List<Studio> Studios { get; private set; }

        public StudiosDeletedEvent(List<Studio> studios)
        {
            Studios = studios;
        }
    }
}
