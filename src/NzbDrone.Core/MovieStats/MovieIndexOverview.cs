namespace NzbDrone.Core.MovieStats
{
    public class MovieIndexOverview
    {
        public int TotalCount { get; set; }
        public int MonitoredCount { get; set; }
        public int MovieFiles { get; set; }
        public long TotalFileSize { get; set; }
    }
}
