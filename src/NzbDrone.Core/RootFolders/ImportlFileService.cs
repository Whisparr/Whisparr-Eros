using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.RootFolders
{
    public interface IImportlFileService
    {
        List<ImportFile> All();
        ImportFile Add(ImportFile importFile);
        void Remove(int id);
        ImportFile Get(int id);

        List<ImportFile> FindByRootFolderId(int rootFolderId);
    }

    public class ImportlFileService : IImportlFileService
    {
        private readonly IImportFileRepository _importFileRepository;
        private readonly IDiskProvider _diskProvider;

        public ImportlFileService(IImportFileRepository importFileRepository,
                                 IDiskProvider diskProvider)
        {
            _importFileRepository = importFileRepository;
            _diskProvider = diskProvider;
        }

        public List<ImportFile> All()
        {
            var rootFolders = _importFileRepository.All().ToList();

            return rootFolders;
        }

        public ImportFile Add(ImportFile importFile)
        {
            var all = All();

            if (string.IsNullOrWhiteSpace(importFile.Path) || !Path.IsPathRooted(importFile.Path))
            {
                throw new ArgumentException("Invalid path");
            }

            if (!_diskProvider.FolderExists(importFile.Path))
            {
                throw new DirectoryNotFoundException("Can't add root directory that doesn't exist.");
            }

            if (all.Exists(r => r.Path.PathEquals(importFile.Path)))
            {
                throw new InvalidOperationException("Recent directory already exists.");
            }

            if (!_diskProvider.FolderWritable(importFile.Path))
            {
                throw new UnauthorizedAccessException($"Root folder path '{importFile.Path}' is not writable by user '{Environment.UserName}'");
            }

            _importFileRepository.Insert(importFile);

            return importFile;
        }

        public void Remove(int id)
        {
            _importFileRepository.Delete(id);
        }

        public ImportFile Get(int id)
        {
            return _importFileRepository.Get(id);
        }

        public List<ImportFile> FindByRootFolderId(int rootFolderId)
        {
            return _importFileRepository.FindByRootFolderId(rootFolderId);
        }
    }
}
