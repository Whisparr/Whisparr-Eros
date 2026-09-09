using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.History;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.MovieImport;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.Download.CompletedDownloadServiceTests
{
    [TestFixture]
    public class ProcessFixture : CoreTest<CompletedDownloadService>
    {
        private TrackedDownload _trackedDownload;

        [SetUp]
        public void Setup()
        {
            var completed = Builder<DownloadClientItem>.CreateNew()
                                                    .With(h => h.Status = DownloadItemStatus.Completed)
                                                    .With(h => h.OutputPath = new OsPath(@"C:\DropFolder\MyDownload".AsOsAgnostic()))
                                                    .With(h => h.Title = "Drone.S01E01.HDTV")
                                                    .Build();

            var remoteMovie = BuildRemoteMovie();

            _trackedDownload = Builder<TrackedDownload>.CreateNew()
                    .With(c => c.State = TrackedDownloadState.Downloading)
                    .With(c => c.DownloadItem = completed)
                    .With(c => c.RemoteMovie = remoteMovie)
                    .Build();

            Mocker.GetMock<IDownloadClient>()
              .SetupGet(c => c.Definition)
              .Returns(new DownloadClientDefinition { Id = 1, Name = "testClient" });

            Mocker.GetMock<IProvideDownloadClient>()
                  .Setup(c => c.Get(It.IsAny<int>()))
                  .Returns(Mocker.GetMock<IDownloadClient>().Object);

            Mocker.GetMock<IProvideImportItemService>()
                  .Setup(c => c.ProvideImportItem(It.IsAny<DownloadClientItem>(), It.IsAny<DownloadClientItem>()))
                  .Returns((DownloadClientItem item, DownloadClientItem previous) => item);

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(_trackedDownload.DownloadItem.DownloadId))
                  .Returns(new List<MovieHistory>());

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.GetMovie("Drone.S01E01.HDTV", false))
                  .Returns(remoteMovie.Movie);
        }

        private RemoteMovie BuildRemoteMovie()
        {
            return new RemoteMovie
            {
                Movie = new Movie(),
            };
        }

        private void GivenNoGrabbedHistory()
        {
            Mocker.GetMock<IHistoryService>()
                .Setup(s => s.FindByDownloadId(_trackedDownload.DownloadItem.DownloadId))
                .Returns(new List<MovieHistory>());
        }

        private void GivenMovieMatch()
        {
            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.GetMovie(It.IsAny<string>(), false))
                  .Returns(_trackedDownload.RemoteMovie.Movie);
        }

        private void GivenABadlyNamedDownload()
        {
            _trackedDownload.DownloadItem.DownloadId = "1234";
            _trackedDownload.DownloadItem.Title = "Droned Pilot"; // Set a badly named download
            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.Is<string>(i => i == "1234")))
                  .Returns(new List<MovieHistory>
                  {
                      new MovieHistory() { SourceTitle = "Droned S01E01", EventType = MovieHistoryEventType.Grabbed }
                  });

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.GetMovie(It.IsAny<string>(), false))
                  .Returns((Movie)null);

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.GetMovie("Droned S01E01", false))
                  .Returns(BuildRemoteMovie().Movie);
        }

        [TestCase(DownloadItemStatus.Downloading)]
        [TestCase(DownloadItemStatus.Failed)]
        [TestCase(DownloadItemStatus.Queued)]
        [TestCase(DownloadItemStatus.Paused)]
        [TestCase(DownloadItemStatus.Warning)]
        public void should_not_process_if_download_status_isnt_completed(DownloadItemStatus status)
        {
            _trackedDownload.DownloadItem.Status = status;

            Subject.Check(_trackedDownload);

            AssertNotReadyToImport();
        }

        [Test]
        public void should_not_process_if_matching_history_is_not_found_and_no_category_specified()
        {
            _trackedDownload.DownloadItem.Category = null;
            GivenNoGrabbedHistory();

            Subject.Check(_trackedDownload);

            AssertNotReadyToImport();
        }

        [Test]
        public void should_process_if_matching_history_is_not_found_but_category_specified()
        {
            _trackedDownload.DownloadItem.Category = "tv";
            GivenNoGrabbedHistory();
            GivenMovieMatch();

            Subject.Check(_trackedDownload);

            AssertReadyToImport();
        }

        [Test]
        public void should_not_process_if_output_path_is_empty()
        {
            _trackedDownload.DownloadItem.OutputPath = default(OsPath);

            Subject.Check(_trackedDownload);

            AssertNotReadyToImport();
        }

        [Test]
        public void should_not_process_if_the_download_cannot_be_tracked_using_the_source_title_as_it_was_initiated_externally()
        {
            GivenABadlyNamedDownload();

            Mocker.GetMock<IDownloadedMovieImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Movie>(), It.IsAny<DownloadClientItem>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(new ImportDecision(new LocalMovie { Path = @"C:\TestPath\Droned.S01E01.mkv" }))
                           });

            Subject.Check(_trackedDownload);

            AssertNotReadyToImport();
        }

        [Test]
        public void should_not_process_when_there_is_a_title_mismatch()
        {
            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.GetMovie("Drone.S01E01.HDTV", false))
                  .Returns((Movie)null);

            Subject.Check(_trackedDownload);

            AssertNotReadyToImport();
        }

        // The download title no longer parses to a movie, so the grab history decides whether importing unattended is safe.
        private void GivenGrabbedWithMatchType(MovieMatchType matchType, ReleaseSourceType releaseSource)
        {
            var history = new MovieHistory { EventType = MovieHistoryEventType.Grabbed, MovieId = 1 };
            history.Data[MovieHistory.MOVIE_MATCH_TYPE] = matchType.ToString();
            history.Data[MovieHistory.RELEASE_SOURCE] = releaseSource.ToString();

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(_trackedDownload.DownloadItem.DownloadId))
                  .Returns(new List<MovieHistory> { history });

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.GetMovie("Drone.S01E01.HDTV", false))
                  .Returns((Movie)null);

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovie(1))
                  .Returns(_trackedDownload.RemoteMovie.Movie);
        }

        [TestCase(MovieMatchType.Id)]
        [TestCase(MovieMatchType.FuzzyTitle)]
        public void should_block_import_when_the_movie_was_not_identified_by_name(MovieMatchType matchType)
        {
            GivenGrabbedWithMatchType(matchType, ReleaseSourceType.Rss);

            Subject.Check(_trackedDownload);

            _trackedDownload.State.Should().Be(TrackedDownloadState.ImportBlocked);
        }

        [TestCase(MovieMatchType.Id)]
        [TestCase(MovieMatchType.FuzzyTitle)]
        public void should_import_a_weak_match_that_came_from_an_interactive_search(MovieMatchType matchType)
        {
            // The user picked this release themselves, so the weak match was already confirmed by a human.
            GivenGrabbedWithMatchType(matchType, ReleaseSourceType.InteractiveSearch);

            Subject.Check(_trackedDownload);

            AssertReadyToImport();
        }

        [Test]
        public void should_import_an_exact_title_match_without_intervention()
        {
            GivenGrabbedWithMatchType(MovieMatchType.Title, ReleaseSourceType.Rss);

            Subject.Check(_trackedDownload);

            AssertReadyToImport();
        }

        private void AssertNotReadyToImport()
        {
            _trackedDownload.State.Should().NotBe(TrackedDownloadState.ImportPending);
        }

        private void AssertReadyToImport()
        {
            _trackedDownload.State.Should().Be(TrackedDownloadState.ImportPending);
        }
    }
}
