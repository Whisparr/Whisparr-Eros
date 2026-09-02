using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Qualities;

namespace NzbDrone.Core.Statistics;

public interface IStatisticsRepository
{
    LibraryStatistics GetLibraryStatistics(StatisticsFilter filter = null);
}

public class StatisticsRepository : IStatisticsRepository
{
    private const string _selectMoviesTemplate = "SELECT /**select**/ FROM \"Movies\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/ /**orderby**/";
    private const string _selectMovieFilesTemplate = "SELECT /**select**/ FROM \"MovieFiles\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/ /**orderby**/";
    private const string _selectQualityProfilesTemplate = "SELECT /**select**/ FROM \"QualityProfiles\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/ /**orderby**/";
    private const string _selectTagsTemplate = "SELECT /**select**/ FROM \"Tags\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/ /**orderby**/";
    private const string _selectStudiosTemplate = "SELECT /**select**/ FROM \"Studios\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/ /**orderby**/";
    private const string _selectPerformersTemplate = "SELECT /**select**/ FROM \"Performers\" /**join**/ /**innerjoin**/ /**leftjoin**/ /**where**/ /**groupby**/ /**having**/ /**orderby**/";

    // A library can carry thousands of performers and hundreds of studios, and the
    // page only charts the largest few. Returning every row made the response ~1.4MB
    // (385KB gzipped) to render ten bars, so these two breakdowns are capped in SQL.
    private const int _topEntityLimit = 25;

    private readonly IMainDatabase _database;

    public StatisticsRepository(IMainDatabase database)
    {
        _database = database;
    }

    public LibraryStatistics GetLibraryStatistics(StatisticsFilter filter = null)
    {
        var currentDate = DateTime.UtcNow;
        var movieFilter = BuildMovieFilter(filter);

        var movieCounts = QuerySingle<MovieCounts>(MoviesBuilder(currentDate, movieFilter), _selectMoviesTemplate);
        var movieFileCounts = QuerySingle<MovieFileCounts>(MovieFilesBuilder(movieFilter), _selectMovieFilesTemplate);
        var qualityProfileCounts = Query<QualityProfileCounts>(QualityProfilesBuilder(movieFilter), _selectQualityProfilesTemplate);
        var qualityProfileFileCounts = Query<QualityProfileFileCounts>(MovieFilesPerProfileBuilder(movieFilter), _selectMovieFilesTemplate);
        var qualityCounts = Query<QualityCounts>(MovieFilesPerQualityBuilder(movieFilter), _selectMovieFilesTemplate);
        var tagCounts = Query<TagCounts>(TagsBuilder(movieFilter), _selectTagsTemplate);
        var tagFileCounts = Query<TagFileCounts>(MovieFilesPerTagBuilder(movieFilter), _selectMovieFilesTemplate);
        var studioCounts = Query<StudioCounts>(StudiosBuilder(movieFilter), _selectStudiosTemplate);
        var studioFileCounts = Query<StudioFileCounts>(MovieFilesPerStudioBuilder(movieFilter), _selectMovieFilesTemplate);
        var performerCounts = Query<PerformerCounts>(PerformersBuilder(movieFilter), _selectPerformersTemplate);
        var performerFileCounts = Query<PerformerFileCounts>(MovieFilesPerPerformerBuilder(movieFilter), _selectMovieFilesTemplate);

        return new LibraryStatistics
        {
            MovieCount = movieCounts.MovieCount,
            MonitoredMovieCount = movieCounts.MonitoredMovieCount,
            DownloadedMovieCount = movieCounts.DownloadedMovieCount,
            MissingMovieCount = movieCounts.MissingMovieCount,
            UnreleasedMovieCount = movieCounts.UnreleasedMovieCount,
            TbaMovieCount = movieCounts.TbaMovieCount,
            AnnouncedMovieCount = movieCounts.AnnouncedMovieCount,
            InCinemasMovieCount = movieCounts.InCinemasMovieCount,
            ReleasedMovieCount = movieCounts.ReleasedMovieCount,
            DeletedMovieCount = movieCounts.DeletedMovieCount,
            MovieItemCount = movieCounts.MovieItemCount,
            SceneItemCount = movieCounts.SceneItemCount,
            MovieFileCount = movieFileCounts.MovieFileCount,
            SizeOnDisk = movieFileCounts.SizeOnDisk,
            QualityProfileStatistics = MapQualityProfileStatistics(qualityProfileCounts, qualityProfileFileCounts),
            QualityStatistics = MapQualityStatistics(qualityCounts),
            TagStatistics = MapTagStatistics(tagCounts, tagFileCounts),
            StudioStatistics = MapStudioStatistics(studioCounts, studioFileCounts),
            PerformerStatistics = MapPerformerStatistics(performerCounts, performerFileCounts)
        };
    }

    private string TrueIndicator => _database.DatabaseType == DatabaseType.PostgreSQL ? "true" : "1";

    // Every per-entity query is scoped by the same movie-level predicate, so it is
    // built once and reused. Parameters are carried alongside because the condition
    // is raw SQL: paths and ids are bound, never interpolated.
    private MovieFilter BuildMovieFilter(StatisticsFilter filter)
    {
        if (filter == null)
        {
            return null;
        }

        var conditions = new List<string>();
        var parameters = new DynamicParameters();

        if (filter.RootFolderPaths?.Count > 0)
        {
            var pathConditions = new List<string>();

            for (var i = 0; i < filter.RootFolderPaths.Count; i++)
            {
                // Ensure a trailing separator so '/movies' doesn't match items under '/movies2'
                var path = filter.RootFolderPaths[i];
                var separator = path.Contains('\\') ? '\\' : '/';
                var pathPrefix = path.TrimEnd('/', '\\') + separator;

                // SUBSTR instead of LIKE so characters in the path aren't treated as wildcards
                pathConditions.Add($@"SUBSTR(""Movies"".""Path"", 1, @pathPrefixLength{i}) = @pathPrefix{i}");
                parameters.Add($"pathPrefix{i}", pathPrefix, null);
                parameters.Add($"pathPrefixLength{i}", pathPrefix.Length, null);
            }

            conditions.Add(BuildConditionGroup(pathConditions, filter.RootFolderPathsNot));
        }

        if (filter.TagIds?.Count > 0)
        {
            var tagConditions = new List<string>();

            for (var i = 0; i < filter.TagIds.Count; i++)
            {
                tagConditions.Add(MovieHasTagExpression($"@tagIdFilter{i}"));
                parameters.Add($"tagIdFilter{i}", filter.TagIds[i], null);
            }

            conditions.Add(BuildConditionGroup(tagConditions, filter.TagIdsNot));
        }

        if (filter.QualityProfileIds?.Count > 0)
        {
            var profileConditions = new List<string>();

            for (var i = 0; i < filter.QualityProfileIds.Count; i++)
            {
                profileConditions.Add($@"""Movies"".""QualityProfileId"" = @qualityProfileIdFilter{i}");
                parameters.Add($"qualityProfileIdFilter{i}", filter.QualityProfileIds[i], null);
            }

            conditions.Add(BuildConditionGroup(profileConditions, filter.QualityProfileIdsNot));
        }

        if (filter.Monitored.HasValue)
        {
            conditions.Add(@"""Movies"".""Monitored"" = @monitoredFilter");
            parameters.Add("monitoredFilter", filter.Monitored.Value, null);
        }

        // ItemType lives on MovieMetadata. Expressed as a subquery rather than a join so
        // the same condition can be dropped into any builder that has "Movies" in scope,
        // including the per-file ones that never join metadata.
        if (filter.ItemTypes?.Count > 0)
        {
            var itemTypeParameters = new List<string>();

            for (var i = 0; i < filter.ItemTypes.Count; i++)
            {
                itemTypeParameters.Add($"@itemTypeFilter{i}");
                parameters.Add($"itemTypeFilter{i}", (int)filter.ItemTypes[i], null);
            }

            var itemTypeCondition =
                $@"""Movies"".""MovieMetadataId"" IN (SELECT ""Id"" FROM ""MovieMetadata"" WHERE ""ItemType"" IN ({string.Join(", ", itemTypeParameters)}))";

            conditions.Add(filter.ItemTypesNot ? $"NOT ({itemTypeCondition})" : itemTypeCondition);
        }

        if (conditions.Count == 0)
        {
            return null;
        }

        return new MovieFilter
        {
            Condition = string.Join(" AND ", conditions),
            Parameters = parameters
        };
    }

    // The filter predicate only ever names "Movies", so it can be applied to any builder
    // that has that table in scope.
    private static SqlBuilder ApplyFilter(SqlBuilder builder, MovieFilter movieFilter)
    {
        if (movieFilter == null)
        {
            return builder;
        }

        return builder.Where(movieFilter.Condition, movieFilter.Parameters);
    }

    private static string BuildConditionGroup(List<string> conditions, bool negate)
    {
        var group = $"({string.Join(" OR ", conditions)})";

        return negate ? $"NOT {group}" : group;
    }

    private string MovieHasTagExpression(string tagId)
    {
        return _database.DatabaseType == DatabaseType.PostgreSQL
            ? $@"COALESCE(""Movies"".""Tags"", '[]')::jsonb @> jsonb_build_array({tagId})"
            : $@"EXISTS (SELECT 1 FROM json_each(COALESCE(""Movies"".""Tags"", '[]')) AS ""movieTag"" WHERE ""movieTag"".""value"" = {tagId})";
    }

    private SqlBuilder MoviesBuilder(DateTime currentDate, MovieFilter movieFilter)
    {
        var parameters = new DynamicParameters();
        parameters.Add("currentDate", currentDate, null);
        parameters.Add("tba", (int)MovieStatusType.TBA, null);
        parameters.Add("announced", (int)MovieStatusType.Announced, null);
        parameters.Add("inCinemas", (int)MovieStatusType.InCinemas, null);
        parameters.Add("released", (int)MovieStatusType.Released, null);
        parameters.Add("deleted", (int)MovieStatusType.Deleted, null);
        parameters.Add("movieItem", (int)ItemType.Movie, null);
        parameters.Add("sceneItem", (int)ItemType.Scene, null);

        var trueIndicator = TrueIndicator;

        // Missing mirrors the Wanted page: monitored, released, and no file yet.
        var builder = new SqlBuilder(_database.DatabaseType)
            .Select($@"COUNT(*) AS MovieCount,
                         COALESCE(SUM(CASE WHEN ""Movies"".""Monitored"" = {trueIndicator} THEN 1 ELSE 0 END), 0) AS MonitoredMovieCount,
                         COALESCE(SUM(CASE WHEN ""Movies"".""MovieFileId"" > 0 THEN 1 ELSE 0 END), 0) AS DownloadedMovieCount,
                         COALESCE(SUM(CASE WHEN ""Movies"".""MovieFileId"" = 0 AND ""Movies"".""Monitored"" = {trueIndicator} AND ""MovieMetadata"".""ReleaseDateUtc"" IS NOT NULL AND ""MovieMetadata"".""ReleaseDateUtc"" <= @currentDate THEN 1 ELSE 0 END), 0) AS MissingMovieCount,
                         COALESCE(SUM(CASE WHEN ""Movies"".""MovieFileId"" = 0 AND (""MovieMetadata"".""ReleaseDateUtc"" IS NULL OR ""MovieMetadata"".""ReleaseDateUtc"" > @currentDate) THEN 1 ELSE 0 END), 0) AS UnreleasedMovieCount,
                         COALESCE(SUM(CASE WHEN ""MovieMetadata"".""Status"" = @tba THEN 1 ELSE 0 END), 0) AS TbaMovieCount,
                         COALESCE(SUM(CASE WHEN ""MovieMetadata"".""Status"" = @announced THEN 1 ELSE 0 END), 0) AS AnnouncedMovieCount,
                         COALESCE(SUM(CASE WHEN ""MovieMetadata"".""Status"" = @inCinemas THEN 1 ELSE 0 END), 0) AS InCinemasMovieCount,
                         COALESCE(SUM(CASE WHEN ""MovieMetadata"".""Status"" = @released THEN 1 ELSE 0 END), 0) AS ReleasedMovieCount,
                         COALESCE(SUM(CASE WHEN ""MovieMetadata"".""Status"" = @deleted THEN 1 ELSE 0 END), 0) AS DeletedMovieCount,
                         COALESCE(SUM(CASE WHEN ""MovieMetadata"".""ItemType"" = @movieItem THEN 1 ELSE 0 END), 0) AS MovieItemCount,
                         COALESCE(SUM(CASE WHEN ""MovieMetadata"".""ItemType"" = @sceneItem THEN 1 ELSE 0 END), 0) AS SceneItemCount",
                parameters)
            .Join<Movie, MovieMetadata>((m, mm) => m.MovieMetadataId == mm.Id);

        return ApplyFilter(builder, movieFilter);
    }

    private SqlBuilder MovieFilesBuilder(MovieFilter movieFilter)
    {
        var builder = new SqlBuilder(_database.DatabaseType)
            .Select(@"COUNT(*) AS MovieFileCount,
                        COALESCE(SUM(COALESCE(""MovieFiles"".""Size"", 0)), 0) AS SizeOnDisk")
;

        if (movieFilter == null)
        {
            return builder;
        }

        builder.Join<MovieFile, Movie>((f, m) => f.MovieId == m.Id);

        return ApplyFilter(builder, movieFilter);
    }

    private SqlBuilder QualityProfilesBuilder(MovieFilter movieFilter)
    {
        // Filtering in the join keeps profiles without matching movies in the results
        var movieJoin = @"""Movies"" ON ""Movies"".""QualityProfileId"" = ""QualityProfiles"".""Id""";

        if (movieFilter != null)
        {
            movieJoin += $" AND {movieFilter.Condition}";
        }

        var builder = new SqlBuilder(_database.DatabaseType)
            .Select(@"""QualityProfiles"".""Id"" AS QualityProfileId,
                        ""QualityProfiles"".""Name"" AS Name,
                        COUNT(""Movies"".""Id"") AS MovieCount")
            .LeftJoin(movieJoin, movieFilter?.Parameters)
            .GroupBy(@"""QualityProfiles"".""Id"", ""QualityProfiles"".""Name""")
            .OrderBy(@"""QualityProfiles"".""Name""");

        return builder;
    }

    private SqlBuilder MovieFilesPerProfileBuilder(MovieFilter movieFilter)
    {
        var builder = new SqlBuilder(_database.DatabaseType)
            .Select(@"""Movies"".""QualityProfileId"" AS QualityProfileId,
                        COUNT(*) AS MovieFileCount,
                        COALESCE(SUM(COALESCE(""MovieFiles"".""Size"", 0)), 0) AS SizeOnDisk")
            .Join<MovieFile, Movie>((f, m) => f.MovieId == m.Id)
            .GroupBy(@"""Movies"".""QualityProfileId""");

        return ApplyFilter(builder, movieFilter);
    }

    private SqlBuilder MovieFilesPerQualityBuilder(MovieFilter movieFilter)
    {
        var qualityExpression = _database.DatabaseType == DatabaseType.PostgreSQL
            ? @"(""MovieFiles"".""Quality""::json->>'quality')::int"
            : @"CAST(JSON_EXTRACT(""MovieFiles"".""Quality"", '$.quality') AS INTEGER)";

        var builder = new SqlBuilder(_database.DatabaseType)
            .Select($@"{qualityExpression} AS QualityId,
                        COUNT(*) AS MovieFileCount,
                        COALESCE(SUM(COALESCE(""MovieFiles"".""Size"", 0)), 0) AS SizeOnDisk")
            .GroupBy(qualityExpression);

        if (movieFilter != null)
        {
            builder.Join<MovieFile, Movie>((f, m) => f.MovieId == m.Id)
;
            ApplyFilter(builder, movieFilter);
        }

        return builder;
    }

    private SqlBuilder TagsBuilder(MovieFilter movieFilter)
    {
        // Filtering in the join keeps tags without matching movies in the results
        var movieJoin = $@"""Movies"" ON {MovieHasTagExpression(@"""Tags"".""Id""")}";

        if (movieFilter != null)
        {
            movieJoin += $" AND {movieFilter.Condition}";
        }

        var builder = new SqlBuilder(_database.DatabaseType)
            .Select(@"""Tags"".""Id"" AS TagId,
                        ""Tags"".""Label"" AS Label,
                        COUNT(""Movies"".""Id"") AS MovieCount")
            .LeftJoin(movieJoin, movieFilter?.Parameters)
            .GroupBy(@"""Tags"".""Id"", ""Tags"".""Label""")
            .OrderBy(@"""Tags"".""Label""");

        return builder;
    }

    private SqlBuilder MovieFilesPerTagBuilder(MovieFilter movieFilter)
    {
        var builder = new SqlBuilder(_database.DatabaseType)
            .Select(@"""Tags"".""Id"" AS TagId,
                        COUNT(*) AS MovieFileCount,
                        COALESCE(SUM(COALESCE(""MovieFiles"".""Size"", 0)), 0) AS SizeOnDisk")
            .Join<MovieFile, Movie>((f, m) => f.MovieId == m.Id)
            .Join($@"""Tags"" ON {MovieHasTagExpression(@"""Tags"".""Id""")}")
            .GroupBy(@"""Tags"".""Id""");

        return ApplyFilter(builder, movieFilter);
    }

    // Studios hang off MovieMetadata by foreign id rather than a join table, so the
    // metadata join is unconditional here regardless of what the filter needs.
    private SqlBuilder StudiosBuilder(MovieFilter movieFilter)
    {
        var metadataJoin = @"""MovieMetadata"" ON ""MovieMetadata"".""StudioForeignId"" = ""Studios"".""ForeignId""";
        var movieJoin = @"""Movies"" ON ""Movies"".""MovieMetadataId"" = ""MovieMetadata"".""Id""";

        if (movieFilter != null)
        {
            movieJoin += $" AND {movieFilter.Condition}";
        }

        return new SqlBuilder(_database.DatabaseType)
            .Select(@"""Studios"".""ForeignId"" AS StudioForeignId,
                        ""Studios"".""Title"" AS Title,
                        COUNT(""Movies"".""Id"") AS MovieCount")
            .LeftJoin(metadataJoin)
            .LeftJoin(movieJoin, movieFilter?.Parameters)
            .GroupBy(@"""Studios"".""ForeignId"", ""Studios"".""Title""")
            .Having(@"COUNT(""Movies"".""Id"") > 0")
            .OrderBy($@"COUNT(""Movies"".""Id"") DESC LIMIT {_topEntityLimit}");
    }

    private SqlBuilder MovieFilesPerStudioBuilder(MovieFilter movieFilter)
    {
        var builder = new SqlBuilder(_database.DatabaseType)
            .Select(@"""MovieMetadata"".""StudioForeignId"" AS StudioForeignId,
                        COUNT(*) AS MovieFileCount,
                        COALESCE(SUM(COALESCE(""MovieFiles"".""Size"", 0)), 0) AS SizeOnDisk")
            .Join<MovieFile, Movie>((f, m) => f.MovieId == m.Id)
            .Join(@"""MovieMetadata"" ON ""MovieMetadata"".""Id"" = ""Movies"".""MovieMetadataId""")
            .Where(@"""MovieMetadata"".""StudioForeignId"" IS NOT NULL")
            .GroupBy(@"""MovieMetadata"".""StudioForeignId""");

        return ApplyFilter(builder, movieFilter);
    }

    // Performers reach movies through Credits, which keys on the performer's foreign
    // id rather than its row id.
    private SqlBuilder PerformersBuilder(MovieFilter movieFilter)
    {
        var creditJoin = @"""Credits"" ON ""Credits"".""PerformerForeignId"" = ""Performers"".""ForeignId""";
        var metadataJoin = @"""MovieMetadata"" ON ""MovieMetadata"".""Id"" = ""Credits"".""MovieMetadataId""";
        var movieJoin = @"""Movies"" ON ""Movies"".""MovieMetadataId"" = ""MovieMetadata"".""Id""";

        if (movieFilter != null)
        {
            movieJoin += $" AND {movieFilter.Condition}";
        }

        return new SqlBuilder(_database.DatabaseType)
            .Select(@"""Performers"".""ForeignId"" AS PerformerForeignId,
                        ""Performers"".""Name"" AS Name,
                        COUNT(DISTINCT ""Movies"".""Id"") AS MovieCount")
            .LeftJoin(creditJoin)
            .LeftJoin(metadataJoin)
            .LeftJoin(movieJoin, movieFilter?.Parameters)
            .GroupBy(@"""Performers"".""ForeignId"", ""Performers"".""Name""")
            .Having(@"COUNT(DISTINCT ""Movies"".""Id"") > 0")
            .OrderBy($@"COUNT(DISTINCT ""Movies"".""Id"") DESC LIMIT {_topEntityLimit}");
    }

    private SqlBuilder MovieFilesPerPerformerBuilder(MovieFilter movieFilter)
    {
        var builder = new SqlBuilder(_database.DatabaseType)
            .Select(@"""Credits"".""PerformerForeignId"" AS PerformerForeignId,
                        COUNT(*) AS MovieFileCount,
                        COALESCE(SUM(COALESCE(""MovieFiles"".""Size"", 0)), 0) AS SizeOnDisk")
            .Join<MovieFile, Movie>((f, m) => f.MovieId == m.Id)
            .Join(@"""MovieMetadata"" ON ""MovieMetadata"".""Id"" = ""Movies"".""MovieMetadataId""")
            .Join(@"""Credits"" ON ""Credits"".""MovieMetadataId"" = ""MovieMetadata"".""Id""")
            .GroupBy(@"""Credits"".""PerformerForeignId""");

        return ApplyFilter(builder, movieFilter);
    }

    private static List<QualityProfileStatistics> MapQualityProfileStatistics(List<QualityProfileCounts> profileCounts, List<QualityProfileFileCounts> fileCounts)
    {
        var fileCountsByProfile = fileCounts.ToDictionary(f => f.QualityProfileId);

        return profileCounts.Select(p =>
        {
            var files = fileCountsByProfile.GetValueOrDefault(p.QualityProfileId);

            return new QualityProfileStatistics
            {
                QualityProfileId = p.QualityProfileId,
                Name = p.Name,
                MovieCount = p.MovieCount,
                MovieFileCount = files?.MovieFileCount ?? 0,
                SizeOnDisk = files?.SizeOnDisk ?? 0
            };
        }).ToList();
    }

    private static List<QualityStatistics> MapQualityStatistics(List<QualityCounts> qualityCounts)
    {
        return qualityCounts.OrderBy(q => q.QualityId)
                            .Select(q => new QualityStatistics
                            {
                                Quality = Quality.FindById(q.QualityId),
                                MovieFileCount = q.MovieFileCount,
                                SizeOnDisk = q.SizeOnDisk
                            })
                            .ToList();
    }

    private static List<TagStatistics> MapTagStatistics(List<TagCounts> tagCounts, List<TagFileCounts> fileCounts)
    {
        var fileCountsByTag = fileCounts.ToDictionary(f => f.TagId);

        return tagCounts.Select(t =>
        {
            var files = fileCountsByTag.GetValueOrDefault(t.TagId);

            return new TagStatistics
            {
                TagId = t.TagId,
                Label = t.Label,
                MovieCount = t.MovieCount,
                MovieFileCount = files?.MovieFileCount ?? 0,
                SizeOnDisk = files?.SizeOnDisk ?? 0
            };
        }).ToList();
    }

    private static List<StudioStatistics> MapStudioStatistics(List<StudioCounts> studioCounts, List<StudioFileCounts> fileCounts)
    {
        var fileCountsByStudio = fileCounts.Where(f => f.StudioForeignId != null)
                                           .ToDictionary(f => f.StudioForeignId);

        return studioCounts.Select(s =>
        {
            var files = fileCountsByStudio.GetValueOrDefault(s.StudioForeignId ?? string.Empty);

            return new StudioStatistics
            {
                StudioForeignId = s.StudioForeignId,
                Title = s.Title,
                MovieCount = s.MovieCount,
                MovieFileCount = files?.MovieFileCount ?? 0,
                SizeOnDisk = files?.SizeOnDisk ?? 0
            };
        }).ToList();
    }

    private static List<PerformerStatistics> MapPerformerStatistics(List<PerformerCounts> performerCounts, List<PerformerFileCounts> fileCounts)
    {
        var fileCountsByPerformer = fileCounts.Where(f => f.PerformerForeignId != null)
                                              .ToDictionary(f => f.PerformerForeignId);

        return performerCounts.Select(p =>
        {
            var files = fileCountsByPerformer.GetValueOrDefault(p.PerformerForeignId ?? string.Empty);

            return new PerformerStatistics
            {
                PerformerForeignId = p.PerformerForeignId,
                Name = p.Name,
                MovieCount = p.MovieCount,
                MovieFileCount = files?.MovieFileCount ?? 0,
                SizeOnDisk = files?.SizeOnDisk ?? 0
            };
        }).ToList();
    }

    private T QuerySingle<T>(SqlBuilder builder, string template)
    {
        return Query<T>(builder, template).Single();
    }

    private List<T> Query<T>(SqlBuilder builder, string template)
    {
        var sql = builder.AddTemplate(template).LogQuery();

        using var conn = _database.OpenConnection();

        return conn.Query<T>(sql.RawSql, sql.Parameters).ToList();
    }

    private class MovieFilter
    {
        public string Condition { get; set; }
        public DynamicParameters Parameters { get; set; }
    }

    private class MovieCounts
    {
        public int MovieCount { get; set; }
        public int MonitoredMovieCount { get; set; }
        public int DownloadedMovieCount { get; set; }
        public int MissingMovieCount { get; set; }
        public int UnreleasedMovieCount { get; set; }
        public int TbaMovieCount { get; set; }
        public int AnnouncedMovieCount { get; set; }
        public int InCinemasMovieCount { get; set; }
        public int ReleasedMovieCount { get; set; }
        public int DeletedMovieCount { get; set; }
        public int MovieItemCount { get; set; }
        public int SceneItemCount { get; set; }
    }

    private class MovieFileCounts
    {
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    private class QualityProfileCounts
    {
        public int QualityProfileId { get; set; }
        public string Name { get; set; }
        public int MovieCount { get; set; }
    }

    private class QualityProfileFileCounts
    {
        public int QualityProfileId { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    private class QualityCounts
    {
        public int QualityId { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    private class TagCounts
    {
        public int TagId { get; set; }
        public string Label { get; set; }
        public int MovieCount { get; set; }
    }

    private class TagFileCounts
    {
        public int TagId { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    private class StudioCounts
    {
        public string StudioForeignId { get; set; }
        public string Title { get; set; }
        public int MovieCount { get; set; }
    }

    private class StudioFileCounts
    {
        public string StudioForeignId { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    private class PerformerCounts
    {
        public string PerformerForeignId { get; set; }
        public string Name { get; set; }
        public int MovieCount { get; set; }
    }

    private class PerformerFileCounts
    {
        public string PerformerForeignId { get; set; }
        public int MovieFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }
}
