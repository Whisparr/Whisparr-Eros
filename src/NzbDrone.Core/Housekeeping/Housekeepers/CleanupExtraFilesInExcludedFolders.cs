using System.IO;
using System.Linq;
using NzbDrone.Core.Extras.Others;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;

namespace NzbDrone.Core.Housekeeping.Housekeepers
{
    public class CleanupExtraFilesInExcludedFolders : IHousekeepingTask
    {
        private readonly IOtherExtraFileRepository _extraFileRepository;
        private readonly IMovieService _movieService;
        private readonly IDiskScanService _diskScanService;

        public CleanupExtraFilesInExcludedFolders(IOtherExtraFileRepository extraFileRepository, IMovieService movieService, IDiskScanService diskScanService)
        {
            _extraFileRepository = extraFileRepository;
            _movieService = movieService;
            _diskScanService = diskScanService;
        }

        public void Clean()
        {
            var allMovies = _movieService.GetAllMovies();

            foreach (var movie in allMovies)
            {
                var extraFiles = _extraFileRepository.GetFilesByMovie(movie.Id);
                var filteredExtraFiles = _diskScanService.FilterPaths(movie.Path, extraFiles.Select(e => Path.Combine(movie.Path, e.RelativePath)));

                if (filteredExtraFiles.Count == extraFiles.Count)
                {
                    continue;
                }

                var excludedExtraFiles = extraFiles.Where(e => !filteredExtraFiles.Contains(Path.Combine(movie.Path, e.RelativePath))).ToList();

                if (excludedExtraFiles.Any())
                {
                    _extraFileRepository.DeleteMany(excludedExtraFiles.Select(e => e.Id).ToList());
                }
            }
        }
    }
}
