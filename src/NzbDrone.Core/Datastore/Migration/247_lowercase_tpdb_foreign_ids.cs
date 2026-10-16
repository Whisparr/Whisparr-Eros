using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(247)]
    public class lowercase_tpdb_foreign_ids : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            // TPDB movies were stored as "tpdbId:<id>" while every reader matches "tpdbid:" case-sensitively.
            // Skip a row whose lowercase twin already exists, since ForeignId is unique.
            LowercaseTpdbPrefix("MovieMetadata");
            LowercaseTpdbPrefix("ImportExclusions");
        }

        private void LowercaseTpdbPrefix(string table)
        {
            Execute.Sql($@"UPDATE ""{table}""
                SET ""ForeignId"" = 'tpdbid:' || SUBSTR(""ForeignId"", 8)
                WHERE SUBSTR(""ForeignId"", 1, 7) = 'tpdbId:'
                AND NOT EXISTS (
                    SELECT 1 FROM ""{table}"" ""Twin""
                    WHERE ""Twin"".""ForeignId"" = 'tpdbid:' || SUBSTR(""{table}"".""ForeignId"", 8))");
        }
    }
}
