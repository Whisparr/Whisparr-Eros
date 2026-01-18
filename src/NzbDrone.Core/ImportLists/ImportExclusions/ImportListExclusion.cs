using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.ImportLists.ImportExclusions
{
    public class ImportListExclusion : ModelBase
    {
        public ImportListExclusion()
        {
            Reason = ImportExclusionReason.Manual;
        }

        public string ForeignId { get; set; }
        public string MovieTitle { get; set; }
        public ImportExclusionType Type { get; set; }
        public ImportExclusionReason Reason { get; set; }

        public new string ToString()
        {
            return string.Format("Exclusion: [{0}-{1}] [{2}] [{3}]", Type, Reason, ForeignId, MovieTitle);
        }
    }
}
