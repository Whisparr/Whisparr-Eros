using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Statistics;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Statistics
{
    public class StatisticsResource : RestResource
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
        public List<QualityProfileStatisticsResource> QualityProfiles { get; set; }
        public List<QualityStatisticsResource> Qualities { get; set; }
        public List<TagStatisticsResource> Tags { get; set; }
        public List<StudioStatisticsResource> Studios { get; set; }
        public List<PerformerStatisticsResource> Performers { get; set; }
    }

    public static class StatisticsResourceMapper
    {
        public static StatisticsResource MapToResource(this LibraryStatistics model)
        {
            if (model == null)
            {
                return null;
            }

            return new StatisticsResource
            {
                MovieCount = model.MovieCount,
                MonitoredMovieCount = model.MonitoredMovieCount,
                DownloadedMovieCount = model.DownloadedMovieCount,
                MissingMovieCount = model.MissingMovieCount,
                UnreleasedMovieCount = model.UnreleasedMovieCount,
                TbaMovieCount = model.TbaMovieCount,
                AnnouncedMovieCount = model.AnnouncedMovieCount,
                InCinemasMovieCount = model.InCinemasMovieCount,
                ReleasedMovieCount = model.ReleasedMovieCount,
                DeletedMovieCount = model.DeletedMovieCount,
                MovieItemCount = model.MovieItemCount,
                SceneItemCount = model.SceneItemCount,
                MovieFileCount = model.MovieFileCount,
                SizeOnDisk = model.SizeOnDisk,
                QualityProfiles = model.QualityProfileStatistics?.Select(p => p.MapToResource()).ToList(),
                Qualities = model.QualityStatistics?.Select(q => q.MapToResource()).ToList(),
                Tags = model.TagStatistics?.Select(t => t.MapToResource()).ToList(),
                Studios = model.StudioStatistics?.Select(s => s.MapToResource()).ToList(),
                Performers = model.PerformerStatistics?.Select(p => p.MapToResource()).ToList()
            };
        }
    }
}
