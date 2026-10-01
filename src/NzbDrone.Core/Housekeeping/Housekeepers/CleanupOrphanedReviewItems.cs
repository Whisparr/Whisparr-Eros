using Dapper;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Housekeeping.Housekeepers
{
    public class CleanupOrphanedReviewItems : IHousekeepingTask
    {
        private readonly IMainDatabase _database;

        public CleanupOrphanedReviewItems(IMainDatabase database)
        {
            _database = database;
        }

        public void Clean()
        {
            using var mapper = _database.OpenConnection();

            mapper.Execute(@"DELETE FROM ""ReviewItems""
                             WHERE ""Id"" IN (
                             SELECT ""ReviewItems"".""Id"" FROM ""ReviewItems""
                             LEFT OUTER JOIN ""Movies""
                             ON ""ReviewItems"".""MovieId"" = ""Movies"".""Id""
                             WHERE ""Movies"".""Id"" IS NULL)");
        }
    }
}
