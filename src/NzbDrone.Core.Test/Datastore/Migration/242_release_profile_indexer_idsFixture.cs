using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore.Migration;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Datastore.Migration
{
    [TestFixture]
    public class release_profile_indexer_idsFixture : MigrationTest<release_profile_indexer_ids>
    {
        [Test]
        public void should_convert_default_value_for_indexer_id_to_empty_list()
        {
            var db = WithMigrationTestDb(c =>
            {
                c.Insert.IntoTable("ReleaseProfiles").Row(new
                {
                    Name = "Profile",
                    Enabled = true,
                    Required = "[]",
                    Ignored = "[]",
                    IndexerId = 0,
                    Tags = "[]"
                });
            });

            var releaseProfiles = db.Query<ReleaseProfile242>("SELECT \"Id\", \"Name\", \"IndexerIds\" FROM \"ReleaseProfiles\"");

            releaseProfiles.Should().HaveCount(1);
            releaseProfiles.First().Name.Should().Be("Profile");
            releaseProfiles.First().IndexerIds.Should().BeEmpty();
        }

        [Test]
        public void should_convert_single_value_for_indexer_id_to_list()
        {
            var db = WithMigrationTestDb(c =>
            {
                c.Insert.IntoTable("ReleaseProfiles").Row(new
                {
                    Name = "Profile",
                    Enabled = true,
                    Required = "[]",
                    Ignored = "[]",
                    IndexerId = 42,
                    Tags = "[]"
                });
            });

            var releaseProfiles = db.Query<ReleaseProfile242>("SELECT \"Id\", \"Name\", \"IndexerIds\" FROM \"ReleaseProfiles\"");

            releaseProfiles.Should().HaveCount(1);
            releaseProfiles.First().Name.Should().Be("Profile");
            releaseProfiles.First().IndexerIds.Should().BeEquivalentTo(new List<int> { 42 });
        }

        [Test]
        public void should_convert_each_profile_independently()
        {
            var db = WithMigrationTestDb(c =>
            {
                c.Insert.IntoTable("ReleaseProfiles").Row(new
                {
                    Name = "Any",
                    Enabled = true,
                    Required = "[]",
                    Ignored = "[]",
                    IndexerId = 0,
                    Tags = "[]"
                });

                c.Insert.IntoTable("ReleaseProfiles").Row(new
                {
                    Name = "Specific",
                    Enabled = true,
                    Required = "[]",
                    Ignored = "[]",
                    IndexerId = 7,
                    Tags = "[]"
                });
            });

            var releaseProfiles = db.Query<ReleaseProfile242>("SELECT \"Id\", \"Name\", \"IndexerIds\" FROM \"ReleaseProfiles\" ORDER BY \"Id\"");

            releaseProfiles.Should().HaveCount(2);
            releaseProfiles.First(r => r.Name == "Any").IndexerIds.Should().BeEmpty();
            releaseProfiles.First(r => r.Name == "Specific").IndexerIds.Should().BeEquivalentTo(new List<int> { 7 });
        }
    }

    public class ReleaseProfile242
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<int> IndexerIds { get; set; }
    }
}
