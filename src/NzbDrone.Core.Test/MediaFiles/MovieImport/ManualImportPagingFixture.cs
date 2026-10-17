using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.MovieImport;
using NzbDrone.Core.MediaFiles.MovieImport.Aggregation;
using NzbDrone.Core.MediaFiles.MovieImport.Manual;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MediaFiles.MovieImport
{
    [TestFixture]
    public class ManualImportPagingFixture : CoreTest<ManualImportService>
    {
        private string _rootFolder;
        private string[] _files;

        [SetUp]
        public void Setup()
        {
            _rootFolder = @"C:\fixture".AsOsAgnostic();
            _files = Enumerable.Range(1, 1001).Select(i => Path.Combine(_rootFolder, $"file-{i:00000}.mkv")).ToArray();
            Mocker.GetMock<IDiskProvider>().Setup(d => d.FolderExists(_rootFolder)).Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(d => d.GetDirectories(It.IsAny<string>())).Returns(Array.Empty<string>());
            Mocker.GetMock<IDiskProvider>().Setup(d => d.GetFileSize(It.IsAny<string>())).Returns(1024);
            Mocker.GetMock<IDiskScanService>().Setup(d => d.GetVideoFiles(_rootFolder, false)).Returns(() => _files);
            Mocker.GetMock<IDiskScanService>().Setup(d => d.FilterPaths(It.IsAny<string>(), It.IsAny<IEnumerable<string>>(), true))
                .Returns((string root, IEnumerable<string> paths, bool filter) => paths.ToList());
            Mocker.GetMock<IAggregationService>().Setup(a => a.Augment(It.IsAny<LocalMovie>(), null))
                .Returns((LocalMovie movie, NzbDrone.Core.Download.DownloadClientItem item) => movie);
        }

        private PagingSpec<ManualImportItem> Page(int page, string key = "relativePath", SortDirection direction = SortDirection.Ascending)
        {
            return Subject.GetMediaFilesPage(_rootFolder, null, null, false, new PagingSpec<ManualImportItem>
            {
                Page = page, PageSize = 50, SortKey = key, SortDirection = direction
            });
        }

        [Test]
        public void should_analyze_only_the_requested_page_without_the_old_folder_cutoff()
        {
            var result = Page(11);
            result.TotalRecords.Should().Be(1001);
            result.Records.Should().HaveCount(50);
            result.Records.First().Path.Should().Be(_files[500]);
            result.Records.Last().Path.Should().Be(_files[549]);
            Mocker.GetMock<IAggregationService>().Verify(a => a.Augment(It.IsAny<LocalMovie>(), null), Times.Exactly(50));
            Mocker.GetMock<IDiskProvider>().Verify(d => d.GetFileSize(_files[0]), Times.Never());
        }

        [Test]
        public void should_return_last_page_with_global_order()
        {
            var result = Page(21, direction: SortDirection.Descending);
            result.Records.Should().ContainSingle().Which.Path.Should().Be(_files[0]);
        }

        [Test]
        public void should_not_analyze_files_for_a_page_beyond_the_end()
        {
            Page(22).Records.Should().BeEmpty();
            Mocker.GetMock<IAggregationService>().Verify(a => a.Augment(It.IsAny<LocalMovie>(), null), Times.Never());
        }

        [Test]
        public void should_sort_size_before_selecting_the_page()
        {
            Mocker.GetMock<IDiskProvider>().Setup(d => d.GetFileSize(_files[900])).Returns(99999);
            Page(1, "size", SortDirection.Descending).Records.First().Path.Should().Be(_files[900]);
        }

        [Test]
        public void should_keep_duplicate_basenames_in_separate_folders()
        {
            _files = new[] { Path.Combine(_rootFolder, "b", "same.mkv"), Path.Combine(_rootFolder, "a", "same.mkv") };
            Page(1).Records.Select(i => i.Path).Should().Equal(_files.Reverse());
        }

        [Test]
        public void should_filter_existing_files_before_paging_and_analyze_a_matched_folder_in_one_batch()
        {
            var movie = new Movie { Id = 1, Path = @"C:\library\example".AsOsAgnostic(), Title = "Example" };
            var remaining = _files.Skip(1).ToList();
            Mocker.GetMock<IParsingService>().Setup(parser => parser.GetMovie("fixture")).Returns(movie);
            Mocker.GetMock<IDiskScanService>().Setup(disk => disk.GetVideoFiles(_rootFolder, true)).Returns(_files);
            Mocker.GetMock<IMediaFileService>().Setup(service => service.FilterExistingFiles(It.IsAny<List<string>>(), movie)).Returns(remaining);
            Mocker.GetMock<IMakeImportDecision>()
                .Setup(maker => maker.GetImportDecisionsForPage(It.IsAny<List<string>>(), remaining, movie, null, It.IsAny<ParsedMovieInfo>(), true))
                .Returns((List<string> page, List<string> context, Movie match, NzbDrone.Core.Download.DownloadClientItem download, ParsedMovieInfo folder, bool scene) =>
                    page.Select(file => new ImportDecision(new LocalMovie { Path = file, Movie = match })).ToList());

            var result = Subject.GetMediaFilesPage(_rootFolder, null, null, true, new PagingSpec<ManualImportItem>
            {
                Page = 2, PageSize = 50, SortKey = "relativePath", SortDirection = SortDirection.Ascending
            });

            result.TotalRecords.Should().Be(1000);
            result.Records.First().Path.Should().Be(_files[51]);
            result.Records.Should().HaveCount(50);
            Mocker.GetMock<IMakeImportDecision>().Verify(maker => maker.GetImportDecisionsForPage(It.Is<List<string>>(files => files.Count == 50), remaining, movie, null, It.IsAny<ParsedMovieInfo>(), true), Times.Once());
        }

        [Test]
        public void should_page_all_downloads_together_and_preserve_each_download_id()
        {
            foreach (var id in new[] { "first", "second" })
            {
                var folder = Path.Combine(_rootFolder, id);
                Mocker.GetMock<ITrackedDownloadService>().Setup(service => service.Find(id))
                    .Returns(new TrackedDownload { ImportItem = new DownloadClientItem { OutputPath = new OsPath(folder) } });
                Mocker.GetMock<IDiskProvider>().Setup(disk => disk.FolderExists(folder)).Returns(true);
                Mocker.GetMock<IDiskScanService>().Setup(disk => disk.GetVideoFiles(folder, false))
                    .Returns(Enumerable.Range(1, 30).Select(i => Path.Combine(folder, $"{i:000}.mkv")).ToArray());
            }

            var spec = new PagingSpec<ManualImportItem>
            {
                Page = 2, PageSize = 50, SortKey = "relativePath", SortDirection = SortDirection.Ascending
            };
            var result = Subject.GetMediaFilesPage(null, "first", null, false, spec, new[] { "first", "second", "second", "missing" });

            result.TotalRecords.Should().Be(60);
            result.Records.Should().HaveCount(10);
            result.Records.First().Path.Should().Be(Path.Combine(_rootFolder, "second", "021.mkv"));
            result.Records.Should().OnlyContain(item => item.DownloadId == "second");
            Mocker.GetMock<IAggregationService>().Verify(a => a.Augment(It.IsAny<LocalMovie>(), null), Times.Exactly(10));
            Mocker.GetMock<IDiskProvider>().Verify(disk => disk.GetFileSize(Path.Combine(_rootFolder, "first", "001.mkv")), Times.Never());
        }

        [Test]
        public void should_skip_incomplete_downloads_in_a_paged_request()
        {
            Mocker.GetMock<ITrackedDownloadService>().Setup(service => service.Find("incomplete"))
                .Returns(new TrackedDownload { DownloadItem = new DownloadClientItem() });
            var result = Subject.GetMediaFilesPage(null, "incomplete", null, false, new PagingSpec<ManualImportItem>
            {
                Page = 1, PageSize = 50, SortKey = "relativePath", SortDirection = SortDirection.Ascending
            });
            result.TotalRecords.Should().Be(0);
            result.Records.Should().BeEmpty();
        }

        [Test]
        public void should_page_library_files_before_mapping_their_metadata()
        {
            var movie = new Movie { Id = 7, Path = _rootFolder, Title = "Example" };
            Mocker.GetMock<IMovieService>().Setup(service => service.GetMovie(7)).Returns(movie);
            Mocker.GetMock<IMediaFileService>().Setup(service => service.GetFilesByMovie(7))
                .Returns(new List<MovieFile> { new MovieFile { Id = 8, Path = _files[0], RelativePath = "file-00001.mkv" } });
            Mocker.GetMock<IDiskScanService>().Setup(disk => disk.GetVideoFiles(_rootFolder, true)).Returns(_files);
            var spec = new PagingSpec<ManualImportItem>
            {
                Page = 2, PageSize = 50, SortKey = "relativePath", SortDirection = SortDirection.Ascending
            };
            var result = Subject.GetMediaFilesPage(null, null, 7, false, spec);
            result.TotalRecords.Should().Be(1001);
            result.Records.Should().HaveCount(50);
            result.Records.First().Path.Should().Be(_files[50]);
            Mocker.GetMock<IDiskProvider>().Verify(disk => disk.GetFileSize(_files[0]), Times.Never());
            spec.Page = 1;
            Subject.GetMediaFilesPage(null, null, 7, false, spec).Records.First().MovieFileId.Should().Be(8);
            Mocker.GetMock<IAggregationService>().Verify(a => a.Augment(It.IsAny<LocalMovie>(), null), Times.Never());
        }

        [Test]
        public void should_page_a_single_file_path()
        {
            Mocker.GetMock<IDiskProvider>().Setup(disk => disk.FileExists(_files[0])).Returns(true);
            var result = Subject.GetMediaFilesPage(_files[0], null, null, false, new PagingSpec<ManualImportItem>
            {
                Page = 1, PageSize = 50, SortKey = "relativePath", SortDirection = SortDirection.Ascending
            });
            result.TotalRecords.Should().Be(1);
            result.Records.Should().ContainSingle().Which.Path.Should().Be(_files[0]);
        }

        [Test]
        public void should_return_empty_results_for_missing_paths()
        {
            Mocker.GetMock<IDiskProvider>().Setup(d => d.FolderExists(_rootFolder)).Returns(false);
            Page(1).TotalRecords.Should().Be(0);
        }
    }
}
