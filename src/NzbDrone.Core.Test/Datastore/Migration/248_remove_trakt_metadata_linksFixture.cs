using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.Datastore.Migration;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Datastore.Migration
{
    [TestFixture]
    public class remove_trakt_metadata_linksFixture : MigrationTest<remove_trakt_metadata_links>
    {
        [Test]
        public void should_remove_trakt_from_gotify_and_move_preferred_link_to_first_remaining()
        {
            var db = WithMigrationTestDb(c =>
            {
                InsertNotification(c, "Gotify", new { MetadataLinks = new[] { 1, 2 }, PreferredMetadataLink = 2 });
            });

            var settings = GetSettings(db).Single();

            settings.MetadataLinks.Should().Equal(1);
            settings.PreferredMetadataLink.Should().Be(1);
        }

        [Test]
        public void should_reset_gotify_preferred_link_to_tmdb_when_trakt_was_the_only_link()
        {
            var db = WithMigrationTestDb(c =>
            {
                InsertNotification(c, "Gotify", new { MetadataLinks = new[] { 2 }, PreferredMetadataLink = 2 });
            });

            var settings = GetSettings(db).Single();

            settings.MetadataLinks.Should().BeEmpty();
            settings.PreferredMetadataLink.Should().Be(0);
        }

        [Test]
        public void should_keep_gotify_preferred_link_that_is_not_trakt()
        {
            var db = WithMigrationTestDb(c =>
            {
                InsertNotification(c, "Gotify", new { MetadataLinks = new[] { 0, 2, 1 }, PreferredMetadataLink = 1 });
            });

            var settings = GetSettings(db).Single();

            settings.MetadataLinks.Should().Equal(0, 1);
            settings.PreferredMetadataLink.Should().Be(1);
        }

        [Test]
        public void should_remove_trakt_from_telegram_and_keep_other_settings()
        {
            var db = WithMigrationTestDb(c =>
            {
                InsertNotification(c, "Telegram", new { ChatId = "123", MetadataLinks = new[] { 2, 0 } });
            });

            var settings = GetSettings(db).Single();

            settings.MetadataLinks.Should().Equal(0);
            settings.PreferredMetadataLink.Should().BeNull();
            settings.ChatId.Should().Be("123");
        }

        [Test]
        public void should_remove_trakt_from_pushcut_and_keep_other_settings()
        {
            var db = WithMigrationTestDb(c =>
            {
                InsertNotification(c, "Pushcut", new { NotificationName = "Whisparr", MetadataLinks = new[] { 1, 2 } });
            });

            var settings = GetSettings(db).Single();

            settings.MetadataLinks.Should().Equal(1);
            settings.PreferredMetadataLink.Should().BeNull();
            settings.NotificationName.Should().Be("Whisparr");
        }

        [Test]
        public void should_not_rewrite_settings_without_trakt()
        {
            var original = "{\"metadataLinks\":[0,1],\"preferredMetadataLink\":1}";

            var db = WithMigrationTestDb(c =>
            {
                InsertNotification(c, "Gotify", original);
            });

            db.Query<RawNotification248>("SELECT \"Settings\" FROM \"Notifications\"").Single().Settings.Should().Be(original);
        }

        [Test]
        public void should_not_change_other_implementations()
        {
            var original = "{\"metadataLinks\":[2]}";

            var db = WithMigrationTestDb(c =>
            {
                InsertNotification(c, "Webhook", original);
            });

            db.Query<RawNotification248>("SELECT \"Settings\" FROM \"Notifications\"").Single().Settings.Should().Be(original);
        }

        private static void InsertNotification(remove_trakt_metadata_links migration, string implementation, object settings)
        {
            InsertNotification(migration, implementation, settings.ToJson());
        }

        private static void InsertNotification(remove_trakt_metadata_links migration, string implementation, string settings)
        {
            migration.Insert.IntoTable("Notifications").Row(new
            {
                Name = implementation,
                OnGrab = true,
                OnDownload = true,
                OnRename = false,
                Implementation = implementation,
                ConfigContract = $"{implementation}Settings",
                Tags = "[]",
                Settings = settings
            });
        }

        private static IEnumerable<MetadataLinkSettings248> GetSettings(IDirectDataMapper db)
        {
            return db.Query<NotificationDefinition248>("SELECT \"Settings\" FROM \"Notifications\"").Select(n => n.Settings);
        }
    }

    public class RawNotification248
    {
        public string Settings { get; set; }
    }

    public class NotificationDefinition248
    {
        public MetadataLinkSettings248 Settings { get; set; }
    }

    public class MetadataLinkSettings248
    {
        public string ChatId { get; set; }
        public string NotificationName { get; set; }
        public List<int> MetadataLinks { get; set; }
        public int? PreferredMetadataLink { get; set; }
    }
}
