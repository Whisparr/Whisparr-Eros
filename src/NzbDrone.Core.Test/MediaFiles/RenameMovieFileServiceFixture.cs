using System.Collections.Generic;
using System.IO;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.Commands;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MediaFiles
{
    public class RenameMovieFileServiceFixture : CoreTest<RenameMovieFileService>
    {
        private Movie _movie;
        private List<MovieFile> _movieFiles;

        [SetUp]
        public void Setup()
        {
            _movie = Builder<Movie>.CreateNew()
                                     .Build();

            _movieFiles = Builder<MovieFile>.CreateListOfSize(2)
                                                .All()
                                                .With(e => e.MovieId = _movie.Id)
                                                .Build()
                                                .ToList();

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovie(_movie.Id))
                  .Returns(_movie);

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                  .Returns<IEnumerable<int>>(ids => new List<Movie> { _movie }.Where(m => ids.Contains(m.Id)).ToList());
        }

        [Test]
        public void should_not_publish_event_if_no_files_to_rename()
        {
            GivenNoMovieFiles();

            Subject.Execute(new RenameFilesCommand(_movie.Id, new List<int> { 1 }));

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<MovieRenamedEvent>()), Times.Never());
        }

        [Test]
        public void should_not_publish_event_if_no_files_are_renamed()
        {
            GivenMovieFiles();

            Mocker.GetMock<IMoveMovieFiles>()
                  .Setup(s => s.MoveMovieFile(It.IsAny<MovieFile>(), It.IsAny<Movie>(), true))
                  .Throws(new SameFilenameException("Same file name", "Filename"));

            Subject.Execute(new RenameFilesCommand(_movie.Id, new List<int> { 1 }));

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<MovieRenamedEvent>()), Times.Never());
        }

        [Test]
        public void should_publish_event_if_files_are_renamed()
        {
            GivenMovieFiles();
            GivenMovedFiles();

            Subject.Execute(new RenameFilesCommand(_movie.Id, new List<int> { 1 }));

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<MovieRenamedEvent>()), Times.Once());
        }

        [Test]
        public void should_update_moved_files()
        {
            GivenMovieFiles();
            GivenMovedFiles();

            Subject.Execute(new RenameFilesCommand(_movie.Id, new List<int> { 1 }));

            Mocker.GetMock<IMediaFileService>()
                  .Verify(v => v.Update(It.IsAny<MovieFile>()), Times.Exactly(2));
        }

        [Test]
        public void should_get_moviefiles_by_ids_only()
        {
            GivenMovieFiles();
            GivenMovedFilesAndRenameFolder();

            var files = new List<int> { 1 };

            Subject.Execute(new RenameFilesCommand(_movie.Id, files));

            Mocker.GetMock<IMediaFileService>()
                  .Verify(v => v.GetMovies(files), Times.Once());
        }

        [Test]
        public void should_rename_each_file_against_its_own_movie()
        {
            var movies = GivenMoviesWithFiles(1, 2);

            Subject.Execute(new RenameFilesCommand { Files = new List<int> { 1, 2 } });

            Mocker.GetMock<IMoveMovieFiles>()
                  .Verify(v => v.MoveMovieFile(It.Is<MovieFile>(f => f.Id == 1), movies[0], true), Times.Once());

            Mocker.GetMock<IMoveMovieFiles>()
                  .Verify(v => v.MoveMovieFile(It.Is<MovieFile>(f => f.Id == 2), movies[1], true), Times.Once());

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<MovieRenamedEvent>()), Times.Exactly(2));

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<RenameCompletedEvent>()), Times.Once());
        }

        [Test]
        public void should_get_performer_previews_for_each_title_once()
        {
            GivenPreviewNaming();

            var movies = GivenMoviesWithFiles(1, 1, 2);

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetByPerformerForeignId("performer"))
                  .Returns(movies);

            Subject.GetRenamePreviewsForPerformer("performer");

            Mocker.GetMock<IMediaFileService>()
                  .Verify(v => v.GetFilesByMovies(It.Is<IEnumerable<int>>(ids => ids.OrderBy(i => i).SequenceEqual(new[] { 1, 2 }))), Times.Once());
        }

        [Test]
        public void should_only_preview_files_whose_name_would_change()
        {
            GivenPreviewNaming();

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetByStudioForeignId("studio"))
                  .Returns(GivenMoviesWithFiles(1, 2));

            var previews = Subject.GetRenamePreviewsForStudio("studio");

            previews.Should().ContainSingle();
            previews[0].MovieId.Should().Be(1);
            previews[0].MovieFileId.Should().Be(1);
            previews[0].ExistingPath.Should().Be("file1.mkv");
            previews[0].NewPath.Should().Be("renamed.mkv");
        }

        [Test]
        public void should_return_no_previews_when_no_file_would_change()
        {
            GivenPreviewNaming();

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetByStudioForeignId("studio"))
                  .Returns(GivenMoviesWithFiles(2, 3));

            Subject.GetRenamePreviewsForStudio("studio").Should().BeEmpty();
        }

        [Test]
        public void should_return_no_previews_for_a_performer_without_titles()
        {
            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetByPerformerForeignId("performer"))
                  .Returns(new List<Movie>());

            Subject.GetRenamePreviewsForPerformer("performer").Should().BeEmpty();

            Mocker.GetMock<IMediaFileService>()
                  .Verify(v => v.GetFilesByMovies(It.IsAny<IEnumerable<int>>()), Times.Never());
        }

        private void GivenPreviewNaming()
        {
            // File 1 gets a new name, every other file already matches the naming format
            Mocker.GetMock<IBuildFileNames>()
                  .Setup(s => s.BuildFileName(It.IsAny<Movie>(), It.IsAny<MovieFile>(), null, null, false))
                  .Returns<Movie, MovieFile, NamingConfig, List<CustomFormat>, bool>((m, f, n, c, sample) =>
                      f.Id == 1 ? "renamed" : Path.GetFileNameWithoutExtension(f.RelativePath));

            Mocker.GetMock<IBuildFileNames>()
                  .Setup(s => s.BuildFilePath(It.IsAny<Movie>(), It.IsAny<string>(), It.IsAny<string>()))
                  .Returns<Movie, string, string>((m, name, ext) => Path.Combine(m.Path, name + ext));
        }

        private List<Movie> GivenMoviesWithFiles(params int[] movieIds)
        {
            var movies = movieIds.Distinct()
                                 .Select(id => Builder<Movie>.CreateNew()
                                                             .With(m => m.Id = id)
                                                             .With(m => m.Path = Path.Combine("/media", $"movie{id}").AsOsAgnostic())
                                                             .Build())
                                 .ToList();

            var files = movies.Select(m => Builder<MovieFile>.CreateNew()
                                                           .With(f => f.Id = m.Id)
                                                           .With(f => f.MovieId = m.Id)
                                                           .With(f => f.RelativePath = $"file{m.Id}.mkv")
                                                           .Build())
                              .ToList();

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                  .Returns<IEnumerable<int>>(ids => movies.Where(m => ids.Contains(m.Id)).ToList());

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetFilesByMovies(It.IsAny<IEnumerable<int>>()))
                  .Returns<IEnumerable<int>>(ids => files.Where(f => ids.Contains(f.MovieId)).ToList());

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                  .Returns<IEnumerable<int>>(ids => files.Where(f => ids.Contains(f.Id)).ToList());

            // Mirrors a performer credited more than once on the same title
            return movieIds.Select(id => movies.Single(m => m.Id == id)).ToList();
        }

        private void GivenNoMovieFiles()
        {
            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<MovieFile>());
        }

        private void GivenMovieFiles()
        {
            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                  .Returns(_movieFiles);
        }

        private void GivenMovedFiles()
        {
            Mocker.GetMock<IMoveMovieFiles>()
                  .Setup(s => s.MoveMovieFile(It.IsAny<MovieFile>(), _movie, false));
        }

        private void GivenMovedFilesAndRenameFolder()
        {
            Mocker.GetMock<IMoveMovieFiles>()
                  .Setup(s => s.MoveMovieFile(It.IsAny<MovieFile>(), _movie, true));
        }
    }
}
