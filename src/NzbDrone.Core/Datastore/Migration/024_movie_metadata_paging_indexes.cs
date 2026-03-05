using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(024)]
    public class movie_metadata_paging_indexes : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.Index()
                .OnTable("MovieMetadata")
                .OnColumn("ItemType").Ascending()
                .OnColumn("CleanTitle").Ascending();

            Create.Index()
                .OnTable("MovieMetadata")
                .OnColumn("ItemType").Ascending()
                .OnColumn("SortTitle").Ascending();

            Create.Index()
                .OnTable("MovieMetadata")
                .OnColumn("ItemType").Ascending()
                .OnColumn("StudioTitle").Ascending();

            Create.Index()
                .OnTable("MovieMetadata")
                .OnColumn("ItemType").Ascending()
                .OnColumn("Status").Ascending();

            Create.Index()
                .OnTable("MovieMetadata")
                .OnColumn("ItemType").Ascending()
                .OnColumn("Runtime").Ascending();

            Create.Index()
                .OnTable("MovieMetadata")
                .OnColumn("ItemType").Ascending()
                .OnColumn("Year").Ascending();

            Create.Index()
                .OnTable("MovieMetadata")
                .OnColumn("ItemType").Ascending()
                .OnColumn("ReleaseDate").Ascending();

            Create.Index()
                .OnTable("Movies")
                .OnColumn("QualityProfileId").Ascending();

            Create.Index()
                .OnTable("Movies")
                .OnColumn("Monitored").Ascending();

            Create.Index()
                .OnTable("Movies")
                .OnColumn("Added").Ascending();
        }
    }
}
