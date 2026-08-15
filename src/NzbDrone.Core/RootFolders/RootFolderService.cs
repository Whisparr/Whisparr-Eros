using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using NLog;
using NzbDrone.Common;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Instrumentation.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Profiles.Qualities;

namespace NzbDrone.Core.RootFolders
{
    public interface IRootFolderService
    {
        List<RootFolder> All();
        List<RootFolder> AllWithImportFiles();
        RootFolder Add(RootFolder rootDir);
        void Remove(int id);
        RootFolder Get(int id);
        RootFolder Refresh(int id);
        string GetBestRootFolderPath(string path, List<RootFolder> rootFolders = null);
    }

    public class RootFolderService : IRootFolderService
    {
        private readonly IRootFolderRepository _rootFolderRepository;
        private readonly IQualityProfileRepository _profileRepository;
        private readonly IImportFileRepository _importFileRepository;
        private readonly IDiskProvider _diskProvider;
        private readonly IMovieRepository _movieRepository;
        private readonly IConfigService _configService;
        private readonly INamingConfigService _namingConfigService;
        private readonly Logger _logger;

        private readonly ICached<string> _cache;

        private static readonly HashSet<string> SpecialFolders = new HashSet<string>
                                                                 {
                                                                     "$recycle.bin",
                                                                     "system volume information",
                                                                     "recycler",
                                                                     "lost+found",
                                                                     ".appledb",
                                                                     ".appledesktop",
                                                                     ".appledouble",
                                                                     "@eadir",
                                                                     ".grab"
                                                                 };
        private static readonly Regex ExcludedSubFoldersRegex = new Regex(@"(?:\\|\/|^)(?:@eadir|\.@__thumb|plex versions|\.[^\\/]+)(?:\\|\/)", RegexOptions.Compiled | RegexOptions.IgnoreCase, RegexDefaults.Timeout);
        private static readonly Regex ExcludedFilesRegex = new Regex(@"^\._|^Thumbs\.db$", RegexOptions.Compiled | RegexOptions.IgnoreCase, RegexDefaults.Timeout);

        public RootFolderService(IRootFolderRepository rootFolderRepository,
                                    IQualityProfileRepository profileRepository,
                                    IImportFileRepository importFileRepository,
                                    IDiskProvider diskProvider,
                                    IMovieRepository movieRepository,
                                    IConfigService configService,
                                    INamingConfigService namingConfigService,
                                    ICacheManager cacheManager,
                                    Logger logger)
        {
            _rootFolderRepository = rootFolderRepository;
            _profileRepository = profileRepository;
            _importFileRepository = importFileRepository;
            _diskProvider = diskProvider;
            _movieRepository = movieRepository;
            _configService = configService;
            _namingConfigService = namingConfigService;
            _logger = logger;

            _cache = cacheManager.GetCache<string>(GetType());
        }

        public List<RootFolder> All()
        {
            var rootFolders = _rootFolderRepository.All().ToList();

            return rootFolders;
        }

        public List<RootFolder> AllWithImportFiles()
        {
            var rootFolders = _rootFolderRepository.All().ToList();

            var moviePaths = _movieRepository.AllMoviePaths();

            rootFolders.ForEach(folder =>
            {
                try
                {
                    if (folder.Path.IsPathValid(PathValidationType.CurrentOs))
                    {
                        GetDetails(folder, moviePaths, true);
                    }
                }

                // We don't want an exception to prevent the root folders from loading in the UI, so they can still be deleted
                catch (Exception ex)
                {
                    _logger.Error(ex, "Unable to get free space and unmapped folders for root folder {0}", folder.Path);
                    folder.ImportFiles = new List<ImportFile>();
                }
            });

            return rootFolders;
        }

        public RootFolder Add(RootFolder rootFolder)
        {
            var all = All();

            if (string.IsNullOrWhiteSpace(rootFolder.Path) || !Path.IsPathRooted(rootFolder.Path))
            {
                throw new ArgumentException("Invalid path");
            }

            if (!_diskProvider.FolderExists(rootFolder.Path))
            {
                throw new DirectoryNotFoundException("Can't add root directory that doesn't exist.");
            }

            if (all.Exists(r => r.Path.PathEquals(rootFolder.Path)))
            {
                throw new InvalidOperationException("Recent directory already exists.");
            }

            if (!_diskProvider.FolderWritable(rootFolder.Path))
            {
                throw new UnauthorizedAccessException($"Root folder path '{rootFolder.Path}' is not writable by user '{Environment.UserName}'");
            }

            _rootFolderRepository.Insert(rootFolder);

            var moviePaths = _movieRepository.AllMoviePaths();

            GetDetails(rootFolder, moviePaths, true);
            _cache.Clear();

            return rootFolder;
        }

        public void Remove(int id)
        {
            _rootFolderRepository.Delete(id);
            _cache.Clear();
        }

        private List<UnmappedFolder> GetUnmappedFolders(string path, Dictionary<int, string> moviePaths)
        {
            _logger.Debug("Generating list of unmapped folders");

            if (string.IsNullOrEmpty(path))
            {
                throw new ArgumentException("Invalid path provided", nameof(path));
            }

            var results = new List<UnmappedFolder>();

            if (!_diskProvider.FolderExists(path))
            {
                _logger.Debug("Path supplied does not exist: {0}", path);
                return results;
            }

            var config = _namingConfigService.GetConfig().MovieFolderFormat;
            var firstSeparatorIndex = config.IndexOfAny(new char[] { '\\', '/' });
            var movieConfig = firstSeparatorIndex >= 0 ? config.Substring(firstSeparatorIndex + 1) : config;

            var subFolderDepth = movieConfig.Count(f => f == Path.DirectorySeparatorChar);
            var possibleMovieFolders = _diskProvider.GetDirectories(path).ToList();

            if (subFolderDepth > 0)
            {
                for (var i = 0; i < subFolderDepth; i++)
                {
                    possibleMovieFolders = possibleMovieFolders.SelectMany(_diskProvider.GetDirectories).ToList();
                }
            }

            var unmappedFolders = possibleMovieFolders.Except(moviePaths.Select(s => s.Value), PathEqualityComparer.Instance).ToList();

            var recycleBinPath = _configService.RecycleBin;

            foreach (var unmappedFolder in unmappedFolders)
            {
                var di = new DirectoryInfo(unmappedFolder.Normalize());

                if ((!di.Attributes.HasFlag(FileAttributes.System) && !di.Attributes.HasFlag(FileAttributes.Hidden)) || di.Attributes.ToString() == "-1")
                {
                    if (string.IsNullOrWhiteSpace(recycleBinPath) || di.FullName.PathNotEquals(recycleBinPath))
                    {
                        results.Add(new UnmappedFolder
                        {
                            Name = di.Name,
                            Path = di.FullName,
                            RelativePath = path.GetRelativePath(di.FullName)
                        });
                    }
                }
            }

            var setToRemove = SpecialFolders;
            results.RemoveAll(x => setToRemove.Contains(new DirectoryInfo(x.Path.ToLowerInvariant()).Name));

            _logger.Debug("{0} unmapped folders detected.", results.Count);
            return results.OrderBy(u => u.Name, StringComparer.InvariantCultureIgnoreCase).ToList();
        }

        public RootFolder Get(int id)
        {
            var rootFolder = _rootFolderRepository.Get(id);

            rootFolder.ImportFiles = _importFileRepository.FindByRootFolderId(rootFolder.Id);

            return rootFolder;
        }

        public string GetBestRootFolderPath(string path, List<RootFolder> rootFolders = null)
        {
            return _cache.Get(path, () => GetBestRootFolderPathInternal(path, rootFolders), TimeSpan.FromDays(1));
        }

        private void GetDetails(RootFolder rootFolder, Dictionary<int, string> moviePaths, bool timeout, bool getMovieFolder = false)
        {
            Task.Run(() =>
            {
                if (_diskProvider.FolderExists(rootFolder.Path))
                {
                    rootFolder.Accessible = true;
                    rootFolder.FreeSpace = _diskProvider.GetAvailableSpace(rootFolder.Path);
                    rootFolder.TotalSpace = _diskProvider.GetTotalSize(rootFolder.Path);
                    rootFolder.ImportFiles = _importFileRepository.FindByRootFolderId(rootFolder.Id);
                }
            }).Wait(timeout ? 5000 : -1);
        }

        private string GetBestRootFolderPathInternal(string path, List<RootFolder> rootFolders = null)
        {
            var allRootFoldersToConsider = rootFolders ?? All();

            var possibleRootFolder = allRootFoldersToConsider.Where(r => r.Path.IsParentPath(path)).MaxBy(r => r.Path.Length);

            if (possibleRootFolder == null)
            {
                var osPath = new OsPath(path);

                return osPath.Directory.ToString().GetCleanPath();
            }

            return possibleRootFolder.Path.GetCleanPath();
        }

        public RootFolder Refresh(int id)
        {
            var rootFolder = Get(id);

            // We want to make sure we have the latest movie paths in case any have been added or removed since the root folder was loaded
            var importFolder = GetImportFolder(rootFolder.Path);

            var folderExists = _diskProvider.FolderExists(importFolder);

            var mediaFileList = new List<string>();

            if (folderExists)
            {
                _logger.ProgressInfo("Scanning {0}", importFolder);

                var files = FilterFiles(importFolder, GetVideoFiles(importFolder).ToList());

                if (!files.Any())
                {
                    _logger.Warn("Scan folder {0} is empty.", importFolder);
                }

                mediaFileList.AddRange(files);

                _logger.ProgressInfo("Scanning {0} files found in {1}", mediaFileList.Count, importFolder);
            }

            var existingUnmappedFiles = _importFileRepository.FindByRootFolderId(id);

            var newUnmappedFiles = mediaFileList.Select(f => new ImportFile
            {
                RootFolderId = id,
                Path = f,
                RelativePath = importFolder.GetRelativePath(f),
                Name = Path.GetFileName(f)
            }).ToList();

            var toAdd = newUnmappedFiles.Where(n => !existingUnmappedFiles.Any(e => e.Path.PathEquals(n.Path))).ToList();
            var toRemove = existingUnmappedFiles.Where(e => !newUnmappedFiles.Any(n => n.Path.PathEquals(e.Path))).ToList();

            _logger.ProgressInfo("Scanning Adding {0} new files to the database in {1}", toAdd.Count, importFolder);
            _logger.ProgressInfo("Scanning Cleaning {0} old files from the database in {1}", toRemove.Count, importFolder);

            _importFileRepository.InsertMany(toAdd);
            _importFileRepository.DeleteMany(toRemove.Select(u => u.Id).ToList());

            var moviePaths = _movieRepository.AllMoviePaths();
            GetDetails(rootFolder, moviePaths, true);

            _logger.ProgressInfo("Scanning {0} Completed", importFolder);
            return rootFolder;
        }

        private string GetImportFolder(string folder)
        {
            var rootFolder = folder;
            var namingConfig = _namingConfigService.GetConfig();
            var pattern = namingConfig.SceneImportFolderFormat ?? NamingConfig.Default.SceneImportFolderFormat;
            var sceneImportFolderName = pattern.Split(new char[] { '\\', '/' }, StringSplitOptions.RemoveEmptyEntries)[0];
            return Path.Combine(rootFolder, sceneImportFolderName);
        }

        private List<string> FilterFiles(string basePath, List<string> files)
        {
            return files.Where(file => !ExcludedSubFoldersRegex.IsMatch(basePath.GetRelativePath(file)))
                        .Where(file => !ExcludedFilesRegex.IsMatch(file))
                        .ToList();
        }

        private string[] GetVideoFiles(string path, bool allDirectories = true)
        {
            _logger.Debug("Scanning '{0}' for video files", path);

            var filesOnDisk = _diskProvider.GetFiles(path, allDirectories).ToList();

            var mediaFileList = filesOnDisk.Where(file => MediaFileExtensions.Extensions.Contains(Path.GetExtension(file)))
                                           .ToList();

            _logger.Trace("{0} files were found in {1}", filesOnDisk.Count, path);
            _logger.Debug("{0} video files were found in {1}", mediaFileList.Count, path);

            return mediaFileList.ToArray();
        }
    }
}
