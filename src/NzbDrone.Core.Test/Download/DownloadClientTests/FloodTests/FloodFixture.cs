using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Clients.Flood;
using NzbDrone.Core.Download.Clients.Flood.Types;

namespace NzbDrone.Core.Test.Download.DownloadClientTests.FloodTests
{
    [TestFixture]
    public class FloodFixture : DownloadClientFixtureBase<Flood>
    {
        [SetUp]
        public void Setup()
        {
            Subject.Definition = new DownloadClientDefinition();
            Subject.Definition.Settings = new FloodSettings
            {
                Tags = new[] { "whisparr" },
                PostImportTags = new[] { "imported", "moved" }
            };
        }

        private Torrent CreateTorrent(string hash, params string[] tags) => new()
        {
            Name = _title,
            Directory = "somepath",
            SizeBytes = 1000,
            BytesDone = 100,
            Status = new List<string> { "downloading" },
            Tags = tags.ToList(),
        };

        [Test]
        public void get_items_should_exclude_torrents_that_already_have_all_post_import_tags()
        {
            Mocker.GetMock<IFloodProxy>()
                .Setup(s => s.GetTorrents(It.IsAny<FloodSettings>()))
                .Returns(new Dictionary<string, Torrent>
                {
                    ["HASH_POSTIMPORTED"] = CreateTorrent("HASH_POSTIMPORTED", "whisparr", "imported", "moved"),
                    ["HASH_ACTIVE"] = CreateTorrent("HASH_ACTIVE", "whisparr")
                });

            var items = Subject.GetItems().ToList();

            items.Should().HaveCount(1);
            items[0].DownloadId.Should().Be("HASH_ACTIVE");
        }

        [Test]
        public void get_items_should_include_torrents_that_have_only_some_post_import_tags()
        {
            Mocker.GetMock<IFloodProxy>()
                .Setup(s => s.GetTorrents(It.IsAny<FloodSettings>()))
                .Returns(new Dictionary<string, Torrent>
                {
                    ["HASH_POSTIMPORTED"] = CreateTorrent("HASH_POSTIMPORTED", "whisparr", "imported", "moved"),
                    ["HASH_PARTIAL"] = CreateTorrent("HASH_PARTIAL", "whisparr", "imported")
                });

            var items = Subject.GetItems().ToList();

            items.Should().HaveCount(1);
            items[0].DownloadId.Should().Be("HASH_PARTIAL");
        }

        [Test]
        public void validate_should_fail_when_post_import_tags_contain_initial_tags()
        {
            var settings = new FloodSettings
            {
                Tags = new[] { "whisparr", "imported" },
                PostImportTags = new[] { "imported" }
            };

            var result = settings.Validate();

            result.IsValid.Should().BeFalse();
        }

        [Test]
        public void validate_should_succeed_when_post_import_tags_are_disjoint_from_initial_tags()
        {
            var settings = new FloodSettings
            {
                Tags = new[] { "whisparr" },
                PostImportTags = new[] { "imported", "moved" }
            };

            var result = settings.Validate();

            result.IsValid.Should().BeTrue();
        }
    }
}
