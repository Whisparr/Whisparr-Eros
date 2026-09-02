using NzbDrone.Core.Statistics;

namespace Whisparr.Api.V3.Statistics
{
    public class StudioStatisticsResource
    {
        public string StudioForeignId { get; set; }
        public string Title { get; set; }
        public int MovieCount { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    public static class StudioStatisticsResourceMapper
    {
        public static StudioStatisticsResource MapToResource(this StudioStatistics model)
        {
            return new StudioStatisticsResource
            {
                StudioForeignId = model.StudioForeignId,
                Title = model.Title,
                MovieCount = model.MovieCount,
                MovieFileCount = model.MovieFileCount,
                SizeOnDisk = model.SizeOnDisk
            };
        }
    }
}
