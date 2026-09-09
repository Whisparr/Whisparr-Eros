using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Notifications;
using NzbDrone.Core.Notifications.Webhook;
using NzbDrone.Core.Tags;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.NotificationTests.WebhookTests
{
    [TestFixture]
    public class WebhookFixture : CoreTest<Webhook>
    {
        private WebhookPayload _payload;

        [SetUp]
        public void Setup()
        {
            Subject.Definition = new NotificationDefinition { Settings = new WebhookSettings() };

            Mocker.GetMock<IWebhookProxy>()
                .Setup(s => s.SendWebhook(It.IsAny<WebhookPayload>(), It.IsAny<WebhookSettings>()))
                .Callback<WebhookPayload, WebhookSettings>((payload, _) => _payload = payload);

            Mocker.GetMock<ITagRepository>()
                .Setup(s => s.GetTags(It.IsAny<HashSet<int>>()))
                .Returns(new List<Tag>());
        }

        private Movie GivenMovie(MovieMetadata metadata)
        {
            return new Movie
            {
                Id = 1,
                Path = @"C:\Test\Scene".AsOsAgnostic(),
                MovieMetadata = metadata,
                AddOptions = new AddMovieOptions()
            };
        }

        private WebhookMovie AddedMovie(Movie movie)
        {
            Subject.OnMovieAdded(movie);

            return ((WebhookAddedPayload)_payload).Movie;
        }

        [Test]
        public void should_map_scene_metadata_onto_the_payload()
        {
            var movie = GivenMovie(new MovieMetadata
            {
                Title = "Test Scene",
                ReleaseDateUtc = new DateTime(2024, 5, 6),
                StudioForeignId = "studio-1",
                StudioTitle = "Test Studio",
                TpdbId = "tpdb-1",
                Runtime = 42,
                Website = "https://example.com/test-scene",
                PerformerNames = new List<string> { "First Performer", "Second Performer" },
                Genres = new List<string> { "test-genre" },
                ItemType = ItemType.Scene
            });

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.FindByForeignId("studio-1"))
                .Returns(new Studio { ForeignId = "studio-1", Network = "Test Network" });

            var payloadMovie = AddedMovie(movie);

            payloadMovie.StudioTitle.Should().Be("Test Studio");
            payloadMovie.Network.Should().Be("Test Network");
            payloadMovie.Performers.Should().BeEquivalentTo("First Performer", "Second Performer");
            payloadMovie.Runtime.Should().Be(42);
            payloadMovie.Website.Should().Be("https://example.com/test-scene");
            payloadMovie.TpdbId.Should().Be("tpdb-1");
            payloadMovie.ReleaseDate.Should().Be("2024-05-06");
            payloadMovie.ItemType.Should().Be("Scene");
        }

        // A null release date used to dereference Nullable<DateTime>.Value and throw, taking down
        // every notification for the item rather than just omitting the date.
        [Test]
        public void should_send_a_null_release_date_when_the_item_has_none()
        {
            var movie = GivenMovie(new MovieMetadata { Title = "Undated", ReleaseDateUtc = null });

            var payloadMovie = AddedMovie(movie);

            payloadMovie.ReleaseDate.Should().BeNull();
        }

        [Test]
        public void should_not_look_up_a_studio_when_the_item_has_no_studio()
        {
            var movie = GivenMovie(new MovieMetadata { Title = "Studioless", StudioForeignId = null });

            var payloadMovie = AddedMovie(movie);

            payloadMovie.Network.Should().BeNull();

            Mocker.GetMock<IStudioService>()
                .Verify(s => s.FindByForeignId(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_send_a_null_network_when_the_studio_is_not_in_the_library()
        {
            var movie = GivenMovie(new MovieMetadata { Title = "Unlinked", StudioForeignId = "studio-1" });

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.FindByForeignId("studio-1"))
                .Returns((Studio)null);

            var payloadMovie = AddedMovie(movie);

            payloadMovie.Network.Should().BeNull();
        }

        [Test]
        public void should_send_local_and_remote_image_urls()
        {
            var movie = GivenMovie(new MovieMetadata
            {
                Title = "Imaged",
                Images = new List<MediaCover.MediaCover>
                {
                    new MediaCover.MediaCover(MediaCoverTypes.Poster, "https://cdn.example.com/poster.jpg")
                }
            });

            var payloadMovie = AddedMovie(movie);

            payloadMovie.Images.Should().HaveCount(1);
            payloadMovie.Images.Single().CoverType.Should().Be(MediaCoverTypes.Poster);
            payloadMovie.Images.Single().RemoteUrl.Should().Be("https://cdn.example.com/poster.jpg");
        }
    }
}
