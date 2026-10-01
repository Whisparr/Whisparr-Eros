using System;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Housekeeping.Housekeepers;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Housekeeping.Housekeepers
{
    [TestFixture]
    public class CleanupOldReviewItemsFixture : DbTest<CleanupOldReviewItems, ReviewItem>
    {
        private void GivenReviewItem(int ageDays, ReviewItemStatus status)
        {
            var item = Builder<ReviewItem>.CreateNew()
                .With(h => h.Added = DateTime.UtcNow.AddDays(-ageDays))
                .With(h => h.Status = status)
                .With(h => h.Quality = new QualityModel(Quality.Unknown))
                .With(h => h.ParsedMovieInfo = new ParsedMovieInfo())
                .With(h => h.Release = new ReleaseInfo())
                .With(h => h.TorrentInfo = null)
                .BuildNew();

            Db.Insert(item);
        }

        [TestCase(ReviewItemStatus.Pending)]
        [TestCase(ReviewItemStatus.Approved)]
        [TestCase(ReviewItemStatus.Rejected)]
        public void should_delete_items_older_than_30_days(ReviewItemStatus status)
        {
            GivenReviewItem(CleanupOldReviewItems.MaxAgeDays + 1, status);

            Subject.Clean();

            AllStoredModels.Should().BeEmpty();
        }

        [Test]
        public void should_keep_recent_items()
        {
            GivenReviewItem(CleanupOldReviewItems.MaxAgeDays - 1, ReviewItemStatus.Pending);

            Subject.Clean();

            AllStoredModels.Should().HaveCount(1);
        }
    }
}
