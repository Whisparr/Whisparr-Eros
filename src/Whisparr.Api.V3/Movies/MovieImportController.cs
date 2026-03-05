using System;
using System.Collections.Generic;
using System.IO;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.MovieImport.Aggregation;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.RootFolders;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Movies
{
    [V3ApiController("movie/import")]
    public class MovieImportController : RestController<MovieResource>
    {
        private readonly IAddMovieService _addMovieService;
        private readonly IProvideMovieInfo _movieInfo;
        private readonly IRootFolderService _rootFolderService;
        private readonly IDiskProvider _diskProvider;
        private readonly IDiskTransferService _diskTransferService;
        private readonly IBuildFileNames _fileNameBuilder;
        private readonly INamingConfigService _namingConfigService;
        private readonly IAggregationService _aggregationService;
        private readonly Logger _logger;

        public MovieImportController(IAddMovieService addMovieService,
                                    IProvideMovieInfo movieInfo,
                                    IRootFolderService rootFolderService,
                                    IDiskProvider diskProvider,
                                    IDiskTransferService diskTransferService,
                                    IBuildFileNames fileNameBuilder,
                                    INamingConfigService namingConfigService,
                                    IAggregationService aggregationService,
                                    Logger logger)
        {
            _addMovieService = addMovieService;
            _movieInfo = movieInfo;
            _rootFolderService = rootFolderService;
            _diskProvider = diskProvider;
            _diskTransferService = diskTransferService;
            _fileNameBuilder = fileNameBuilder;
            _namingConfigService = namingConfigService;
            _aggregationService = aggregationService;
            _logger = logger;
        }

        /// <summary>
        /// Not implemented for this controller; required by the base type.
        /// Intended to return a single <see cref="MovieResource"/> wrapped in an <see cref="ActionResult{T}"/>.
        /// </summary>
        /// <param name="id">The movie resource identifier.</param>
        /// <returns>An <see cref="ActionResult{MovieResource}"/> for the requested movie.</returns>
        [NonAction]
        public override ActionResult<MovieResource> GetResourceByIdWithErrorHandler(int id)
        {
            throw new NotImplementedException();
        }

        protected override MovieResource GetResourceById(int id)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Imports the provided list of movie resources into the application.
        /// Each resource must include a valid filesystem path to an existing movie file.
        /// Files will be moved/renamed according to configured naming rules and root folders,
        /// metadata will be augmented from configured providers, and the movies will be added to the library.
        /// </summary>
        /// <param name="resource">List of <see cref="MovieResource"/> objects describing movies to import.</param>
        /// <returns>An enumerable of <see cref="MovieResource"/> representing the newly added movies.</returns>
        /// <exception cref="FluentValidation.ValidationException">Thrown when metadata for a movie cannot be found or other validation fails during import.</exception>
        [HttpPost]
        [Consumes("application/json")]
        [Produces("application/json")]
        public IEnumerable<MovieResource> Import([FromBody] List<MovieResource> resource)
        {
            var movies = resource.ToModel();
            var newMovies = new List<Movie>();

            var namingConfig = _namingConfigService.GetConfig();

            foreach (var movie in movies)
            {
                if (string.IsNullOrEmpty(movie.Path))
                {
                    continue;
                }

                var newMovie = AddSkyhookData(movie);

                var parsedMovieInfo = Parser.ParseMoviePath(newMovie.Path);
                if (movie.RootFolderPath == null)
                {
                    var rootFolder = _rootFolderService.GetBestRootFolderPath(newMovie.Path);
                    newMovie.RootFolderPath = rootFolder;
                }

                var movieFolder = _fileNameBuilder.GetMovieFolder(newMovie, namingConfig);
                var destinationFolder = Path.Combine(newMovie.RootFolderPath, movieFolder);

                // Build the new filename to avoid renaming in later
                // if renaming isn't activated, the file will be moved to the new folder
                var localMovie = new LocalMovie
                {
                    Movie = newMovie,
                    FolderMovieInfo = parsedMovieInfo,
                    FileMovieInfo = parsedMovieInfo,
                    Path = newMovie.Path,
                };

                var movieFile = new MovieFile
                {
                    Path = newMovie.Path,
                    OriginalFilePath = newMovie.Path,
                    Movie = newMovie,
                };

                try
                {
                    localMovie = _aggregationService.Augment(localMovie, null);
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Failed to aggregate movie file for {0}", newMovie.Path);
                }

                movieFile.Quality = localMovie.Quality;

                var newName = _fileNameBuilder.BuildFileName(newMovie, movieFile);
                var newFileName = newName + Path.GetExtension(newMovie.Path);

                if (!_diskProvider.FolderExists(destinationFolder))
                {
                    try
                    {
                        _diskProvider.CreateFolder(destinationFolder);
                    }
                    catch (Exception ex)
                    {
                        _logger.Error(ex, "Failed to create destination folder {0} for {1}", destinationFolder, newMovie.Path);
                    }
                }

                var destinationPath = Path.Combine(newMovie.RootFolderPath, destinationFolder, newFileName);
                if (newMovie.Path != destinationPath)
                {
                    try
                    {
                        _diskTransferService.TransferFile(newMovie.Path, destinationPath, TransferMode.Move);
                        newMovie.Path = destinationPath;
                    }
                    catch (Exception ex)
                    {
                        _logger.Error(ex, "Failed to move file from {0} to {1}", newMovie.Path, destinationPath);
                    }
                }

                newMovies.Add(newMovie);
            }

            return _addMovieService.AddMovies(newMovies).ToResource(0);
        }

        private Movie AddSkyhookData(Movie newMovie)
        {
            var movie = new Movie();

            try
            {
                var (metadata, credits) = GetMetadata(newMovie);
                movie.MovieMetadata = metadata;
                movie.MovieMetadata.Value.Credits = credits;
            }
            catch (MovieNotFoundException ex)
            {
                var source = string.IsNullOrEmpty(newMovie.ForeignId) ? "TMDb" : "StashDB";
                _logger.Error(ex, "{ForeignId} was not found, it may have been removed from {Source}. Path: {Path}", newMovie.ForeignId, source, newMovie.Path);

                throw new ValidationException(new List<ValidationFailure>
                                              {
                                                 new ValidationFailure(source, $"A movie with this ID was not found. Path: {newMovie.Path}", newMovie.ForeignId)
                                              });
            }

            movie.ApplyChanges(newMovie);

            return movie;
        }

        private (MovieMetadata Metadata, List<Credit> Credits) GetMetadata(Movie movie)
        {
            if (int.TryParse(movie.ForeignId, out var tmdbId))
            {
                var result = _movieInfo.GetMovieInfo(tmdbId);
                return (result.Item1, result.Item4);
            }
            else if (movie.TmdbId > 0)
            {
                var result = _movieInfo.GetMovieInfo(movie.TmdbId);
                return (result.Item1, result.Item4);
            }
            else if (movie.TpdbId.IsNotNullOrWhiteSpace())
            {
                var result = _movieInfo.GetTpdbMovieInfo(movie.TpdbId);
                return (result.Item1, result.Item4);
            }
            else if (movie.ForeignId.StartsWith("tpdbid:"))
            {
                var result = _movieInfo.GetTpdbMovieInfo(movie.ForeignId.Replace("tpdbid:", ""));
                return (result.Item1, result.Item4);
            }
            else
            {
                var result = _movieInfo.GetSceneInfo(movie.ForeignId);
                return (result.Item1, result.Item4);
            }
        }
    }
}
