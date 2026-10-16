using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore.Migration;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Datastore.Migration
{
    [TestFixture]
    public class lowercase_tpdb_foreign_idsFixture : MigrationTest<lowercase_tpdb_foreign_ids>
    {
        private static void InsertMetadata(FluentMigrator.Builders.Insert.IInsertExpressionRoot insert, string foreignId)
        {
            insert.IntoTable("MovieMetadata").Row(new
            {
                ForeignId = foreignId,
                MetadataSource = 2,
                Images = "[]",
                Title = foreignId,
                OriginalLanguage = 1,
                Status = 1,
                Runtime = 0,
                Recommendations = "[]",
                ItemType = 0
            });
        }

        [Test]
        public void should_lowercase_tpdb_movie_foreign_ids()
        {
            var db = WithMigrationTestDb(c =>
            {
                InsertMetadata(c.Insert, "tpdbId:d534a2e3-b77a-4aac-95f6-e5671faf7165");
                InsertMetadata(c.Insert, "42019");
                InsertMetadata(c.Insert, "3f8a2c1e-5b7d-4e9a-8c6f-1d2e3f4a5b6c");
            });

            var ids = db.Query<ForeignId247>("SELECT \"ForeignId\" || '' AS \"ForeignId\" FROM \"MovieMetadata\"").Select(x => x.ForeignId);

            ids.Should().BeEquivalentTo(
                "tpdbid:d534a2e3-b77a-4aac-95f6-e5671faf7165",
                "42019",
                "3f8a2c1e-5b7d-4e9a-8c6f-1d2e3f4a5b6c");
        }

        [Test]
        public void should_leave_camel_cased_row_when_lowercase_twin_exists()
        {
            var db = WithMigrationTestDb(c =>
            {
                InsertMetadata(c.Insert, "tpdbId:d534a2e3-b77a-4aac-95f6-e5671faf7165");
                InsertMetadata(c.Insert, "tpdbid:d534a2e3-b77a-4aac-95f6-e5671faf7165");
            });

            var ids = db.Query<ForeignId247>("SELECT \"ForeignId\" || '' AS \"ForeignId\" FROM \"MovieMetadata\"").Select(x => x.ForeignId);

            ids.Should().BeEquivalentTo(
                "tpdbId:d534a2e3-b77a-4aac-95f6-e5671faf7165",
                "tpdbid:d534a2e3-b77a-4aac-95f6-e5671faf7165");
        }

        [Test]
        public void should_lowercase_tpdb_import_exclusions()
        {
            var db = WithMigrationTestDb(c =>
            {
                c.Insert.IntoTable("ImportExclusions").Row(new
                {
                    ForeignId = "tpdbId:d534a2e3-b77a-4aac-95f6-e5671faf7165",
                    MovieTitle = "Excluded",
                    MovieYear = 2020
                });
            });

            var ids = db.Query<ForeignId247>("SELECT \"ForeignId\" || '' AS \"ForeignId\" FROM \"ImportExclusions\"").Select(x => x.ForeignId);

            ids.Should().BeEquivalentTo("tpdbid:d534a2e3-b77a-4aac-95f6-e5671faf7165");
        }
    }

    public class ForeignId247
    {
        public string ForeignId { get; set; }
    }
}
