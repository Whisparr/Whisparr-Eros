using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(246)]
    public class add_review_queue : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.TableForModel("ReviewItems")
                .WithColumn("MovieId").AsInt32().Indexed()
                .WithColumn("Candidates").AsString()
                .WithColumn("Title").AsString()
                .WithColumn("IndexerId").AsInt32().WithDefaultValue(0)
                .WithColumn("Indexer").AsString().Nullable()
                .WithColumn("Guid").AsString().Nullable().Indexed()
                .WithColumn("Size").AsInt64().WithDefaultValue(0)
                .WithColumn("Release").AsString()
                .WithColumn("TorrentInfo").AsString().Nullable()
                .WithColumn("ParsedMovieInfo").AsString().Nullable()
                .WithColumn("Quality").AsString()
                .WithColumn("Reason").AsInt32().WithDefaultValue(0)
                .WithColumn("Status").AsInt32().WithDefaultValue(0).Indexed()
                .WithColumn("ReleaseSource").AsInt32().WithDefaultValue(0)
                .WithColumn("Added").AsDateTimeOffset();

            Alter.Table("Notifications").AddColumn("OnReviewNeeded").AsBoolean().WithDefaultValue(false);
        }
    }
}
