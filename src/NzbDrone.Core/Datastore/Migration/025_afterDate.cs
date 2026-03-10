using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(025)]
    public class after_date_to_datetime : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Studios").AlterColumn("AfterDate").AsDateTimeOffset().Nullable();
        }
    }
}
