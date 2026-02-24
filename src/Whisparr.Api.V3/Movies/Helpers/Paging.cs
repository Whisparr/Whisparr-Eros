using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using NzbDrone.Core.Datastore.PagedFilters;
using NzbDrone.Core.Movies;
using Whisparr.Http;

namespace Whisparr.Api.V3.Movies.Helpers
{
    public static class Paging
    {
        public static void ApplyMovieFiltersToPagingSpec(List<MovieFilterResource> filters, NzbDrone.Core.Datastore.PagingSpec<Movie> pageSpec)
        {
            if (filters == null || !filters.Any())
            {
                return;
            }

            foreach (var filter in filters)
            {
                if (filter == null || string.IsNullOrWhiteSpace(filter.Key))
                {
                    continue;
                }

                var key = filter.Key.ToLowerInvariant();
                var op = filter.Type?.ToLowerInvariant() ?? "equal";

                if (!(filter.Value is JsonElement jsonElement))
                {
                    continue;
                }

                switch (key)
                {
                    case "added": // OK
                        DateFilter.Apply(pageSpec, jsonElement, op, p => p.Added);

                        break;
                    case "itemtype": // OK
                        EnumFilterLazy.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.ItemType);

                        break;
                    case "monitored": // OK
                        BooleanFilter.Apply<Movie>(pageSpec, jsonElement, op, p => p.Monitored);

                        break;
                    case "path": // TODO: test
                        StringFilter.Apply(pageSpec, jsonElement, op, p => p.Path);

                        break;
                    case "qualityprofileid": // TODO: test
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.QualityProfileId);

                        break;
                    case "releasedate": // OK
                        DateFilter.Apply(pageSpec, jsonElement, op, p => (DateTime)p.MovieMetadata.Value.ReleaseDateUtc);

                        break;
                    case "status": // TODO: test
                        EnumFilterLazy.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.Status);

                        break;
                    case "runtime": // TODO: Test
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.Runtime);
                        break;
                    case "sizeondisk": // Special case due to optional inner join on MovieFile and wanting to support filtering for movies without files (size 0 or null)
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
                            pageSpec.FilterExpressions
                            .Add(m => m.MovieFileId == 0 || m.MovieFile.Size == 0);
                        }
                        else if (op == "notequal" && sizeOnDisk == 0)
                        {
                            // Special case: has MovieFile with size > 0
                            pageSpec.FilterExpressions
                            .Add(m => m.MovieFileId != 0 && m.MovieFile.Size > 0);
                        }
                        else
                        {
                            // Normal numeric comparison
                            NumericFilterLong.Apply(pageSpec, jsonElement, op, p => p.MovieFile.Size);
                        }

                        break;
                    case "tags": // TODO: test
                        if (jsonElement.ValueKind == JsonValueKind.Array)
                        {
                            var tagIds = jsonElement.EnumerateArray()
                                .Where(e => e.ValueKind == JsonValueKind.Number && e.TryGetInt32(out _))
                                .Select(e => e.GetInt32())
                                .ToList();
                            if (tagIds.Count > 0)
                            {
                                pageSpec.FilterExpressions.Add(m => m.Tags != null && tagIds.All(tagId => m.Tags.Contains(tagId)));
                            }
                        }

                        break;
                    case "title": // TODO: Test
                        StringFilter.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.Title);

                        break;
                    case "year": // TODO: test
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.Year);

                        break;
                }
            }
        }
    }
}
