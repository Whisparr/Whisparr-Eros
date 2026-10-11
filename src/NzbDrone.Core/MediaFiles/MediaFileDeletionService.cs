using System;
using System.IO;
using System.Linq;
using System.Net;
using DryIoc.ImTools;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Instrumentation.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.MediaFiles.Commands;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.RootFolders;

namespace NzbDrone.Core.MediaFiles
{
    public interface IDeleteMediaFiles
    {
        void DeleteMovieFile(MovieFile movieFile);
        void DeleteMovieFile(Movie movie, MovieFile movieFile);
    }

    public class MediaFileDeletionService : IDeleteMediaFiles,
                                            IExecute<DeleteMovieFilesCommand>,
                                            IHandleAsync<MoviesDeletedEvent>,
                                            IHandle<MovieFileDeletedEvent>
    {
        private readonly IDiskProvider _diskProvider;
        private readonly IRecycleBinProvider _recycleBinProvider;
        private readonly IMediaFileService _mediaFileService;
        private readonly IMovieService _movieService;
        private readonly IRootFolderService _rootFolderService;
        private readonly IConfigService _configService;
        private readonly ICommandResultReporter _commandResultReporter;
        private readonly IEventAggregator _eventAggregator;
        private readonly Logger _logger;

        public MediaFileDeletionService(IDiskProvider diskProvider,
                                        IRecycleBinProvider recycleBinProvider,
                                        IMediaFileService mediaFileService,
                                        IMovieService movieService,
                                        IRootFolderService rootFolderService,
                                        IConfigService configService,
                                        ICommandResultReporter commandResultReporter,
                                        IEventAggregator eventAggregator,
                                        Logger logger)
        {
            _diskProvider = diskProvider;
            _recycleBinProvider = recycleBinProvider;
            _mediaFileService = mediaFileService;
            _movieService = movieService;
            _rootFolderService = rootFolderService;
            _configService = configService;
            _commandResultReporter = commandResultReporter;
            _eventAggregator = eventAggregator;
            _logger = logger;
        }

        public void DeleteMovieFile(Movie movie, MovieFile movieFile)
        {
            var rootFolder = _rootFolderService.GetBestRootFolderPath(movie.Path);

            if (!_diskProvider.FolderExists(rootFolder))
            {
                _logger.Warn("Movie's root folder ({0}) doesn't exist.", rootFolder);
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "Movie's root folder ({0}) doesn't exist.", rootFolder);
            }

            if (_diskProvider.GetDirectories(rootFolder).Empty())
            {
                _logger.Warn("Movie's root folder ({0}) is empty. Rescan will not update movies as a failsafe.", rootFolder);
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "Movie's root folder ({0}) is empty. Rescan will not update movies as a failsafe.", rootFolder);
            }

            if (_diskProvider.FolderExists(movie.Path))
            {
                try
                {
                    RecycleMovieFile(movie, movieFile);
                }
                catch (Exception e)
                {
                    _logger.Error(e, "Unable to delete movie file");
                    throw new NzbDroneClientException(HttpStatusCode.InternalServerError, "Unable to delete movie file");
                }
            }

            // Delete the movie file from the database to clean it up even if the file was already deleted
            _mediaFileService.Delete(movieFile, DeleteMediaFileReason.Manual);

            _eventAggregator.PublishEvent(new DeleteCompletedEvent());
        }

        public void DeleteMovieFile(MovieFile movieFile)
        {
            var fullPath = movieFile.OriginalFilePath;
            var rootFolder = _diskProvider.GetParentFolder(fullPath);

            if (!_diskProvider.FolderExists(rootFolder))
            {
                _logger.Warn("Movie's root folder ({0}) doesn't exist.", rootFolder);
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "Movie's root folder ({0}) doesn't exist.", rootFolder);
            }

            if (_diskProvider.FileExists(fullPath))
            {
                _logger.Info("Deleting movie file: {0}", fullPath);

                var subfolder = rootFolder;

                try
                {
                    _recycleBinProvider.DeleteFile(fullPath, subfolder);
                }
                catch (Exception e)
                {
                    _logger.Error(e, "Unable to delete movie file");
                    throw new NzbDroneClientException(HttpStatusCode.InternalServerError, "Unable to delete movie file");
                }
            }

            // Delete the movie file from the database to clean it up even if the file was already deleted
            _mediaFileService.Delete(movieFile, DeleteMediaFileReason.Manual);

            _eventAggregator.PublishEvent(new DeleteCompletedEvent());
        }

        public void Execute(DeleteMovieFilesCommand message)
        {
            foreach (var movieId in message.MovieIds)
            {
                try
                {
                    var movie = _movieService.GetMovie(movieId);
                    var movieFiles = _mediaFileService.GetFilesByMovie(movieId);

                    if (movieFiles.Empty())
                    {
                        _logger.Debug("No files found for movie: {0}", movie.Title);
                        continue;
                    }

                    _logger.ProgressDebug("{0}: Deleting movie files", movie.Title);

                    var rootFolder = _rootFolderService.GetBestRootFolderPath(movie.Path);

                    if (!_diskProvider.FolderExists(rootFolder))
                    {
                        _logger.Warn("Movie's root folder ({0}) doesn't exist.", rootFolder);
                        _commandResultReporter.Report(CommandResult.Indeterminate);
                        continue;
                    }

                    if (_diskProvider.GetDirectories(rootFolder).Empty())
                    {
                        _logger.Warn("Movie's root folder ({0}) is empty. Rescan will not update movies as a failsafe.", rootFolder);
                        _commandResultReporter.Report(CommandResult.Indeterminate);
                        continue;
                    }

                    foreach (var movieFile in movieFiles)
                    {
                        try
                        {
                            RecycleMovieFile(movie, movieFile);
                        }
                        catch (Exception e)
                        {
                            _logger.Error(e, "Unable to delete movie file");
                            _commandResultReporter.Report(CommandResult.Indeterminate);
                            continue;
                        }

                        // Delete the movie file from the database to clean it up even if the file was already deleted
                        _mediaFileService.Delete(movieFile, DeleteMediaFileReason.Manual);
                    }

                    _logger.ProgressDebug("{0}: Deleted movie files", movie.Title);
                }
                catch (Exception e)
                {
                    _logger.Warn(e, "Unable to delete files for movie with ID: {0}", movieId);
                    _commandResultReporter.Report(CommandResult.Indeterminate);
                }
            }

            _eventAggregator.PublishEvent(new DeleteCompletedEvent());
        }

        public void HandleAsync(MoviesDeletedEvent message)
        {
            if (message.DeleteFiles)
            {
                var movieIds = message.Movies.Map(m => m.Id).ToList();
                var allMovies = _movieService.FindByIds(movieIds);

                foreach (var movie in message.Movies)
                {
                    foreach (var s in allMovies)
                    {
                        if (s.Id == movie.Id)
                        {
                            continue;
                        }

                        if (movie.Path.IsParentPath(s.Path))
                        {
                            _logger.Error("Movie path: '{0}' is a parent of another movie, not deleting files.", movie.Path);
                            return;
                        }

                        if (movie.Path.PathEquals(s.Path))
                        {
                            _logger.Error("Movie path: '{0}' is the same as another movie, not deleting files.", movie.Path);
                            return;
                        }
                    }

                    if (_diskProvider.FolderExists(movie.Path))
                    {
                        _recycleBinProvider.DeleteFolder(movie.Path);
                    }
                }

                _eventAggregator.PublishEvent(new DeleteCompletedEvent());
            }
        }

        [EventHandleOrder(EventHandleOrder.Last)]
        public void Handle(MovieFileDeletedEvent message)
        {
            if (_configService.DeleteEmptyFolders)
            {
                string moviePath = null;
                if (message.MovieFile.Movie != null)
                {
                    var movie = message.MovieFile.Movie;
                    moviePath = movie.Path;
                    var folder = message.MovieFile.Path.GetParentPath();

                    while (moviePath.IsParentPath(folder))
                    {
                        if (_diskProvider.FolderExists(folder))
                        {
                            _diskProvider.RemoveEmptySubfolders(folder);
                        }

                        folder = folder.GetParentPath();
                    }
                }
                else
                {
                    moviePath = message.MovieFile.OriginalFilePath.GetParentPath();
                }

                _diskProvider.RemoveEmptySubfolders(moviePath);

                if (_diskProvider.FolderEmpty(moviePath))
                {
                    _diskProvider.DeleteFolder(moviePath, true);
                }
            }
        }

        private void RecycleMovieFile(Movie movie, MovieFile movieFile)
        {
            var fullPath = Path.Combine(movie.Path, movieFile.RelativePath);

            if (!_diskProvider.FileExists(fullPath))
            {
                return;
            }

            _logger.Info("Deleting movie file: {0}", fullPath);

            var subfolder = _diskProvider.GetParentFolder(movie.Path).GetRelativePath(_diskProvider.GetParentFolder(fullPath));

            _recycleBinProvider.DeleteFile(fullPath, subfolder);
        }
    }
}
