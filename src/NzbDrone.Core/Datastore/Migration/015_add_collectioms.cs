using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(015)]
    public class add_collectioms : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.TableForModel("Collections")
                .WithColumn("TmdbId").AsInt32().Unique()
                .WithColumn("QualityProfileId").AsInt32()
                .WithColumn("RootFolderPath").AsString()
                .WithColumn("SearchOnAdd").AsBoolean()
                .WithColumn("Title").AsString()
                .WithColumn("SortTitle").AsString().Nullable()
                .WithColumn("CleanTitle").AsString()
                .WithColumn("Overview").AsString().Nullable()
                .WithColumn("Images").AsString().WithDefaultValue("[]")
                .WithColumn("Monitored").AsBoolean().WithDefaultValue(false)
                .WithColumn("Added").AsDateTimeOffset().Nullable()
                .WithColumn("LastInfoSync").AsDateTimeOffset().Nullable()
                .WithColumn("Tags").AsString().Nullable();

            Alter.Table("MovieMetadata").AddColumn("CollectionTmdbId").AsInt32().Nullable()
                            .AddColumn("CollectionTitle").AsString().Nullable();
        }
    }
}
