namespace NzbDrone.Core.Statistics;

public class StudioStatistics
{
    public string StudioForeignId { get; set; }
    public string Title { get; set; }
    public int MovieCount { get; set; }
    public int MovieFileCount { get; set; }
    public long SizeOnDisk { get; set; }
}
