using System;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Housekeeping.Housekeepers;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Housekeeping.Housekeepers
{
    [TestFixture]
    public class CleanupOrphanedReviewItemsFixture : DbTest<CleanupOrphanedReviewItems, ReviewItem>
    {
        private void GivenReviewItem(int movieId)
        {
            var item = Builder<ReviewItem>.CreateNew()
                .With(h => h.MovieId = movieId)
                .With(h => h.Added = DateTime.UtcNow)
                .With(h => h.Quality = new QualityModel(Quality.Unknown))
                .With(h => h.ParsedMovieInfo = new ParsedMovieInfo())
                .With(h => h.Release = new ReleaseInfo())
                .With(h => h.TorrentInfo = null)
                .BuildNew();

            Db.Insert(item);
        }

        [Test]
        public void should_delete_items_of_deleted_scenes()
        {
            GivenReviewItem(123);

            Subject.Clean();

            AllStoredModels.Should().BeEmpty();
        }

        [Test]
        public void should_keep_items_of_existing_scenes()
        {
            var movie = Builder<Movie>.CreateNew().BuildNew();

            Db.Insert(movie);

            GivenReviewItem(movie.Id);

            Subject.Clean();

            AllStoredModels.Should().HaveCount(1);
        }
    }
}
