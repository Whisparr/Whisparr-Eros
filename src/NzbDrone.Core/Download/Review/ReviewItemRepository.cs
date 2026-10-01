using System.Collections.Generic;
using Dapper;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;

namespace NzbDrone.Core.Download.Review
{
    public interface IReviewItemRepository : IBasicRepository<ReviewItem>
    {
        List<ReviewItem> FindByGuid(int indexerId, string guid);
        List<ReviewItem> FindByTitle(int indexerId, string title);
        List<ReviewItem> Pending();
        int PendingCount();
    }

    public class ReviewItemRepository : BasicRepository<ReviewItem>, IReviewItemRepository
    {
        public ReviewItemRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<ReviewItem> FindByGuid(int indexerId, string guid)
        {
            return Query(x => x.IndexerId == indexerId && x.Guid == guid);
        }

        public List<ReviewItem> FindByTitle(int indexerId, string title)
        {
            return Query(x => x.IndexerId == indexerId && x.Title == title);
        }

        public List<ReviewItem> Pending()
        {
            return Query(x => x.Status == ReviewItemStatus.Pending);
        }

        public int PendingCount()
        {
            using var conn = _database.OpenConnection();

            return conn.ExecuteScalar<int>("SELECT COUNT(*) FROM \"ReviewItems\" WHERE \"Status\" = @Status", new { Status = (int)ReviewItemStatus.Pending });
        }

        public override PagingSpec<ReviewItem> GetPaged(PagingSpec<ReviewItem> pagingSpec)
        {
            pagingSpec.Records = GetPagedRecords(PagedBuilder(), pagingSpec, PagedQuery);

            var countTemplate = $"SELECT COUNT(*) FROM (SELECT /**select**/ FROM \"{TableMapping.Mapper.TableNameMapping(typeof(ReviewItem))}\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/) AS \"Inner\"";
            pagingSpec.TotalRecords = GetPagedRecordCount(PagedBuilder().Select(typeof(ReviewItem)), pagingSpec, countTemplate);

            return pagingSpec;
        }

        protected override SqlBuilder PagedBuilder() => Builder()
            .Join<ReviewItem, Movie>((r, m) => r.MovieId == m.Id)
            .LeftJoin<Movie, MovieMetadata>((m, mm) => m.MovieMetadataId == mm.Id);

        protected override IEnumerable<ReviewItem> PagedQuery(SqlBuilder builder) =>
            _database.QueryJoined<ReviewItem, Movie>(builder, (reviewItem, movie) =>
            {
                reviewItem.Movie = movie;
                return reviewItem;
            });
    }
}
