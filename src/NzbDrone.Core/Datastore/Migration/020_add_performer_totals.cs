using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(020)]
    public class add_performer_totals : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Performers")
                .AddColumn("TotalSceneCount").AsInt32().WithDefaultValue(0)
                .AddColumn("TotalMovieCount").AsInt32().WithDefaultValue(0)
                .AddColumn("SceneCount").AsInt32().WithDefaultValue(0)
                .AddColumn("MovieCount").AsInt32().WithDefaultValue(0)
                .AddColumn("SizeOnDisk").AsInt64().WithDefaultValue(0);
        }
    }
}
