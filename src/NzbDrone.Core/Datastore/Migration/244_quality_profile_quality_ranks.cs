using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(244)]
    public class quality_profile_quality_ranks : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.TableForModel("QualityProfileQualityRanks")
                .WithColumn("ProfileId").AsInt32().NotNullable()
                .WithColumn("QualityId").AsInt32().NotNullable()
                .WithColumn("Score").AsDouble().NotNullable();

            Create.Index()
                .OnTable("QualityProfileQualityRanks")
                .OnColumn("ProfileId").Ascending()
                .OnColumn("QualityId").Ascending()
                .WithOptions().Unique();

            IfDatabase(ProcessorIdConstants.SQLite).Execute.Sql(
                "CREATE INDEX \"IX_History_QualityId\" ON \"History\" (json_extract(\"Quality\", '$.quality'));");
            IfDatabase(ProcessorIdConstants.PostgreSQL).Execute.Sql(
                "CREATE INDEX \"IX_History_QualityId\" ON \"History\" (((\"Quality\"::jsonb ->> 'quality')::int));");

            IfDatabase(ProcessorIdConstants.SQLite).Execute.Sql(
                "CREATE INDEX \"IX_MovieFiles_QualityId\" ON \"MovieFiles\" (json_extract(\"Quality\", '$.quality'));");
            IfDatabase(ProcessorIdConstants.PostgreSQL).Execute.Sql(
                "CREATE INDEX \"IX_MovieFiles_QualityId\" ON \"MovieFiles\" (((\"Quality\"::jsonb ->> 'quality')::int));");

            IfDatabase(ProcessorIdConstants.SQLite).Execute.Sql(
                "CREATE INDEX \"IX_Blocklist_QualityId\" ON \"Blocklist\" (json_extract(\"Quality\", '$.quality'));");
            IfDatabase(ProcessorIdConstants.PostgreSQL).Execute.Sql(
                "CREATE INDEX \"IX_Blocklist_QualityId\" ON \"Blocklist\" (((\"Quality\"::jsonb ->> 'quality')::int));");
        }
    }
}
