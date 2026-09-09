using System.Collections.Generic;
using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.IndexerSearch
{
    public class MissingMoviesSearchCommand : Command
    {
        public override bool SendUpdatesToClient => true;
        public string FilterKey { get; set; }
        public string FilterValue { get; set; }
        public List<int> MovieIds { get; set; } = new List<int>();
        public List<int> QualityProfileIds { get; set; } = new List<int>();
        public HashSet<int> MovieTags { get; set; } = new HashSet<int>();
    }
}
