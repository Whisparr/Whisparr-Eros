using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(246)]
    public class add_performer_visibility : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Performers").AddColumn("Visibility").AsInt32().WithDefaultValue(1);
        }
    }
}
