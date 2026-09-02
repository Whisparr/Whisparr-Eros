using System.Collections.Generic;

namespace NzbDrone.Core.Statistics;

public class LibraryStatistics
{
    public int MovieCount { get; set; }
    public int MonitoredMovieCount { get; set; }
    public int DownloadedMovieCount { get; set; }
    public int MissingMovieCount { get; set; }
    public int UnreleasedMovieCount { get; set; }
    public int TbaMovieCount { get; set; }
    public int AnnouncedMovieCount { get; set; }
    public int InCinemasMovieCount { get; set; }
    public int ReleasedMovieCount { get; set; }
    public int DeletedMovieCount { get; set; }
    public int MovieItemCount { get; set; }
    public int SceneItemCount { get; set; }
    public int MovieFileCount { get; set; }
    public long SizeOnDisk { get; set; }
    public List<QualityProfileStatistics> QualityProfileStatistics { get; set; }
    public List<QualityStatistics> QualityStatistics { get; set; }
    public List<TagStatistics> TagStatistics { get; set; }
    public List<StudioStatistics> StudioStatistics { get; set; }
    public List<PerformerStatistics> PerformerStatistics { get; set; }
}
