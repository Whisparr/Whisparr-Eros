namespace NzbDrone.Core.ImportLists.ImportExclusions
{
    public enum ImportExclusionReason
    {
        Manual,
        DuringDelete,
        PerformerExclusion,
        StudioExclusion,
        StudioAfterDate,
        TagExclusion
    }
}
