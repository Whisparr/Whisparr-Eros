using System;

namespace NzbDrone.Core.Download.Review
{
    // A release on its way for a scene, so the other releases waiting for it aren't grabbed as well
    public class ReviewSceneGrab
    {
        public string Title { get; set; }

        // "grabbed" (just sent to the download client) or the download's tracked state ("downloading", "importblocked", ...)
        public string State { get; set; }
        public DateTime? Grabbed { get; set; }
    }
}
