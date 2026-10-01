using System.Collections.Generic;

namespace NzbDrone.Core.Notifications.Webhook
{
    public class WebhookReviewNeededPayload : WebhookPayload
    {
        public string Message { get; set; }
        public List<WebhookReviewRelease> Releases { get; set; }
    }

    public class WebhookReviewRelease
    {
        public int ReviewItemId { get; set; }
        public string ReleaseTitle { get; set; }
        public string Indexer { get; set; }
        public long Size { get; set; }
        public string Quality { get; set; }
        public string Reason { get; set; }
        public List<WebhookMovie> Movies { get; set; }
    }
}
