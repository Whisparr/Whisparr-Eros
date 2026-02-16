using System.Collections.Generic;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.RootFolders
{
    public interface IImportFileRepository : IBasicRepository<ImportFile>
    {
        List<ImportFile> FindByRootFolderId(int rootFolderId);
    }

    public class ImportFileRepository : BasicRepository<ImportFile>, IImportFileRepository
    {
        public ImportFileRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        protected override bool PublishModelEvents => true;

        public List<ImportFile> FindByRootFolderId(int rootFolderId)
        {
            return Query(x => x.RootFolderId == rootFolderId);
        }
    }
}
