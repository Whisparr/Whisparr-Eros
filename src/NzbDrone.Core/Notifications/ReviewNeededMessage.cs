using System.Collections.Generic;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Qualities;

namespace NzbDrone.Core.Notifications
{
    public class ReviewNeededMessage
    {
        public string Message { get; set; }
        public List<ReviewNeededRelease> Releases { get; set; }

        public override string ToString()
        {
            return Message;
        }
    }

    public class ReviewNeededRelease
    {
        public int ReviewItemId { get; set; }
        public string Title { get; set; }
        public string Indexer { get; set; }
        public long Size { get; set; }
        public QualityModel Quality { get; set; }
        public string Reason { get; set; }

        // The scenes the release may belong to, the one it was evaluated against first
        public List<Movie> Movies { get; set; }
    }
}
