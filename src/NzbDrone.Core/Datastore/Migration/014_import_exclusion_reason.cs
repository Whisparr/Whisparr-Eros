using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(014)]
    public class import_exclusion_reason : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            // Add 'Reason' column to 'ImportExclusions' table with default value 0 (Manual)
            Alter.Table("ImportExclusions").AddColumn("Reason").AsInt32().WithDefaultValue(0);
        }
    }
}
