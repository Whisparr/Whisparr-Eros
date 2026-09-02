namespace NzbDrone.Core.Statistics;

public class QualityProfileStatistics
{
    public int QualityProfileId { get; set; }
    public string Name { get; set; }
    public int MovieCount { get; set; }
    public int MovieFileCount { get; set; }
    public long SizeOnDisk { get; set; }
}
