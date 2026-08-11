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
            ArgumentNullException.ThrowIfNull(pageSpec);

            if (filters == null || !filters.Any())
            {
                return;
            }

            filters = ValidatedFilters(filters);

            foreach (var filter in filters)
            {
                var key = filter.Key.ToLowerInvariant();
                var op = filter.Type?.ToLowerInvariant() ?? "equal";
                var jsonElement = (JsonElement)filter.Value;

                switch (key)
                {
                    case "added":
                        DateFilter.Apply(pageSpec, jsonElement, op, p => p.Added);
                        break;

                    case "genres":
                        StringArrayFilter.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.Genres);
                        break;

                    case "itemtype":
                        EnumFilterLazy.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.ItemType);

                        break;
                    case "monitored":
                        BooleanFilter.Apply<Movie>(pageSpec, jsonElement, op, p => p.Monitored);
                        break;

                    case "path":
                        StringFilter.Apply(pageSpec, jsonElement, op, p => p.Path);
                        break;

                    case "qualityprofileid":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.QualityProfileId);
                        break;

                    case "releasedate":
                        DateFilter.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.ReleaseDateUtc);
                        break;

                    case "status":
                        EnumFilterLazy.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.Status);
                        break;

                    case "runtime":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.Runtime);
                        break;

                    case "sizeondisk": // Special case due to optional inner join on MovieFile and wanting to support filtering for movies without files (size 0 or null)
                        SizeOnDiskFilter.Apply(pageSpec, jsonElement, op);
                        break;

                    case "tags": // In-memory filtering for tags, with special handling for contains and notcontains operations
                        TagsFilter.Apply(pageSpec, jsonElement, op);
                        break;

                    case "title":
                        StringFilter.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.Title);
                        break;

                    case "year":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.MovieMetadata.Value.Year);
                        break;
                }
            }
        }

        private static bool ValidateFilter(MovieFilterResource filter)
        {
            return !(
                filter == null
                || string.IsNullOrWhiteSpace(filter.Key)
                || filter.Value is not JsonElement);
        }

        private static List<MovieFilterResource> ValidatedFilters(List<MovieFilterResource> filters)
        {
            var validatedFilters = filters.Where(f => ValidateFilter(f)).ToList();
            return validatedFilters;
        }
    }
}
