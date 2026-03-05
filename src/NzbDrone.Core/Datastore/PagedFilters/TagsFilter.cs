using System.Linq;
using System.Text.Json;
using NzbDrone.Core.Movies;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class TagsFilter
    {
        /// <summary>Apply tags filter, with special-casing for contains and notcontains operations</summary>
        /// <param name="pageSpec">The paging specification to which the filter expressions will be added</param>
        /// <param name="jsonElement">The JSON element containing the filter value, expected to be an array of integers representing tag IDs</param>
        /// <param name="op">The filter operation, expected to be either "contains" or "notcontains"</param>
        /// <remarks>This method is designed to handle paging for in-memory filtering</remarks>
        public static void Apply(PagingSpec<Movie> pageSpec, JsonElement jsonElement, string op)
        {
            if (jsonElement.ValueKind != JsonValueKind.Array)
            {
                return;
            }

            var tagIds = jsonElement.EnumerateArray()
                .Where(e => e.ValueKind == JsonValueKind.Number && e.TryGetInt32(out _))
                .Select(e => e.GetInt32())
                .ToList();

            // For "contains", we want movies that have any of the specified tags
            if (op == "contains")
            {
                pageSpec.FilterExpressions.Add(m => m.Tags != null && tagIds.Any(tagId => m.Tags.Contains(tagId)));
            }

            // For "notcontains", we want movies that do not have any of the specified tags
            else if (op == "notcontains")
            {
                pageSpec.FilterExpressions.Add(m => m.Tags == null || !m.Tags.Any(tagId => tagIds.Contains(tagId)));
            }
        }
    }
}
