using System.Collections.Generic;
using NzbDrone.Common.Messaging;

namespace NzbDrone.Core.Download.Review
{
    public class ReviewNeededEvent : IEvent
    {
        public List<ReviewItem> Items { get; private set; }

        public ReviewNeededEvent(List<ReviewItem> items)
        {
            Items = items;
        }
    }
}
