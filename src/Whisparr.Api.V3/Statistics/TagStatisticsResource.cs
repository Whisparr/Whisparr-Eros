using NzbDrone.Core.Statistics;

namespace Whisparr.Api.V3.Statistics
{
    public class TagStatisticsResource
    {
        public int TagId { get; set; }
        public string Label { get; set; }
        public int MovieCount { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    public static class TagStatisticsResourceMapper
    {
        public static TagStatisticsResource MapToResource(this TagStatistics model)
        {
            return new TagStatisticsResource
            {
                TagId = model.TagId,
                Label = model.Label,
                MovieCount = model.MovieCount,
                MovieFileCount = model.MovieFileCount,
                SizeOnDisk = model.SizeOnDisk
            };
        }
    }
}
