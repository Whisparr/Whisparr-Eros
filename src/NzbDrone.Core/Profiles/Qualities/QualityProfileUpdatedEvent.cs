using NzbDrone.Common.Messaging;

namespace NzbDrone.Core.Profiles.Qualities
{
    public class QualityProfileUpdatedEvent : IEvent
    {
        public int Id { get; private set; }

        public QualityProfileUpdatedEvent(int id)
        {
            Id = id;
        }
    }
}
