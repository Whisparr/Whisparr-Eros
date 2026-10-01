using System;
using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Download.Review
{
    [TestFixture]
    public class ReviewItemRepositoryFixture : DbTest<ReviewItemRepository, ReviewItem>
    {
        private Movie _movie;

        [SetUp]
        public void Setup()
        {
            var metadata = Builder<MovieMetadata>.CreateNew().BuildNew();
            Db.Insert(metadata);

            _movie = Builder<Movie>.CreateNew()
                                   .With(m => m.MovieMetadataId = metadata.Id)
                                   .BuildNew();
            Db.Insert(_movie);
        }

        private ReviewItem GivenItem(string guid, ReviewItemStatus status = ReviewItemStatus.Pending)
        {
            var item = new ReviewItem
            {
                MovieId = _movie.Id,
                Candidates = new List<ReviewItemCandidate>
                {
                    new () { MovieId = _movie.Id, MatchType = MovieParseMatchType.PerformersNotTitle },
                    new () { MovieId = 99 }
                },
                Title = "Helix Studios - Hot Afternoon - Dakota Lovell",
                IndexerId = 3,
                Indexer = "Indexer",
                Guid = guid,
                Size = 1234,
                Release = new ReleaseInfo { Guid = guid, Title = "Helix Studios - Hot Afternoon - Dakota Lovell", DownloadProtocol = DownloadProtocol.Torrent },
                TorrentInfo = new ReviewItemTorrentInfo { InfoHash = "ABCDEF", Seeders = 3 },
                ParsedMovieInfo = new ParsedMovieInfo { Quality = new QualityModel(Quality.Unknown) },
                Quality = new QualityModel(Quality.Unknown),
                Reason = ReviewReason.WeakMatch | ReviewReason.UnknownQuality,
                Status = status,
                ReleaseSource = ReleaseSourceType.Rss,
                Added = DateTime.UtcNow
            };

            return Subject.Insert(item);
        }

        [Test]
        public void should_round_trip_candidates_and_torrent_details()
        {
            GivenItem("guid-1");

            var stored = Subject.All().Single();

            stored.Candidates.Should().HaveCount(2);
            stored.Candidates[0].MatchType.Should().Be(MovieParseMatchType.PerformersNotTitle);
            stored.Candidates[1].MatchType.Should().BeNull();
            stored.Reason.Should().Be(ReviewReason.WeakMatch | ReviewReason.UnknownQuality);
            stored.TorrentInfo.InfoHash.Should().Be("ABCDEF");
            stored.GetRelease().Should().BeOfType<TorrentInfo>();
        }

        [Test]
        public void should_find_by_indexer_and_guid()
        {
            GivenItem("guid-1");
            GivenItem("guid-2");

            Subject.FindByGuid(3, "guid-1").Should().ContainSingle();
            Subject.FindByGuid(4, "guid-1").Should().BeEmpty();
        }

        [Test]
        public void should_count_pending_items_only()
        {
            GivenItem("guid-1");
            GivenItem("guid-2", ReviewItemStatus.Rejected);
            GivenItem("guid-3", ReviewItemStatus.Approved);

            Subject.PendingCount().Should().Be(1);
            Subject.Pending().Should().ContainSingle(i => i.Guid == "guid-1");
        }

        [Test]
        public void should_page_items_with_their_scene()
        {
            GivenItem("guid-1");
            GivenItem("guid-2", ReviewItemStatus.Rejected);

            var pagingSpec = new PagingSpec<ReviewItem>
            {
                Page = 1,
                PageSize = 10,
                SortKey = "movieMetadata.sortTitle",
                SortDirection = SortDirection.Ascending
            };

            pagingSpec.FilterExpressions.Add(r => r.Status == ReviewItemStatus.Pending);

            var result = Subject.GetPaged(pagingSpec);

            result.TotalRecords.Should().Be(1);
            result.Records.Single().Movie.Id.Should().Be(_movie.Id);
        }
    }
}
