using System.Collections.Generic;
using System.Linq;
using Dapper;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;

namespace NzbDrone.Core.MovieStats
{
    public interface IMovieStatisticsRepository
    {
        List<MovieStatistics> MovieStatistics();
        List<MovieStatistics> MovieStatistics(List<int> ids);
        List<MovieStatistics> MovieStatistics(int movieId);
        MovieIndexOverview GetMovieIndexOverview(ItemType itemType);
    }

    public class MovieStatisticsRepository : IMovieStatisticsRepository
    {
        private const string _selectMoviesTemplate = "SELECT /**select**/ FROM \"Movies\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/ /**orderby**/";
        private const string _selectMovieFilesTemplate = "SELECT /**select**/ FROM \"MovieFiles\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/ /**orderby**/";

        private readonly IMainDatabase _database;

        public MovieStatisticsRepository(IMainDatabase database)
        {
            _database = database;
        }

        public List<MovieStatistics> MovieStatistics()
        {
            return MapResults(Query(MoviesBuilder(), _selectMoviesTemplate),
                Query(MovieFilesBuilder(), _selectMovieFilesTemplate));
        }

        public List<MovieStatistics> MovieStatistics(List<int> ids)
        {
            return MapResults(Query(MoviesBuilder().Where<Movie>(m => ids.Contains(m.Id)), _selectMoviesTemplate),
                Query(MovieFilesBuilder().Where<MovieFile>(m => ids.Contains(m.MovieId)), _selectMovieFilesTemplate));
        }

        public List<MovieStatistics> MovieStatistics(int movieId)
        {
            return MapResults(Query(MoviesBuilder().Where<Movie>(x => x.Id == movieId), _selectMoviesTemplate),
                Query(MovieFilesBuilder().Where<MovieFile>(x => x.MovieId == movieId), _selectMovieFilesTemplate));
        }

        private List<MovieStatistics> MapResults(List<MovieStatistics> moviesResult, List<MovieStatistics> filesResult)
        {
            moviesResult.ForEach(e =>
            {
                var file = filesResult.SingleOrDefault(f => f.MovieId == e.MovieId);

                e.SizeOnDisk = file?.SizeOnDisk ?? 0;
                e.ReleaseGroupsString = file?.ReleaseGroupsString;
            });

            return moviesResult;
        }

        private List<MovieStatistics> Query(SqlBuilder builder, string template)
        {
            var sql = builder.AddTemplate(template).LogQuery();

            using var conn = _database.OpenConnection();

            return conn.Query<MovieStatistics>(sql.RawSql, sql.Parameters).ToList();
        }

        private SqlBuilder MoviesBuilder()
        {
            return new SqlBuilder(_database.DatabaseType)
                .Select(@"""Movies"".""Id"" AS MovieId,
                        SUM(CASE WHEN ""MovieFileId"" > 0 THEN 1 ELSE 0 END) AS MovieFileCount")
                .GroupBy<Movie>(x => x.Id);
        }

        private SqlBuilder MovieFilesBuilder()
        {
            if (_database.DatabaseType == DatabaseType.SQLite)
            {
                return new SqlBuilder(_database.DatabaseType)
                    .Select(@"""MovieId"",
                            SUM(COALESCE(""Size"", 0)) AS SizeOnDisk,
                            GROUP_CONCAT(""ReleaseGroup"", '|') AS ReleaseGroupsString")
                    .GroupBy<MovieFile>(x => x.MovieId);
            }

            return new SqlBuilder(_database.DatabaseType)
                .Select(@"""MovieId"",
                        SUM(COALESCE(""Size"", 0)) AS SizeOnDisk,
                        string_agg(""ReleaseGroup"", '|') AS ReleaseGroupsString")
                .GroupBy<MovieFile>(x => x.MovieId);
        }

        public MovieIndexOverview GetMovieIndexOverview(ItemType itemType)
        {
            var monitoredExpr = _database.DatabaseType == DatabaseType.SQLite
                ? @"SUM(CASE WHEN m.""Monitored"" = 1 THEN 1 ELSE 0 END)"
                : @"SUM(CASE WHEN m.""Monitored"" = true THEN 1 ELSE 0 END)";

            var sql = $@"
                SELECT
                    COUNT(*) AS TotalCount,
                    {monitoredExpr} AS MonitoredCount,
                    SUM(CASE WHEN m.""MovieFileId"" > 0 THEN 1 ELSE 0 END) AS MovieFiles,
                    COALESCE(SUM(mf.""Size""), 0) AS TotalFileSize
                FROM ""Movies"" m
                INNER JOIN ""MovieMetadata"" mm ON m.""MovieMetadataId"" = mm.""Id""
                LEFT JOIN ""MovieFiles"" mf ON m.""Id"" = mf.""MovieId""
                WHERE mm.""ItemType"" = @itemType";

            using var conn = _database.OpenConnection();
            return conn.QueryFirst<MovieIndexOverview>(sql, new { itemType = (int)itemType });
        }
    }
}
