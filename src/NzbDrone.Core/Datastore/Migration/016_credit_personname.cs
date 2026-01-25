using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(016)]
    public class credit_personname : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Credits")
                .AddColumn("Images").AsString().WithDefaultValue("[]") // Empty object
                .AddColumn("PersonName").AsString().WithDefaultValue("");

            // CSV List of performer foreign IDs associated with the Movie/Scene
            Alter.Table("MovieMetadata")
                .AddColumn("PerformerNames").AsString().Nullable()
                .AddColumn("PerformerForeignIds").AsString().Nullable();
        }
    }
}
