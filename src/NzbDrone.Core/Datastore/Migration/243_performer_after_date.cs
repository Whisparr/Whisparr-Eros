using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(243)]
    public class performer_after_date : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Performers").AddColumn("AfterDate").AsDateTimeOffset().Nullable();
        }
    }
}
