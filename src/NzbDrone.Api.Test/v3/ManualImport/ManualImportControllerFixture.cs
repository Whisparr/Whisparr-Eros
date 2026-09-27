using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.MediaFiles.MovieImport.Manual;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.ManualImport;

namespace NzbDrone.Api.Test.v3.ManualImport
{
    [TestFixture]
    public class ManualImportControllerFixture : TestBase<ManualImportController>
    {
        [Test]
        public void should_return_files_for_every_download_id()
        {
            GivenDownload("first", "/downloads/first/a.mkv");
            GivenDownload("second", "/downloads/second/b.mkv", "/downloads/second/c.mkv");

            var result = Subject.GetMediaFiles(null, null, new[] { "first", "second" }, null);

            result.Select(r => r.Path).Should().BeEquivalentTo("/downloads/first/a.mkv", "/downloads/second/b.mkv", "/downloads/second/c.mkv");
            result.Select(r => r.DownloadId).Should().BeEquivalentTo("first", "second", "second");
        }

        [Test]
        public void should_scan_each_download_once_when_ids_repeat()
        {
            GivenDownload("first", "/downloads/first/a.mkv");

            var result = Subject.GetMediaFiles(null, "first", new[] { "first", "first" }, null);

            result.Should().HaveCount(1);
            Mocker.GetMock<IManualImportService>()
                .Verify(s => s.GetMediaFiles(null, "first", It.IsAny<int?>(), It.IsAny<bool>()), Times.Once());
        }

        [Test]
        public void should_still_accept_a_single_download_id()
        {
            GivenDownload("first", "/downloads/first/a.mkv");

            var result = Subject.GetMediaFiles(null, "first", null, null);

            result.Should().ContainSingle().Which.DownloadId.Should().Be("first");
        }

        [Test]
        public void should_list_movie_files_when_only_a_movie_is_given()
        {
            Mocker.GetMock<IManualImportService>()
                .Setup(s => s.GetMediaFiles(5))
                .Returns(Items(null, "/movies/five/five.mkv"));

            var result = Subject.GetMediaFiles(null, null, null, 5);

            result.Should().ContainSingle();
            Mocker.GetMock<IManualImportService>()
                .Verify(s => s.GetMediaFiles(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<bool>()), Times.Never());
        }

        [Test]
        public void should_scan_the_folder_when_no_download_id_is_given()
        {
            Mocker.GetMock<IManualImportService>()
                .Setup(s => s.GetMediaFiles("/downloads/manual", null, null, true))
                .Returns(Items(null, "/downloads/manual/a.mkv"));

            var result = Subject.GetMediaFiles("/downloads/manual", null, System.Array.Empty<string>(), null);

            result.Should().ContainSingle();
        }

        private static List<ManualImportItem> Items(string downloadId, params string[] paths)
        {
            return paths.Select(p => new ManualImportItem
            {
                Path = p,
                DownloadId = downloadId
            }).ToList();
        }

        private void GivenDownload(string downloadId, params string[] paths)
        {
            Mocker.GetMock<IManualImportService>()
                .Setup(s => s.GetMediaFiles(null, downloadId, It.IsAny<int?>(), It.IsAny<bool>()))
                .Returns(Items(downloadId, paths));
        }
    }
}
