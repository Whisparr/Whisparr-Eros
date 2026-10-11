using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.MovieImport.Manual;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MediaFiles.MovieImport.Manual
{
    [TestFixture]
    public class ManualImportServiceFixture : CoreTest<ManualImportService>
    {
        [Test]
        public void should_return_nothing_for_an_unknown_download()
        {
            Subject.GetMediaFiles(null, "missing", null, true).Should().BeEmpty();
        }

        [Test]
        public void should_return_nothing_for_a_download_that_has_not_completed()
        {
            Mocker.GetMock<ITrackedDownloadService>()
                  .Setup(s => s.Find("downloading"))
                  .Returns(new TrackedDownload { DownloadItem = new DownloadClientItem() });

            Subject.GetMediaFiles(null, "downloading", null, true).Should().BeEmpty();

            Mocker.GetMock<IDiskProvider>().Verify(v => v.FolderExists(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_not_scan_a_missing_movie_folder()
        {
            var movie = new Movie { Id = 1, Path = @"C:\Test\Movies\Missing".AsOsAgnostic() };

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovie(movie.Id))
                  .Returns(movie);

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetFilesByMovie(movie.Id))
                  .Returns(new List<MovieFile>());

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FolderExists(movie.Path))
                  .Returns(false);

            Subject.GetMediaFiles(movie.Id).Should().BeEmpty();

            Mocker.GetMock<IDiskScanService>().Verify(v => v.GetVideoFiles(It.IsAny<string>(), It.IsAny<bool>()), Times.Never());
        }
    }
}
