using System.Collections.Generic;
using System.IO;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.MediaFiles.MovieImport
{
    public interface ILocalMovieCustomFormatCalculationService
    {
        List<CustomFormat> ParseMovieCustomFormats(LocalMovie localMovie);
        void UpdateMovieCustomFormats(LocalMovie localMovie);
    }

    // Scores a file on the name it will have once imported, since that is the name the existing
    // file it may replace is scored on. The score on its current name is kept to explain rejections.
    public class LocalMovieCustomFormatCalculationService : ILocalMovieCustomFormatCalculationService
    {
        private readonly IBuildFileNames _fileNameBuilder;
        private readonly ICustomFormatCalculationService _formatCalculator;

        public LocalMovieCustomFormatCalculationService(IBuildFileNames fileNameBuilder, ICustomFormatCalculationService formatCalculator)
        {
            _fileNameBuilder = fileNameBuilder;
            _formatCalculator = formatCalculator;
        }

        public List<CustomFormat> ParseMovieCustomFormats(LocalMovie localMovie)
        {
            return _formatCalculator.ParseCustomFormat(localMovie, GetFileNameAfterImport(localMovie));
        }

        public void UpdateMovieCustomFormats(LocalMovie localMovie)
        {
            var qualityProfile = localMovie.Movie.QualityProfile;

            localMovie.CustomFormats = ParseMovieCustomFormats(localMovie);
            localMovie.CustomFormatScore = qualityProfile?.CalculateCustomFormatScore(localMovie.CustomFormats) ?? 0;

            localMovie.OriginalFileNameCustomFormats = _formatCalculator.ParseCustomFormat(localMovie, Path.GetFileName(localMovie.Path));
            localMovie.OriginalFileNameCustomFormatScore = qualityProfile?.CalculateCustomFormatScore(localMovie.OriginalFileNameCustomFormats) ?? 0;
        }

        // Existing files are scored on the file name part of their relative path, extension included,
        // so the built name (which may carry folders and has no extension) is brought to the same shape.
        private string GetFileNameAfterImport(LocalMovie localMovie)
        {
            var fileName = _fileNameBuilder.BuildFileName(localMovie.Movie, localMovie.ToMovieFile());

            return Path.GetFileName(fileName) + Path.GetExtension(localMovie.Path);
        }
    }
}
