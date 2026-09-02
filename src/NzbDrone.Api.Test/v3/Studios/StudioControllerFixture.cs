using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Movies.Studios.Events;
using NzbDrone.Core.MovieStats;
using NzbDrone.SignalR;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Studios;
using Whisparr.Http;

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
        public void should_return_a_linked_resource_from_update()
        {
            var studio = new Studio { Id = 1, ForeignId = ForeignId, Title = "Studio", SearchTitle = "Studio" };

            Mocker.GetMock<IStudioService>().Setup(s => s.GetById(1)).Returns(studio);
            Mocker.GetMock<IStudioService>().Setup(s => s.Update(It.IsAny<Studio>())).Returns(studio);
            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByStudioForeignId(ForeignId))
                .Returns(new List<Movie>
                {
                    new Movie
                    {
                        Id = 7,
                        MovieMetadata = new MovieMetadata { Year = 2024, ItemType = ItemType.Scene }
                    }
                });

            var response = Subject.Update(new StudioResource { Id = 1, ForeignId = ForeignId, Title = "Studio", SearchTitle = "Studio" });

            // Must be a mapped resource, not the raw model: the client replaces its cached
            // studio with this body, and the details page keys the works list off HasScenes.
            var resource = ((AcceptedAtActionResult)response.Result).Value.Should().BeOfType<StudioResource>().Subject;
            resource.HasScenes.Should().BeTrue();
            resource.Years.Should().BeEquivalentTo(new[] { 2024 });
        }

        [Test]
        public void should_link_movies_when_broadcasting_a_studio_update()
        {
            var studio = new Studio { Id = 1, ForeignId = ForeignId, Title = "Studio" };

            // The counts on the model are transient: the IHandleAsync side of the event
            // fills them in after this handler runs, so they are still zero here.
            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByStudioForeignId(ForeignId))
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

            Subject.Handle(new StudioUpdatedEvent(studio));

            broadcast.Should().NotBeNull();
            var resource = ((ResourceChangeMessage<StudioResource>)broadcast.Body).Resource;
            resource.HasScenes.Should().BeTrue();
            resource.HasMovies.Should().BeFalse();
            resource.TotalSceneCount.Should().Be(1);
            resource.Years.Should().BeEquivalentTo(new[] { 2024 });
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
