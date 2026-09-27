using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.MediaFiles.MovieImport.Manual;
using NzbDrone.Core.Test.Framework;

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
    }
}
