using System.Collections.Generic;
using System.Reflection;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Performers.Events;
using NzbDrone.Core.MovieStats;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.RootFolders;
using NzbDrone.SignalR;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Performers;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace NzbDrone.Api.Test.v3.Performers
{
    [Parallelizable(ParallelScope.Self)]
    public class PerformerControllerFixture : TestBase<PerformerController>
    {
        private const string ForeignId = "performer-foreign-id";
        private static readonly string RootFolder = @"C:\Movies".AsOsAgnostic();

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
            var images = new List<MediaCover> { new (MediaCoverTypes.Screenshot, "https://stashdb.org/images/uuid") };

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.GetByPerformerForeignId(ForeignId))
                .Returns(new List<Movie> { new () { Id = 7, MovieMetadata = new MovieMetadata { Images = images } } });

            var result = Subject.GetMoviesByPerformerForeignId(ForeignId);

            result.Value.Should().HaveCount(1);
            Mocker.GetMock<IMapCoversToLocal>()
                .Verify(s => s.ConvertToLocalUrls(7, It.IsAny<List<MediaCover>>()), Times.Once());
        }

        [Test]
        public void should_not_map_covers_when_there_are_no_works()
        {
            var result = Subject.GetMoviesByPerformerForeignId(ForeignId);

            result.Value.Should().BeEmpty();
            Mocker.GetMock<IMapCoversToLocal>()
                .Verify(s => s.ConvertToLocalUrls(It.IsAny<int>(), It.IsAny<List<MediaCover>>()), Times.Never());
        }

        // The rules live in the controller's constructor and ValidateResource is only
        // reachable through the MVC pipeline, so read the validator back directly.
        private ResourceValidator<PerformerResource> SharedValidator()
        {
            return (ResourceValidator<PerformerResource>)typeof(RestController<PerformerResource>)
                .GetProperty("SharedValidator", BindingFlags.Instance | BindingFlags.NonPublic)
                .GetValue(Subject);
        }

        private PerformerResource GivenResource(int qualityProfileId = 1, string rootFolderPath = null)
        {
            return new PerformerResource
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
