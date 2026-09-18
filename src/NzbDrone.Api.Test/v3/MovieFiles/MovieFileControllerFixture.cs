using System.Collections.Generic;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.MovieFiles;

namespace NzbDrone.Api.Test.v3.MovieFiles
{
    [TestFixture]
    public class MovieFileControllerFixture : TestBase<MovieFileController>
    {
        [Test]
        public void bulk_delete_should_use_each_files_own_movie()
        {
            var firstMovie = new Movie { Id = 1 };
            var secondMovie = new Movie { Id = 2 };
            var firstFile = new MovieFile { Id = 10, MovieId = 1 };
            var secondFile = new MovieFile { Id = 20, MovieId = 2 };

            Mocker.GetMock<IMediaFileService>()
                .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                .Returns(new List<MovieFile> { firstFile, secondFile });
            Mocker.GetMock<IMovieService>().Setup(s => s.GetMovie(1)).Returns(firstMovie);
            Mocker.GetMock<IMovieService>().Setup(s => s.GetMovie(2)).Returns(secondMovie);

            Subject.DeleteMovieFiles(new MovieFileListResource { MovieFileIds = new List<int> { 10, 20 } });

            Mocker.GetMock<IDeleteMediaFiles>().Verify(s => s.DeleteMovieFile(firstMovie, firstFile), Times.Once());
            Mocker.GetMock<IDeleteMediaFiles>().Verify(s => s.DeleteMovieFile(secondMovie, secondFile), Times.Once());
        }

        [Test]
        public void bulk_delete_should_delete_unmapped_files_without_a_movie()
        {
            var unmappedFile = new MovieFile { Id = 30, MovieId = 0 };

            Mocker.GetMock<IMediaFileService>()
                .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                .Returns(new List<MovieFile> { unmappedFile });

            Subject.DeleteMovieFiles(new MovieFileListResource { MovieFileIds = new List<int> { 30 } });

            Mocker.GetMock<IDeleteMediaFiles>().Verify(s => s.DeleteMovieFile(unmappedFile), Times.Once());
            Mocker.GetMock<IMovieService>().Verify(s => s.GetMovie(It.IsAny<int>()), Times.Never());
        }
    }
}
