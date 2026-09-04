using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Profiles.Qualities;

namespace NzbDrone.Core.Blocklisting
{
    public interface IBlocklistRepository : IBasicRepository<Blocklist>
    {
        List<Blocklist> BlocklistedByTitle(int movieId, string sourceTitle);
        List<Blocklist> BlocklistedByTorrentInfoHash(int movieId, string torrentInfoHash);
        List<Blocklist> BlocklistedByMovie(int movieId);
        void DeleteForMovies(List<int> movieIds);
    }

    public class BlocklistRepository : BasicRepository<Blocklist>, IBlocklistRepository
    {
        public BlocklistRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<Blocklist> BlocklistedByTitle(int movieId, string sourceTitle)
        {
            return Query(x => x.MovieId == movieId && x.SourceTitle.Contains(sourceTitle));
        }

        public List<Blocklist> BlocklistedByTorrentInfoHash(int movieId, string torrentInfoHash)
        {
            return Query(x => x.MovieId == movieId && x.TorrentInfoHash.Contains(torrentInfoHash));
        }

        public List<Blocklist> BlocklistedByMovie(int movieId)
        {
            var builder = Builder().Join<Blocklist, Movie>((h, a) => h.MovieId == a.Id)
                                   .Where<Blocklist>(h => h.MovieId == movieId);

            return _database.QueryJoined<Blocklist, Movie>(builder, (blocklist, movie) =>
            {
                blocklist.Movie = movie;
                return blocklist;
            }).OrderByDescending(h => h.Date).ToList();
        }

        public void DeleteForMovies(List<int> movieIds)
        {
            Delete(x => movieIds.Contains(x.MovieId));
        }

        public override PagingSpec<Blocklist> GetPaged(PagingSpec<Blocklist> pagingSpec)
        {
            var sortingByQuality = string.Equals(pagingSpec.SortKey, "quality", StringComparison.OrdinalIgnoreCase);
            var customSortExpression = sortingByQuality ? QualityRankJoin.SortExpression : null;

            pagingSpec.Records = GetPagedRecords(PagedBuilder(sortingByQuality), pagingSpec, PagedQuery, customSortExpression);

            var countTemplate = $"SELECT COUNT(*) FROM (SELECT /**select**/ FROM \"{TableMapping.Mapper.TableNameMapping(typeof(Blocklist))}\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/) AS \"Inner\"";
            pagingSpec.TotalRecords = GetPagedRecordCount(PagedBuilder(sortingByQuality).Select(typeof(Blocklist)), pagingSpec, countTemplate);

            return pagingSpec;
        }

        protected override SqlBuilder PagedBuilder() => PagedBuilder(false);

        private SqlBuilder PagedBuilder(bool joinQualityRanks)
        {
            var builder = Builder()
                .Join<Blocklist, Movie>((b, m) => b.MovieId == m.Id)
                .LeftJoin<Movie, MovieMetadata>((m, mm) => m.MovieMetadataId == mm.Id);

            if (joinQualityRanks)
            {
                builder.LeftJoin(QualityRankJoin.Build(_database.DatabaseType, "Blocklist", "Movies"));
            }

            return builder;
        }

        protected override IEnumerable<Blocklist> PagedQuery(SqlBuilder builder) =>
            _database.QueryJoined<Blocklist, Movie>(builder, (blocklist, movie) =>
            {
                blocklist.Movie = movie;
                return blocklist;
            });
    }
}
