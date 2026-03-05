using System;
using System.Linq;
using System.Text.Json;
using NzbDrone.Core.Movies;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class SizeOnDiskFilter
    {
        /// <summary>Apply size-on-disk filter, with special-casing for zero (no file or file with size 0)</summary>
        public static void Apply(PagingSpec<Movie> pageSpec, JsonElement jsonElement, string op)
        {
            ArgumentNullException.ThrowIfNull(pageSpec);

            long sizeOnDisk = 0;

            if (jsonElement.ValueKind == JsonValueKind.Array)
            {
                sizeOnDisk = jsonElement.EnumerateArray()
                    .Where(e => e.ValueKind == JsonValueKind.Number)
                    .Select(e => e.GetInt64())
                    .FirstOrDefault();
            }
            else if (jsonElement.ValueKind == JsonValueKind.Number &&
                     jsonElement.TryGetInt64(out var size))
            {
                sizeOnDisk = size;
            }

            if (op == "equal" && sizeOnDisk == 0)
            {
                // Special case: no MovieFile OR size == 0
                pageSpec.FilterExpressions.Add(m => m.MovieFileId == 0 || m.MovieFile.Size == 0);
            }
            else if (op == "notequal" && sizeOnDisk == 0)
            {
                // Special case: has MovieFile with size > 0
                pageSpec.FilterExpressions.Add(m => m.MovieFileId != 0 && m.MovieFile.Size > 0);
            }
            else
            {
                // Normal numeric comparison
                NumericFilterLong.Apply(pageSpec, jsonElement, op, p => p.MovieFile.Size);
            }
        }
    }
}
