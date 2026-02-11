using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(019)]
    public class extend_performer : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Performers")
                .AddColumn("Disambiguation").AsString().Nullable()
                .AddColumn("Aliases").AsString().WithDefaultValue("[]") // Empty object
                .AddColumn("BirthDate").AsDateTimeOffset().Nullable()
                .AddColumn("DeathDate").AsDateTimeOffset().Nullable()
                .AddColumn("Country").AsString().Nullable()
                .AddColumn("EyeColor").AsInt32().Nullable()
                .AddColumn("Height").AsInt32().Nullable()
                .AddColumn("CupSize").AsString().Nullable()
                .AddColumn("BandSize").AsInt32().Nullable()
                .AddColumn("WaistSize").AsInt32().Nullable()
                .AddColumn("HipSize").AsInt32().Nullable()
                .AddColumn("BreastType").AsInt32().WithDefaultValue(2)
                .AddColumn("Tattoos").AsString().WithDefaultValue("[]") // Empty object
                .AddColumn("Piercings").AsString().WithDefaultValue("[]"); // Empty object
        }
    }
}
