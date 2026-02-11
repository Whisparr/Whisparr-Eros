using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(022)]
    public class add_importfolderfiles : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.TableForModel("ImportFiles")
                .WithColumn("Path").AsString()
                .WithColumn("RelativePath").AsString()
                .WithColumn("Name").AsString()
                .WithColumn("RootFolderId").AsInt32().Indexed();
        }
    }
}
