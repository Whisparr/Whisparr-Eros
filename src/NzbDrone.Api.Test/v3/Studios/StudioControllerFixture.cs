using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
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
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.RootFolders;
using NzbDrone.SignalR;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Studios;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace NzbDrone.Api.Test.v3.Studios
{
    [Parallelizable(ParallelScope.Self)]
    public class StudioControllerFixture : TestBase<StudioController>
    {
        private const string ForeignId = "studio-foreign-id";
        private static readonly string RootFolder = @"C:\Movies".AsOsAgnostic();
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

        // The rules live in the controller's constructor and ValidateResource is only
        // reachable through the MVC pipeline, so read the validator back directly.
        private ResourceValidator<StudioResource> SharedValidator()
        {
            return (ResourceValidator<StudioResource>)typeof(RestController<StudioResource>)
                .GetProperty("SharedValidator", BindingFlags.Instance | BindingFlags.NonPublic)
                .GetValue(Subject);
        }

        private StudioResource GivenResource(int qualityProfileId = 1, string rootFolderPath = null)
        {
            return new StudioResource
            {
                Id = 1,
                ForeignId = ForeignId,
                QualityProfileId = qualityProfileId,
                RootFolderPath = rootFolderPath
            };
        }

        [Test]
        public void should_accept_an_existing_quality_profile_and_root_folder()
        {
            GivenProfileAndRootFolder();

            SharedValidator().Validate(GivenResource(rootFolderPath: RootFolder)).IsValid.Should().BeTrue();
        }

        [Test]
        public void should_reject_a_quality_profile_that_does_not_exist()
        {
            GivenProfileAndRootFolder();

            var result = SharedValidator().Validate(GivenResource(9999, RootFolder));

            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "QualityProfileId" && e.ErrorCode == "QualityProfileExistsValidator");
        }

        [Test]
        public void should_reject_a_root_folder_that_does_not_exist()
        {
            GivenProfileAndRootFolder();

            var result = SharedValidator().Validate(GivenResource(rootFolderPath: @"C:\Nonexistent\Bogus".AsOsAgnostic()));

            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "RootFolderPath" && e.ErrorCode == "RootFolderExistsValidator");
        }

        [Test]
        public void should_skip_the_root_folder_check_when_it_is_not_set()
        {
            GivenProfileAndRootFolder();

            SharedValidator().Validate(GivenResource()).IsValid.Should().BeTrue();
        }

        private void GivenProfileAndRootFolder()
        {
            Mocker.GetMock<IQualityProfileService>()
                .Setup(s => s.Exists(1))
                .Returns(true);

            Mocker.GetMock<IRootFolderService>()
                .Setup(s => s.All())
                .Returns(new List<RootFolder> { new RootFolder { Path = RootFolder } });
        }
    }
}
