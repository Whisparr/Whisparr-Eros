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

        [NonAction]
        public override ActionResult<MovieResource> GetResourceByIdWithErrorHandler(int id)
        {
            throw new NotImplementedException();
        }

        protected override MovieResource GetResourceById(int id)
        {
            throw new NotImplementedException();
        }

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
                movie.MovieMetadata = GetMetadata(newMovie);
            }
            catch (MovieNotFoundException)
            {
                var source = string.IsNullOrEmpty(newMovie.ForeignId) ? "TMDb" : "StashDB";
                _logger.Error("{1} was not found, it may have been removed from {0}. Path: {2}", source, newMovie.ForeignId, newMovie.Path);

                throw new ValidationException(new List<ValidationFailure>
                                              {
                                                 new ValidationFailure(source, $"A movie with this ID was not found. Path: {newMovie.Path}", newMovie.ForeignId)
                                              });
            }

            movie.ApplyChanges(newMovie);

            return movie;
        }

        private MovieMetadata GetMetadata(Movie movie)
        {
            if (int.TryParse(movie.ForeignId, out var tmdbId))
            {
                return _movieInfo.GetMovieInfo(tmdbId).Item1;
            }
            else if (movie.TmdbId > 0)
            {
                return _movieInfo.GetMovieInfo(movie.TmdbId).Item1;
            }
            else if (movie.TpdbId.IsNotNullOrWhiteSpace())
            {
                return _movieInfo.GetTpdbMovieInfo(movie.TpdbId).Item1;
            }
            else if (movie.ForeignId.StartsWith("tpdbid:"))
            {
                return _movieInfo.GetTpdbMovieInfo(movie.ForeignId.Replace("tpdbid:", "")).Item1;
            }
            else
            {
                return _movieInfo.GetSceneInfo(movie.ForeignId).Item1;
            }
        }
    }
}
