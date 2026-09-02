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
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Performers.Events;
using NzbDrone.Core.MovieStats;
using NzbDrone.SignalR;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Performers;
using Whisparr.Http;

namespace NzbDrone.Api.Test.v3.Performers
{
    [Parallelizable(ParallelScope.Self)]
    public class PerformerControllerFixture : TestBase<PerformerController>
    {
        private const string ForeignId = "performer-foreign-id";
        private Dictionary<string, FileInfo> _coverFileInfos;

        [SetUp]
        public void Setup()
        {
            var cache = Mocker.Resolve<ICacheManager>()
                .GetCache<PerformerResource>(typeof(PerformerResource), "performerResources");
            cache.Set(ForeignId, new PerformerResource { Id = 1, ForeignId = ForeignId });

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByPerformerForeignId(ForeignId))
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
        public void should_link_movies_when_broadcasting_a_performer_update()
        {
            var performer = new Performer { Id = 1, ForeignId = ForeignId, Name = "Performer" };

            // PerformerService populates these on its own handler for the same event, but
            // the handlers are unordered, so the model can still be zeroed here.
            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByPerformerForeignId(ForeignId))
                .Returns(new List<Movie>
                {
                    new Movie
                    {
                        Id = 7,
                        MovieMetadata = new MovieMetadata { Year = 2024, ItemType = ItemType.Scene }
                    }
                });

            SignalRMessage broadcast = null;
            Mocker.GetMock<IBroadcastSignalRMessage>()
                .Setup(s => s.IsConnected)
                .Returns(true);
            Mocker.GetMock<IBroadcastSignalRMessage>()
                .Setup(s => s.BroadcastMessage(It.IsAny<SignalRMessage>()))
                .Callback<SignalRMessage>(m => broadcast = m);

            Subject.Handle(new PerformerUpdatedEvent(performer));

            broadcast.Should().NotBeNull();
            var resource = ((ResourceChangeMessage<PerformerResource>)broadcast.Body).Resource;
            resource.TotalSceneCount.Should().Be(1);
            resource.TotalMovieCount.Should().Be(0);
        }

        [Test]
        public void should_map_work_covers_to_local_urls()
        {
            var result = Subject.GetMoviesByPerformerForeignId(ForeignId);

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
