using System.Collections.Generic;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.RootFolders;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.RootFolders;
using Whisparr.Http;

namespace NzbDrone.Api.Test.v3
{
    [TestFixture]
    public class RootFolderPagingFixture : TestBase<RootFolderController>
    {
        private static RootFolder Folder(bool includeFiles)
        {
            return new RootFolder
            {
                Id = 7,
                Path = "/fixture",
                ImportFileCount = 1001,
                ImportFiles = includeFiles ? new List<ImportFile> { new ImportFile { Path = "/fixture/example.mkv" } } : null
            };
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_keep_legacy_file_lists_and_allow_single_folder_summaries(bool includeFiles)
        {
            Subject.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            if (!includeFiles)
            {
                Subject.Request.QueryString = new QueryString("?includeImportFiles=false");
            }

            Mocker.GetMock<IRootFolderService>().Setup(service => service.Get(7, includeFiles)).Returns(Folder(includeFiles));
            var result = Subject.GetResourceByIdWithErrorHandler(7).Value;
            result.ImportFileCount.Should().Be(1001);
            if (includeFiles)
            {
                result.ImportFiles.Should().ContainSingle();
            }
            else
            {
                result.ImportFiles.Should().BeNull();
            }
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_forward_file_list_option_for_folder_lists_and_refresh(bool includeFiles)
        {
            Mocker.GetMock<IRootFolderService>().Setup(service => service.AllWithImportFiles(includeFiles))
                .Returns(new List<RootFolder> { Folder(includeFiles) });
            Mocker.GetMock<IRootFolderService>().Setup(service => service.Refresh(7, includeFiles)).Returns(Folder(includeFiles));
            Subject.GetRootFolders(includeFiles).Should().ContainSingle().Which.ImportFileCount.Should().Be(1001);
            Subject.Refresh(7, includeFiles).ImportFileCount.Should().Be(1001);
        }

        [Test]
        public void should_return_one_page_of_root_folder_files_with_its_full_count()
        {
            Mocker.GetMock<IRootFolderService>().Setup(service => service.GetImportFiles(7, It.IsAny<PagingSpec<ImportFile>>()))
                .Returns((int id, PagingSpec<ImportFile> spec) =>
                {
                    spec.TotalRecords = 1001;
                    spec.Records = new List<ImportFile> { new ImportFile { Id = 1001, RootFolderId = id, Path = "/fixture/last.mkv" } };
                    return spec;
                });
            var result = Subject.GetImportFiles(7, new PagingRequestResource { Page = 21 });
            result.Page.Should().Be(21);
            result.PageSize.Should().Be(50);
            result.TotalRecords.Should().Be(1001);
            result.Records.Should().ContainSingle().Which.Id.Should().Be(1001);
        }
    }
}
