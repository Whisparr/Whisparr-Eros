using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore.Migration;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Datastore.Migration
{
    [TestFixture]
    public class add_monitor_new_itemsFixture : MigrationTest<add_monitor_new_items>
    {
        [Test]
        public void should_default_monitor_new_items_to_true_for_existing_performers()
        {
            var db = WithMigrationTestDb(c =>
            {
                c.Insert.IntoTable("Performers").Row(new
                {
                    ForeignId = "performer-foreign-id",
                    QualityProfileId = 1,
                    RootFolderPath = "/movies",
                    SearchOnAdd = false,
                    Name = "Existing Performer",
                    CleanName = "existingperformer",
                    Gender = 0,
                    Status = 0,
                    Tags = "[]"
                });
            });

            var items = db.Query<MonitorNewItems026>("SELECT \"MonitorNewItems\" FROM \"Performers\"");

            items.Should().HaveCount(1);
            items.First().MonitorNewItems.Should().BeTrue();
        }

        [Test]
        public void should_default_monitor_new_items_to_true_for_existing_studios()
        {
            var db = WithMigrationTestDb(c =>
            {
                c.Insert.IntoTable("Studios").Row(new
                {
                    ForeignId = "studio-foreign-id",
                    QualityProfileId = 1,
                    RootFolderPath = "/movies",
                    SearchOnAdd = false,
                    Title = "Existing Studio",
                    CleanTitle = "existingstudio",
                    Images = "[]",
                    Monitored = false,
                    MoviesMonitored = false,
                    Status = 0,
                    TmdbId = 0,
                    MovieCount = 0,
                    SceneCount = 0,
                    TotalMovieCount = 0,
                    TotalSceneCount = 0,
                    SizeOnDisk = 0,
                    Tags = "[]"
                });
            });

            var items = db.Query<MonitorNewItems026>("SELECT \"MonitorNewItems\" FROM \"Studios\"");

            items.Should().HaveCount(1);
            items.First().MonitorNewItems.Should().BeTrue();
        }

        [Test]
        public void should_default_monitor_new_items_to_true_for_existing_collections()
        {
            var db = WithMigrationTestDb(c =>
            {
                c.Insert.IntoTable("Collections").Row(new
                {
                    TmdbId = 123456,
                    QualityProfileId = 1,
                    RootFolderPath = "/movies",
                    SearchOnAdd = false,
                    Title = "Existing Collection",
                    CleanTitle = "existingcollection"
                });
            });

            var items = db.Query<MonitorNewItems026>("SELECT \"MonitorNewItems\" FROM \"Collections\"");

            items.Should().HaveCount(1);
            items.First().MonitorNewItems.Should().BeTrue();
        }

        private class MonitorNewItems026
        {
            public bool MonitorNewItems { get; set; }
        }
    }
}
