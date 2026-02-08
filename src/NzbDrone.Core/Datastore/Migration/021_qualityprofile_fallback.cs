using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(021)]
    public class qualityprofile_fallback : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("QualityProfiles")
                .AddColumn("Fallback").AsBoolean().WithDefaultValue(false);
        }
    }
}
