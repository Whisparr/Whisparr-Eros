using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;
using NzbDrone.Core.MovieStats;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Movies;

namespace NzbDrone.Api.Test.v3.Movies
{
    [Parallelizable(ParallelScope.Self)]
    public class MovieControllerFixture : TestBase<MovieController>
    {
        private const string ForeignId = "019bfb1f-89a6-77c8-a5b2-856d3735a2b1";
        private Movie _movie;

        [SetUp]
        public void Setup()
        {
            _movie = new Movie
            {
                Id = 18,
                MovieMetadata = new MovieMetadata
                {
                    ForeignId = ForeignId,
                    Title = "Droned",
                    Images = new List<MediaCover>
                    {
                        new (MediaCoverTypes.Screenshot, "https://stashdb.org/images/0501cbc9-cc70-4e43-9114-11582c2e8b39")
                    }
                }
            };

            Mocker.GetMock<IMovieService>().Setup(s => s.GetMovie(18)).Returns(_movie);
            Mocker.GetMock<IMovieService>().Setup(s => s.FindByForeignId(ForeignId)).Returns(_movie);

            Mocker.GetMock<IMovieStatisticsService>()
                .Setup(s => s.MovieStatistics(It.IsAny<int>()))
                .Returns(new MovieStatistics { MovieId = 18, MovieFileCount = 1, SizeOnDisk = 1234 });
        }

        // GET /movie/{id:int} is the more specific route, so a numeric request never reaches
        // GetMovieById. It used to return the bare resource: no cover URLs, no statistics.
        [Test]
        public void should_map_covers_to_local_when_fetching_by_integer_id()
        {
            var resource = Subject.GetResourceByIdWithErrorHandler(18);

            resource.Value.Id.Should().Be(18);
            Mocker.GetMock<IMapCoversToLocal>()
                .Verify(s => s.ConvertToLocalUrls(18, It.IsAny<List<MediaCover>>()), Times.Once());
        }

        [Test]
        public void should_link_statistics_when_fetching_by_integer_id()
        {
            var resource = Subject.GetResourceByIdWithErrorHandler(18);

            resource.Value.Statistics.Should().NotBeNull();
            resource.Value.Statistics.MovieFileCount.Should().Be(1);
            resource.Value.Statistics.SizeOnDisk.Should().Be(1234);
        }

        [Test]
        public void should_map_covers_to_local_when_fetching_by_foreign_id()
        {
            var resource = Subject.GetMovieById(ForeignId);

            resource.Value.Id.Should().Be(18);
            Mocker.GetMock<IMapCoversToLocal>()
                .Verify(s => s.ConvertToLocalUrls(18, It.IsAny<List<MediaCover>>()), Times.Once());
        }

        [Test]
        public void should_link_statistics_when_fetching_by_foreign_id()
        {
            var resource = Subject.GetMovieById(ForeignId);

            resource.Value.Statistics.Should().NotBeNull();
            resource.Value.Statistics.MovieFileCount.Should().Be(1);
        }
    }
}
