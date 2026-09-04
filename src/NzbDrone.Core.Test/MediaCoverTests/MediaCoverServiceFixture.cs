using System;
using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MediaCoverTests
{
    [TestFixture]
    public class MediaCoverServiceFixture : CoreTest<MediaCoverService>
    {
        private const string RemoteUrl = "https://stashdb.org/images/e9be2754-f9de-4db7-8cac-a64afd2a5126";

        private Movie _movie;

        [SetUp]
        public void Setup()
        {
            Mocker.SetConstant<IAppFolderInfo>(new AppFolderInfo(Mocker.Resolve<IStartupContext>()));

            _movie = Builder<Movie>.CreateNew()
                .With(v => v.Id = 2)
                .With(v => v.MovieMetadata.Value.Images = new List<MediaCover.MediaCover> { new MediaCover.MediaCover(MediaCoverTypes.Poster, "") })
                .Build();

            Mocker.GetMock<IMovieService>().Setup(m => m.GetMovie(It.Is<int>(id => id == _movie.Id))).Returns(_movie);
        }

        // The remote URL's hash, truncated the same way MediaCoverService truncates it.
        private static string ExpectedHash => RemoteUrl.SHA256Hash()[..20];

        private static List<MediaCover.MediaCover> GivenCovers(string remoteUrl = RemoteUrl)
        {
            return new List<MediaCover.MediaCover>
            {
                new () { CoverType = MediaCoverTypes.Banner, RemoteUrl = remoteUrl }
            };
        }

        [Test]
        public void should_convert_cover_urls_to_local()
        {
            var covers = GivenCovers();

            Subject.ConvertToLocalUrls(12, covers);

            covers.Single().Url.Should().Be($"/MediaCover/movie/12/banner.jpg?h={ExpectedHash}");
        }

        [Test]
        public void should_convert_performer_cover_urls_to_local()
        {
            var covers = GivenCovers();

            Subject.ConvertToLocalPerformerUrls(12, covers);

            covers.Single().Url.Should().Be($"/MediaCover/performer/12/banner.jpg?h={ExpectedHash}");
        }

        [Test]
        public void should_convert_studio_cover_urls_to_local()
        {
            var covers = GivenCovers();

            Subject.ConvertToLocalStudioUrls(12, covers);

            covers.Single().Url.Should().Be($"/MediaCover/studio/12/banner.jpg?h={ExpectedHash}");
        }

        [Test]
        public void should_convert_media_urls_to_local_without_a_hash_when_there_is_no_remote_url()
        {
            var covers = GivenCovers(null);

            Subject.ConvertToLocalUrls(12, covers);

            covers.Single().Url.Should().Be("/MediaCover/movie/12/banner.jpg");
        }

        [Test]
        public void should_not_touch_disk_to_build_movie_cover_urls()
        {
            Subject.ConvertToLocalUrls(12, GivenCovers());

            Mocker.GetMock<IDiskProvider>().Verify(v => v.GetFileInfo(It.IsAny<string>()), Times.Never());
            Mocker.GetMock<IDiskProvider>().Verify(v => v.FileGetLastWrite(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_not_create_the_studio_folder_while_building_urls()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FolderExists(It.IsAny<string>()))
                  .Returns(false);

            Subject.ConvertToLocalStudioUrls(12, GivenCovers());

            Mocker.GetMock<IDiskProvider>().Verify(v => v.CreateFolder(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_give_two_covers_of_the_same_type_distinct_urls()
        {
            var covers = new List<MediaCover.MediaCover>
            {
                new () { CoverType = MediaCoverTypes.Screenshot, RemoteUrl = "https://stashdb.org/images/bac219ec-204e-4d7c-8909-5f258d7ed218" },
                new () { CoverType = MediaCoverTypes.Screenshot, RemoteUrl = "https://stashdb.org/images/6b073398-6ffc-4690-8bfd-ae160ecc214e" }
            };

            Subject.ConvertToLocalUrls(12, covers);

            covers[0].Url.Should().NotBe(covers[1].Url);
        }

        [Test]
        public void should_change_the_url_when_the_remote_url_changes()
        {
            var before = GivenCovers();
            var after = GivenCovers("https://stashdb.org/images/6b073398-6ffc-4690-8bfd-ae160ecc214e");

            Subject.ConvertToLocalUrls(12, before);
            Subject.ConvertToLocalUrls(12, after);

            after.Single().Url.Should().NotBe(before.Single().Url);
        }

        [Test]
        public void should_resize_covers_if_main_downloaded()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(false);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Exactly(2));
        }

        [Test]
        public void should_resize_covers_if_missing()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(false);

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Exactly(2));
        }

        [Test]
        public void should_not_resize_covers_if_exists()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_resize_covers_if_existing_is_empty()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(0);

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Exactly(2));
        }

        [Test]
        public void should_log_error_if_resize_failed()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(false);

            Mocker.GetMock<IImageResizer>()
                  .Setup(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                  .Throws<ApplicationException>();

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Exactly(2));
        }
    }
}
