using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;
using NzbDrone.Core.MovieStats;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Studios;

namespace NzbDrone.Api.Test.v3.Studios
{
    [Parallelizable(ParallelScope.Self)]
    public class StudioControllerFixture : TestBase<StudioController>
    {
        private const string ForeignId = "studio-foreign-id";
        private Dictionary<string, FileInfo> _coverFileInfos;

        [SetUp]
        public void Setup()
        {
            var cache = Mocker.Resolve<ICacheManager>()
                .GetCache<StudioResource>(typeof(StudioResource), "studioResources");
            cache.Set(ForeignId, new StudioResource { Id = 1, ForeignId = ForeignId });

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByStudioForeignId(ForeignId))
                .Returns(new List<Movie>());
            Mocker.GetMock<IMovieStatisticsService>()
                .Setup(s => s.MovieStatistics(It.IsAny<List<int>>()))
                .Returns(new List<MovieStatistics>());

            _coverFileInfos = new Dictionary<string, FileInfo>();
            Mocker.GetMock<IMapCoversToLocal>()
                .Setup(s => s.GetMovieCoverFileInfos())
                .Returns(_coverFileInfos);
        }

        [Test]
        public void should_map_work_covers_to_local_urls()
        {
            var result = Subject.GetMoviesByStudioForeignId(ForeignId);

            result.Value.Should().BeEmpty();
            Mocker.GetMock<IMapCoversToLocal>()
                .Verify(
                    s => s.ConvertToLocalUrls(
                        It.Is<IEnumerable<Tuple<int, IEnumerable<MediaCover>>>>(items => !items.Any()),
                        _coverFileInfos),
                    Times.Once());
        }
    }
}
