using NzbDrone.Core.Statistics;

namespace Whisparr.Api.V3.Statistics
{
    public class QualityProfileStatisticsResource
    {
        public int QualityProfileId { get; set; }
        public string Name { get; set; }
        public int MovieCount { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    public static class QualityProfileStatisticsResourceMapper
    {
        public static QualityProfileStatisticsResource MapToResource(this QualityProfileStatistics model)
        {
            return new QualityProfileStatisticsResource
            {
                QualityProfileId = model.QualityProfileId,
                Name = model.Name,
                MovieCount = model.MovieCount,
                MovieFileCount = model.MovieFileCount,
                SizeOnDisk = model.SizeOnDisk
            };
        }
    }
}
