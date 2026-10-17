using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.MediaFiles.MovieImport.Manual;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.ManualImport;
using Whisparr.Http;

namespace NzbDrone.Api.Test.v3
{
    [TestFixture]
    public class ManualImportPagingFixture : TestBase<ManualImportController>
    {
        [Test]
        public void should_forward_multiple_downloads_to_one_paged_service_request()
        {
            var ids = new[] { "first", "second" };
            Mocker.GetMock<IManualImportService>()
                .Setup(service => service.GetMediaFilesPage(null, null, null, true, It.IsAny<PagingSpec<ManualImportItem>>(), ids))
                .Returns((string folder, string downloadId, int? movieId, bool filter, PagingSpec<ManualImportItem> spec, IEnumerable<string> downloads) =>
                {
                    spec.TotalRecords = 60;
                    spec.Records = new List<ManualImportItem> { new ManualImportItem { Path = "/second/file.mkv", DownloadId = "second" } };
                    return spec;
                });
            var result = Subject.GetMediaFilesPage(new PagingRequestResource { Page = 2 }, null, null, null, downloadIds: ids);
            result.Page.Should().Be(2);
            result.TotalRecords.Should().Be(60);
            result.Records.Should().ContainSingle().Which.DownloadId.Should().Be("second");
        }

        [Test]
        public void should_return_the_bounded_page_and_total_without_calling_the_unpaged_service()
        {
            Mocker.GetMock<IManualImportService>()
                .Setup(service => service.GetMediaFilesPage("/fixture", null, null, true, It.IsAny<PagingSpec<ManualImportItem>>()))
                .Returns((string folder, string downloadId, int? movieId, bool filter, PagingSpec<ManualImportItem> spec) =>
                {
                    spec.TotalRecords = 10001;
                    spec.Records = new List<ManualImportItem> { new ManualImportItem { Path = "/fixture/example.mkv", Name = "example", RelativePath = "example.mkv" } };
                    return spec;
                });

            var result = Subject.GetMediaFilesPage(new PagingRequestResource { Page = 201 }, "/fixture", null, null);

            result.Page.Should().Be(201);
            result.PageSize.Should().Be(50);
            result.TotalRecords.Should().Be(10001);
            result.Records.Should().ContainSingle().Which.Path.Should().Be("/fixture/example.mkv");
            Mocker.GetMock<IManualImportService>().Verify(service => service.GetMediaFiles(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<bool>()), Times.Never());
        }
    }
}
