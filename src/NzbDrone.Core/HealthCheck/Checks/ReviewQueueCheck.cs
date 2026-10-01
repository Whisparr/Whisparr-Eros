using System.Collections.Generic;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Localization;

namespace NzbDrone.Core.HealthCheck.Checks
{
    [CheckOn(typeof(ReviewQueueUpdatedEvent))]
    public class ReviewQueueCheck : HealthCheckBase
    {
        private readonly IReviewService _reviewService;

        public ReviewQueueCheck(IReviewService reviewService, ILocalizationService localizationService)
            : base(localizationService)
        {
            _reviewService = reviewService;
        }

        public override HealthCheck Check()
        {
            var count = _reviewService.PendingCount();

            if (count == 0)
            {
                return new HealthCheck(GetType());
            }

            var message = count == 1
                ? _localizationService.GetLocalizedString("ReviewQueueCheckSingleMessage")
                : _localizationService.GetLocalizedString("ReviewQueueCheckMultipleMessage", new Dictionary<string, object>
                {
                    { "count", count }
                });

            return new HealthCheck(GetType(), HealthCheckResult.Notice, HealthCheckReason.ReviewQueuePending, message, "#releases-awaiting-review");
        }
    }
}
