using System;
using Dapper;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Housekeeping.Housekeepers
{
    public class CleanupOldReviewItems : IHousekeepingTask
    {
        // Indexers have long since dropped a release nobody reviewed in a month; approved and rejected
        // items are kept as long so the same release isn't offered again while indexers still return it
        public const int MaxAgeDays = 30;

        private readonly IMainDatabase _database;

        public CleanupOldReviewItems(IMainDatabase database)
        {
            _database = database;
        }

        public void Clean()
        {
            using var mapper = _database.OpenConnection();

            mapper.Execute(@"DELETE FROM ""ReviewItems""
                             WHERE ""Added"" < @Cutoff",
                new { Cutoff = DateTime.UtcNow.AddDays(-MaxAgeDays) });
        }
    }
}
