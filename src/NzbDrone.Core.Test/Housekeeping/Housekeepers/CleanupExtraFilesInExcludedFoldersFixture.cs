using System.Collections.Generic;
using System.Linq;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Extras.Others;
using NzbDrone.Core.Housekeeping.Housekeepers;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Housekeeping.Housekeepers
{
    [TestFixture]
    public class CleanupExtraFilesInExcludedFoldersFixture : CoreTest<CleanupExtraFilesInExcludedFolders>
    {
        private Movie _movie;
        private List<OtherExtraFile> _extraFiles;

        [SetUp]
        public void Setup()
        {
            _movie = new Movie
            {
                Id = 1,
                Path = @"C:\Movies\Some.Movie.2024"
            };

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetAllMovies())
                  .Returns(new List<Movie> { _movie });

            var inBackdrops = new OtherExtraFile
            {
                Id = 1,
                MovieId = _movie.Id,
                RelativePath = @"backdrops\poster.jpg"
            };

            var inSubtitles = new OtherExtraFile
            {
                Id = 2,
                MovieId = _movie.Id,
                RelativePath = @"subtitles\en.srt"
            };

            _extraFiles = new List<OtherExtraFile> { inBackdrops, inSubtitles };

            Mocker.GetMock<IOtherExtraFileRepository>()
                  .Setup(s => s.GetFilesByMovie(_movie.Id))
                  .Returns(_extraFiles);

            // Mirror the production filter: paths under backdrops are excluded.
            Mocker.GetMock<IDiskScanService>()
                  .Setup(s => s.FilterPaths(It.IsAny<string>(), It.IsAny<IEnumerable<string>>(), It.IsAny<bool>()))
                  .Returns((string basePath, IEnumerable<string> paths, bool filterExtras) =>
                      paths.Where(p => !p.Contains(@"backdrops")).ToList());
        }

        [Test]
        public void should_delete_only_extra_files_in_excluded_folders()
        {
            Subject.Clean();

            Mocker.GetMock<IOtherExtraFileRepository>()
                  .Verify(r => r.DeleteMany(new List<int> { 1 }), Times.Once);
        }

        [Test]
        public void should_not_delete_when_nothing_is_excluded()
        {
            Mocker.GetMock<IDiskScanService>()
                  .Setup(s => s.FilterPaths(It.IsAny<string>(), It.IsAny<IEnumerable<string>>(), It.IsAny<bool>()))
                  .Returns((string basePath, IEnumerable<string> paths, bool filterExtras) =>
                      paths.ToList());

            Subject.Clean();

            Mocker.GetMock<IOtherExtraFileRepository>()
                  .Verify(r => r.DeleteMany(It.IsAny<List<int>>()), Times.Never);
        }
    }
}
