using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Profiles.Qualities
{
    // Sorting by quality means sorting by the row's position in its profile, which is not a value
    // stored on the row: the quality id lives inside a JSON column and the ordering lives in
    // QualityProfileQualityRanks. Three paged queries need the same join, so it is built here
    // rather than copied into each of them.
    public static class QualityRankJoin
    {
        public const string RankAlias = "r";
        public const string SortExpression = "COALESCE(\"r\".\"Score\", -1)";

        public static string Build(DatabaseType databaseType, string qualityTable, string profileTable)
        {
            var qualityIdExpression = databaseType == DatabaseType.PostgreSQL
                ? $"(\"{qualityTable}\".\"Quality\"::jsonb ->> 'quality')::int"
                : $"json_extract(\"{qualityTable}\".\"Quality\", '$.quality')";

            return $"\"QualityProfileQualityRanks\" AS \"{RankAlias}\" " +
                   $"ON \"{RankAlias}\".\"ProfileId\" = \"{profileTable}\".\"QualityProfileId\" " +
                   $"AND \"{RankAlias}\".\"QualityId\" = {qualityIdExpression}";
        }
    }
}
