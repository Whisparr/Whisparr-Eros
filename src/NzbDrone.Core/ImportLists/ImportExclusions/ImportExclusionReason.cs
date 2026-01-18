namespace NzbDrone.Core.ImportLists.ImportExclusions
{
    public enum ImportExclusionReason
    {
        Manual,
        Deleted,
        PerformerExclusion,
        StudioExcluded,
        StudioAfterDate,
        TagExclusion
    }
}
