namespace NzbDrone.Core.Profiles.Qualities
{
    // What the delete guard checks, counted rather than answered yes/no, so the client can
    // say which of them is holding the profile instead of only that something is.
    public class QualityProfileInUse
    {
        public int MovieCount { get; set; }
        public int PerformerCount { get; set; }
        public int StudioCount { get; set; }
        public int ImportListCount { get; set; }
        public bool IsFallback { get; set; }

        public bool IsInUse => MovieCount > 0 ||
                               PerformerCount > 0 ||
                               StudioCount > 0 ||
                               ImportListCount > 0 ||
                               IsFallback;
    }
}
