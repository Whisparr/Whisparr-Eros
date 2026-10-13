using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore.Migration;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Datastore.Migration
{
    [TestFixture]
    public class add_performer_visibilityFixture : MigrationTest<add_performer_visibility>
    {
        [Test]
        public void should_leave_existing_performers_visible()
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

            var items = db.Query<Visibility246>("SELECT \"Visibility\" FROM \"Performers\"");

            items.Should().HaveCount(1);
            items.First().Visibility.Should().Be(1);
        }
    }

    public class Visibility246
    {
        public int Visibility { get; set; }
    }
}
