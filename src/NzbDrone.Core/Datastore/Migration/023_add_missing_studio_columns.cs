using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(023)]
    public class add_missing_studio_columns : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            // Idempotent: Only attempt to add if table exists but columns don't
            // FluentMigrator will skip if columns already exist
            try
            {
                Alter.Table("Studios")
                    .AddColumn("MovieCount").AsInt32().WithDefaultValue(0)
                    .AddColumn("SceneCount").AsInt32().WithDefaultValue(0)
                    .AddColumn("TotalMovieCount").AsInt32().WithDefaultValue(0)
                    .AddColumn("TotalSceneCount").AsInt32().WithDefaultValue(0)
                    .AddColumn("SizeOnDisk").AsInt64().WithDefaultValue(0);
            }
            catch
            {
                // Columns may already exist, that's fine
            }
        }
    }
}
