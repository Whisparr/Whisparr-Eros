using System.Collections.Generic;
using System.IO;
using FizzWare.NBuilder;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.Commands;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Movies;
using NzbDrone.Core.RootFolders;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MediaFiles.MediaFileDeletionService
{
    [TestFixture]
    public class DeleteMovieFilesCommandFixture : CoreTest<Core.MediaFiles.MediaFileDeletionService>
    {
        private const string RootFolder = @"C:\Test\Movies";

        private Movie _first;
        private Movie _second;
        private List<MovieFile> _firstFiles;
        private List<MovieFile> _secondFiles;

        [SetUp]
        public void Setup()
        {
            _first = GivenMovie(1, Path.Combine(RootFolder, "Studio", "First"));
            _second = GivenMovie(2, Path.Combine(RootFolder, "Second"));

            _firstFiles = GivenFiles(_first, "first-a.mkv", "first-b.mkv");
            _secondFiles = GivenFiles(_second, "second.mkv");

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FolderExists(RootFolder))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetDirectories(RootFolder))
                  .Returns(new[] { Path.Combine(RootFolder, "Studio"), _second.Path });

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetParentFolder(It.IsAny<string>()))
                  .Returns<string>(p => Path.GetDirectoryName(p));
        }

        private Movie GivenMovie(int id, string path)
        {
            var movie = Builder<Movie>.CreateNew()
                                      .With(m => m.Id = id)
                                      .With(m => m.Path = path)
                                      .Build();

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovie(id))
                  .Returns(movie);

            Mocker.GetMock<IRootFolderService>()
                  .Setup(s => s.GetBestRootFolderPath(path, null))
                  .Returns(RootFolder);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FolderExists(path))
                  .Returns(true);

            return movie;
        }

        private List<MovieFile> GivenFiles(Movie movie, params string[] relativePaths)
        {
            var files = new List<MovieFile>();

            foreach (var relativePath in relativePaths)
            {
                files.Add(new MovieFile { MovieId = movie.Id, RelativePath = relativePath });
            }

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetFilesByMovie(movie.Id))
                  .Returns(files);

            return files;
        }

        private void Execute(params int[] movieIds)
        {
            Subject.Execute(new DeleteMovieFilesCommand { MovieIds = new List<int>(movieIds) });
        }

        [Test]
        public void should_delete_every_file_of_every_selected_movie()
        {
            Execute(1, 2);

            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(It.IsAny<string>(), It.IsAny<string>()), Times.Exactly(3));
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(It.IsAny<MovieFile>(), DeleteMediaFileReason.Manual), Times.Exactly(3));
            Mocker.GetMock<IMovieService>().Verify(v => v.DeleteMovie(It.IsAny<int>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Never());
        }

        [Test]
        public void should_delete_from_db_when_file_is_already_gone()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FileExists(It.IsAny<string>()))
                  .Returns(false);

            Execute(2);

            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_secondFiles[0], DeleteMediaFileReason.Manual), Times.Once());
        }

        [Test]
        public void should_skip_movie_without_files()
        {
            GivenFiles(_first);

            Execute(1);

            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
            Mocker.GetMock<ICommandResultReporter>().Verify(v => v.Report(It.IsAny<CommandResult>()), Times.Never());
        }

        [Test]
        public void should_skip_movie_whose_root_folder_is_missing_and_continue()
        {
            Mocker.GetMock<IRootFolderService>()
                  .Setup(s => s.GetBestRootFolderPath(_first.Path, null))
                  .Returns(@"C:\Missing");

            Execute(1, 2);

            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(It.Is<MovieFile>(f => f.MovieId == 1), It.IsAny<DeleteMediaFileReason>()), Times.Never());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_secondFiles[0], DeleteMediaFileReason.Manual), Times.Once());
            Mocker.GetMock<ICommandResultReporter>().Verify(v => v.Report(CommandResult.Indeterminate), Times.Once());
            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_skip_movie_whose_root_folder_is_empty()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetDirectories(RootFolder))
                  .Returns(System.Array.Empty<string>());

            Execute(1);

            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
            Mocker.GetMock<ICommandResultReporter>().Verify(v => v.Report(CommandResult.Indeterminate), Times.Once());
            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_keep_file_in_db_when_recycling_fails_and_continue()
        {
            Mocker.GetMock<IRecycleBinProvider>()
                  .Setup(s => s.DeleteFile(Path.Combine(_first.Path, "first-a.mkv"), It.IsAny<string>()))
                  .Throws(new IOException());

            Execute(1);

            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_firstFiles[0], It.IsAny<DeleteMediaFileReason>()), Times.Never());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_firstFiles[1], DeleteMediaFileReason.Manual), Times.Once());
            Mocker.GetMock<ICommandResultReporter>().Verify(v => v.Report(CommandResult.Indeterminate), Times.Once());
            ExceptionVerification.ExpectedErrors(1);
        }

        [Test]
        public void should_continue_when_a_movie_cannot_be_loaded()
        {
            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovie(1))
                  .Throws(new System.InvalidOperationException());

            Execute(1, 2);

            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_secondFiles[0], DeleteMediaFileReason.Manual), Times.Once());
            Mocker.GetMock<ICommandResultReporter>().Verify(v => v.Report(CommandResult.Indeterminate), Times.Once());
            ExceptionVerification.ExpectedWarns(1);
        }
    }
}
