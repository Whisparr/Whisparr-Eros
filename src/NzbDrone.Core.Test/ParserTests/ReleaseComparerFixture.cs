using System;
using System.Collections.Generic;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Blocklisting;
using NzbDrone.Core.History;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.ParserTests
{
    [TestFixture]
    public class ReleaseComparerFixture : CoreTest
    {
        private const long Size = 1_000_000_000;
        private static readonly DateTime PublishDate = new(2026, 9, 13, 12, 0, 0, DateTimeKind.Utc);

        [Test]
        public void nzb_should_match_the_same_publish_date()
        {
            ReleaseComparer.SameNzb(Blocklisted(), Release()).Should().BeTrue();
        }

        [Test]
        public void nzb_should_match_a_cross_post_within_two_minutes_and_two_megabytes()
        {
            var release = Release("Other Indexer", PublishDate.AddMinutes(1), Size + 1_000_000);

            ReleaseComparer.SameNzb(Blocklisted(), release).Should().BeTrue();
        }

        [Test]
        public void nzb_should_not_match_a_cross_post_more_than_two_minutes_apart()
        {
            var release = Release("Other Indexer", PublishDate.AddMinutes(3));

            ReleaseComparer.SameNzb(Blocklisted(), release).Should().BeFalse();
        }

        [Test]
        public void nzb_should_not_match_a_cross_post_more_than_two_megabytes_apart()
        {
            var release = Release("Other Indexer", PublishDate.AddMinutes(1), Size + 3_000_000);

            ReleaseComparer.SameNzb(Blocklisted(), release).Should().BeFalse();
        }

        [Test]
        public void nzb_should_not_match_a_different_publish_date_on_the_same_indexer()
        {
            var release = Release(publishDate: PublishDate.AddMinutes(1));

            ReleaseComparer.SameNzb(Blocklisted(), release).Should().BeFalse();
        }

        [Test]
        public void nzb_cross_post_should_treat_a_missing_size_as_unknown()
        {
            var release = Release("Other Indexer", PublishDate.AddMinutes(1), Size * 2);

            ReleaseComparer.SameNzb(Blocklisted(size: null), release).Should().BeTrue();
        }

        [TestCase("ABCDEF0123")]
        [TestCase("abcdef0123")]
        public void torrent_should_match_the_info_hash_ignoring_case(string infoHash)
        {
            ReleaseComparer.SameTorrent(Blocklisted(infoHash: "ABCDEF0123"), Torrent(infoHash)).Should().BeTrue();
        }

        [Test]
        public void torrent_should_not_match_a_different_info_hash()
        {
            ReleaseComparer.SameTorrent(Blocklisted(infoHash: "ABCDEF0123"), Torrent("0123ABCDEF")).Should().BeFalse();
        }

        [TestCase("Indexer", true)]
        [TestCase("indexer", true)]
        [TestCase("Other Indexer", false)]
        public void torrent_without_hash_should_compare_indexers(string indexer, bool expected)
        {
            ReleaseComparer.SameTorrent(Blocklisted(), Torrent(null, indexer)).Should().Be(expected);
        }

        [Test]
        public void torrent_without_hash_should_match_when_the_indexer_is_unknown()
        {
            ReleaseComparer.SameTorrent(Blocklisted(indexer: null), Torrent(null, "Anything")).Should().BeTrue();
        }

        [Test]
        public void should_build_a_model_from_grab_history()
        {
            var history = new MovieHistory
            {
                SourceTitle = "Studio.26.09.13.Performer.Scene.1080p.WEB-DL",
                Date = PublishDate,
                Data = new Dictionary<string, string>
                {
                    { "indexer", "Indexer" },
                    { "size", "1234" }
                }
            };

            var model = new ReleaseComparerModel(history);

            model.Title.Should().Be(history.SourceTitle);
            model.PublishedDate.Should().Be(PublishDate);
            model.Indexer.Should().Be("Indexer");
            model.Size.Should().Be(1234);
        }

        [Test]
        public void should_treat_missing_size_in_grab_history_as_unknown()
        {
            var model = new ReleaseComparerModel(new MovieHistory { Data = new Dictionary<string, string>() });

            model.Size.Should().Be(0);
            model.Indexer.Should().BeNull();
        }

        private static ReleaseComparerModel Blocklisted(string indexer = "Indexer", DateTime? publishedDate = null, long? size = Size, string infoHash = null)
        {
            return new ReleaseComparerModel(new Blocklist
            {
                SourceTitle = "Studio.26.09.13.Performer.Scene.1080p.WEB-DL",
                Indexer = indexer,
                PublishedDate = publishedDate ?? PublishDate,
                Size = size,
                TorrentInfoHash = infoHash
            });
        }

        private static ReleaseInfo Release(string indexer = "Indexer", DateTime? publishDate = null, long size = Size)
        {
            return new ReleaseInfo
            {
                Title = "Studio.26.09.13.Performer.Scene.1080p.WEB-DL",
                Indexer = indexer,
                PublishDate = publishDate ?? PublishDate,
                Size = size
            };
        }

        private static TorrentInfo Torrent(string infoHash, string indexer = "Indexer")
        {
            return new TorrentInfo
            {
                Title = "Studio.26.09.13.Performer.Scene.1080p.WEB-DL",
                Indexer = indexer,
                InfoHash = infoHash,
                PublishDate = PublishDate,
                Size = Size
            };
        }
    }
}
