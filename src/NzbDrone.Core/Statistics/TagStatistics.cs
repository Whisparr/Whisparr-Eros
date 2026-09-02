namespace NzbDrone.Core.Statistics;

public class TagStatistics
{
    public int TagId { get; set; }
    public string Label { get; set; }
    public int MovieCount { get; set; }
    public int MovieFileCount { get; set; }
    public long SizeOnDisk { get; set; }
}
