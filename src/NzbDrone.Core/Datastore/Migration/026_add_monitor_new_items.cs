using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(026)]
    public class add_monitor_new_items : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Performers").AddColumn("WhisparrMonitorNewItems").AsBoolean().NotNullable().WithDefaultValue(true);
            Alter.Table("Studios").AddColumn("WhisparrMonitorNewItems").AsBoolean().NotNullable().WithDefaultValue(true);
            Alter.Table("Collections").AddColumn("WhisparrMonitorNewItems").AsBoolean().NotNullable().WithDefaultValue(true);
        }
    }
}
