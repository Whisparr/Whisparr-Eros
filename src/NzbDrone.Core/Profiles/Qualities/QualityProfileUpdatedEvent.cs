using NzbDrone.Common.Messaging;

namespace NzbDrone.Core.Profiles.Qualities
{
    public class QualityProfileUpdatedEvent : IEvent
    {
        public QualityProfileUpdatedEvent(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }
}
