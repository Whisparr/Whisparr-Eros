using NzbDrone.Core.Statistics;

namespace Whisparr.Api.V3.Statistics
{
    public class PerformerStatisticsResource
    {
        public string PerformerForeignId { get; set; }
        public string Name { get; set; }
        public int MovieCount { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    public static class PerformerStatisticsResourceMapper
    {
        public static PerformerStatisticsResource MapToResource(this PerformerStatistics model)
        {
            return new PerformerStatisticsResource
            {
                PerformerForeignId = model.PerformerForeignId,
                Name = model.Name,
                MovieCount = model.MovieCount,
                MovieFileCount = model.MovieFileCount,
                SizeOnDisk = model.SizeOnDisk
            };
        }
    }
}
