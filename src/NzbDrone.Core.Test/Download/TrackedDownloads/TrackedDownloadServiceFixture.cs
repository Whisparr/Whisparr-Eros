using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.History;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.History;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Download.TrackedDownloads
{
    [TestFixture]
    public class TrackedDownloadServiceFixture : CoreTest<TrackedDownloadService>
    {
        [SetUp]
        public void Setup()
        {
        }

        private void GivenDownloadHistory()
        {
            Mocker.GetMock<IHistoryService>()
                .Setup(s => s.FindByDownloadId(It.Is<string>(sr => sr == "35238")))
                .Returns(new List<MovieHistory>()
                {
                    new MovieHistory()
                    {
                        DownloadId = "35238",
                        SourceTitle = "TV Series S01",
                        MovieId = 3,
                    }
                });
        }

        [Test]
        public void should_track_downloads_using_the_source_title_if_it_cannot_be_found_using_the_download_title()
        {
            GivenDownloadHistory();

            var remoteMovie = new RemoteMovie
            {
                Movie = new Movie() { Id = 3 },

                ParsedMovieInfo = new ParsedMovieInfo()
                {
                    MovieTitles = new List<string> { "A Movie" },
                    Year = 1998
                }
            };

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.Is<ParsedMovieInfo>(i => i.PrimaryMovieTitle == "A Movie"), It.IsAny<string>(), It.IsAny<int>(), null))
                  .Returns(remoteMovie);

            var client = new DownloadClientDefinition()
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem()
            {
                Title = "A Movie 1998",
                DownloadId = "35238",
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = client.Name
                }
            };

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.Should().NotBeNull();
            trackedDownload.RemoteMovie.Should().NotBeNull();
            trackedDownload.RemoteMovie.Movie.Should().NotBeNull();
            trackedDownload.RemoteMovie.Movie.Id.Should().Be(3);
        }

        [Test]
        public void should_unmap_tracked_download_if_movie_deleted()
        {
            GivenDownloadHistory();

            var remoteMovie = new RemoteMovie
            {
                Movie = new Movie() { Id = 3 },

                ParsedMovieInfo = new ParsedMovieInfo()
                {
                    MovieTitles = { "A Movie" },
                    Year = 1998
                }
            };

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedMovieInfo>(), It.IsAny<string>(), It.IsAny<int>(), null))
                  .Returns(remoteMovie);

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<MovieHistory>());

            var client = new DownloadClientDefinition()
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem()
            {
                Title = "A Movie 1998",
                DownloadId = "12345",
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Id = 1,
                    Type = "Blackhole",
                    Name = "Blackhole Client",
                    Protocol = DownloadProtocol.Torrent
                }
            };

            Subject.TrackDownload(client, item);
            Subject.GetTrackedDownloads().Should().HaveCount(1);

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedMovieInfo>(), It.IsAny<string>(), It.IsAny<int>(), null))
                  .Returns(default(RemoteMovie));

            Subject.HandleAsync(new MoviesDeletedEvent(new List<Movie> { remoteMovie.Movie }, false, false));

            var trackedDownloads = Subject.GetTrackedDownloads();
            trackedDownloads.Should().HaveCount(1);
            trackedDownloads.First().RemoteMovie.Should().BeNull();
        }

        [Test]
        public void should_not_throw_when_processing_deleted_movie()
        {
            GivenDownloadHistory();

            var remoteMovie = new RemoteMovie
            {
                Movie = new Movie() { Id = 3 },

                ParsedMovieInfo = new ParsedMovieInfo()
                {
                    MovieTitles = { "A Movie" },
                    Year = 1998
                }
            };

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedMovieInfo>(), It.IsAny<string>(), It.IsAny<int>(), null))
                  .Returns(default(RemoteMovie));

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<MovieHistory>());

            var client = new DownloadClientDefinition()
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem()
            {
                Title = "A Movie 1998",
                DownloadId = "12345",
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Id = 1,
                    Type = "Blackhole",
                    Name = "Blackhole Client",
                    Protocol = DownloadProtocol.Torrent
                }
            };

            Subject.TrackDownload(client, item);
            Subject.GetTrackedDownloads().Should().HaveCount(1);

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedMovieInfo>(), It.IsAny<string>(), It.IsAny<int>(), null))
                  .Returns(default(RemoteMovie));

            Subject.HandleAsync(new MoviesDeletedEvent(new List<Movie> { remoteMovie.Movie }, false, false));

            var trackedDownloads = Subject.GetTrackedDownloads();
            trackedDownloads.Should().HaveCount(1);
            trackedDownloads.First().RemoteMovie.Should().BeNull();
        }

        [Test]
        public void should_map_to_the_imported_movie_when_the_download_was_already_imported()
        {
            // Parsing the client title on its own goes looking for a movie by name. Once we have
            // already imported this download we know which movie it was, so use that instead of
            // re-deriving it and risking a miss.
            GivenDownloadHistory();

            Mocker.GetMock<IDownloadHistoryService>()
                .Setup(s => s.GetLatestDownloadHistoryItem(It.IsAny<string>()))
                .Returns(new DownloadHistory
                {
                    DownloadId = "35238",
                    EventType = DownloadHistoryEventType.DownloadImported,
                    MovieId = 3
                });

            var remoteMovie = new RemoteMovie
            {
                Movie = new Movie { Id = 3 },
                ParsedMovieInfo = new ParsedMovieInfo
                {
                    MovieTitles = new List<string> { "A Movie" },
                    Year = 1998
                }
            };

            Mocker.GetMock<IParsingService>()
                .Setup(s => s.Map(It.IsAny<ParsedMovieInfo>(), 3))
                .Returns(remoteMovie);

            var trackedDownload = Subject.TrackDownload(GivenClient(), GivenItem("35238"));

            trackedDownload.RemoteMovie.Movie.Id.Should().Be(3);

            Mocker.GetMock<IParsingService>()
                .Verify(s => s.Map(It.IsAny<ParsedMovieInfo>(), 3), Times.Once());

            Mocker.GetMock<IParsingService>()
                .Verify(s => s.Map(It.IsAny<ParsedMovieInfo>(), It.IsAny<string>(), It.IsAny<int>(), null), Times.Never());
        }

        [Test]
        public void should_keep_tracking_the_item_when_the_movie_cannot_be_found()
        {
            // Returning null here dropped the item entirely, so a download that failed to parse
            // never appeared in the queue and there was nothing to tell the user why.
            Mocker.GetMock<IHistoryService>()
                .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                .Throws(new System.InvalidOperationException("boom"));

            var trackedDownload = Subject.TrackDownload(GivenClient(), GivenItem("12345"));

            trackedDownload.Should().NotBeNull();
            trackedDownload.Status.Should().Be(TrackedDownloadStatus.Warning);
            trackedDownload.StatusMessages.Should().ContainSingle(m => m.Messages.Contains("Unable to parse movie from title"));

            Subject.GetTrackedDownloads().Should().HaveCount(1);
        }

        [TestCase(TrackedDownloadState.Imported)]
        [TestCase(TrackedDownloadState.Failed)]
        [TestCase(TrackedDownloadState.Ignored)]
        public void should_stop_tracking_a_finished_download_that_is_grabbed_again(TrackedDownloadState state)
        {
            // Re-grabbing the same release is a fresh attempt. Keeping the old terminal state
            // around made the new download look already handled, so it never imported.
            GivenTrackedDownload("12345", state);

            Subject.Handle(new MovieGrabbedEvent(new RemoteMovie()) { DownloadId = "12345" });

            Subject.Find("12345").Should().BeNull();
        }

        [TestCase(TrackedDownloadState.Downloading)]
        [TestCase(TrackedDownloadState.ImportBlocked)]
        public void should_keep_tracking_an_unfinished_download_that_is_grabbed_again(TrackedDownloadState state)
        {
            GivenTrackedDownload("12345", state);

            Subject.Handle(new MovieGrabbedEvent(new RemoteMovie()) { DownloadId = "12345" });

            Subject.Find("12345").Should().NotBeNull();
        }

        [Test]
        public void should_ignore_a_grab_without_a_download_id()
        {
            GivenTrackedDownload("12345", TrackedDownloadState.Imported);

            Subject.Handle(new MovieGrabbedEvent(new RemoteMovie()) { DownloadId = null });

            Subject.Find("12345").Should().NotBeNull();
        }

        private void GivenTrackedDownload(string downloadId, TrackedDownloadState state)
        {
            Mocker.GetMock<IHistoryService>()
                .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                .Returns(new List<MovieHistory>());

            Subject.TrackDownload(GivenClient(), GivenItem(downloadId));
            Subject.Find(downloadId).State = state;
        }

        private static DownloadClientDefinition GivenClient()
        {
            return new DownloadClientDefinition
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };
        }

        private static DownloadClientItem GivenItem(string downloadId)
        {
            return new DownloadClientItem
            {
                Title = "A Movie 1998",
                DownloadId = downloadId,
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Id = 1,
                    Type = "Blackhole",
                    Name = "Blackhole Client",
                    Protocol = DownloadProtocol.Torrent
                }
            };
        }
    }
}
