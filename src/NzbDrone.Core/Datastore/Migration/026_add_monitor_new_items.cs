using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(026)]
    public class add_monitor_new_items : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Performers").AddColumn("MonitorNewItems").AsBoolean().NotNullable().WithDefaultValue(true);
            Alter.Table("Studios").AddColumn("MonitorNewItems").AsBoolean().NotNullable().WithDefaultValue(true);
            Alter.Table("Collections").AddColumn("MonitorNewItems").AsBoolean().NotNullable().WithDefaultValue(true);
        }
    }
}
