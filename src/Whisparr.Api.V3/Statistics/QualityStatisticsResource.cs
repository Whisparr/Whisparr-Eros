using NzbDrone.Core.Qualities;
using NzbDrone.Core.Statistics;

namespace Whisparr.Api.V3.Statistics
{
    public class QualityStatisticsResource
    {
        // Exposed as the Core type, matching QualityDefinitionResource.
        public Quality Quality { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    public static class QualityStatisticsResourceMapper
    {
        public static QualityStatisticsResource MapToResource(this QualityStatistics model)
        {
            return new QualityStatisticsResource
            {
                Quality = model.Quality,
                MovieFileCount = model.MovieFileCount,
                SizeOnDisk = model.SizeOnDisk
            };
        }
    }
}
