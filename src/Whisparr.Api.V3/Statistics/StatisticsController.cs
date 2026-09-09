using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Statistics;
using Whisparr.Http;

namespace Whisparr.Api.V3.Statistics
{
    [V3ApiController("statistics")]
    public class StatisticsController : Controller
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        [HttpGet]
        [Produces("application/json")]
        public StatisticsResource GetLibraryStatistics([FromQuery] StatisticsFilter filter)
        {
            return _statisticsService.GetLibraryStatistics(filter).MapToResource();
        }
    }
}
