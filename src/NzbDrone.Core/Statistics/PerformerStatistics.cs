namespace NzbDrone.Core.Statistics;

public class PerformerStatistics
{
    public string PerformerForeignId { get; set; }
    public string Name { get; set; }
    public int MovieCount { get; set; }
    public int MovieFileCount { get; set; }
    public long SizeOnDisk { get; set; }
}
