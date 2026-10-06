using NzbDrone.Common.Messaging;

namespace NzbDrone.Core.Download
{
    // The decisions of an RSS sync or a search after the approved ones were grabbed or held as pending
    public class DownloadDecisionsProcessedEvent : IEvent
    {
        public ProcessedDecisions ProcessedDecisions { get; }

        public DownloadDecisionsProcessedEvent(ProcessedDecisions processedDecisions)
        {
            ProcessedDecisions = processedDecisions;
        }
    }
}
