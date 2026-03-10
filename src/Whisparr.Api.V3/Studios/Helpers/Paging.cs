using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Datastore.PagedFilters;
using NzbDrone.Core.Movies.Studios;
using Whisparr.Http;

namespace Whisparr.Api.V3.Studios.Helpers
{
    public static class Paging
    {
        public static void ApplyStudioFiltersToPagingSpec(List<StudioFilterResource> filters, PagingSpec<Studio> pageSpec)
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

                if (!(filter.Value is JsonElement jsonElement))
                {
                    continue;
                }

                switch (key)
                {
                    case "monitored":
                        BooleanFilter.Apply(pageSpec, jsonElement, op, s => s.Monitored);
                        break;
                    case "moviesmonitored":
                        BooleanFilter.Apply(pageSpec, jsonElement, op, s => s.MoviesMonitored);
                        break;
                    case "qualityprofileid":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.QualityProfileId);
                        break;
                    case "title":
                        StringFilter.Apply(pageSpec, jsonElement, op, s => s.Title);
                        break;
                    case "status":
                        EnumFilter.Apply(pageSpec, jsonElement, op, s => s.Status);
                        break;
                    case "moviecount":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, s => s.MovieCount);
                        break;
                    case "scenecount":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, s => s.SceneCount);
                        break;
                    case "totalmoviecount":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, s => s.TotalMovieCount);
                        break;
                    case "totalscenecount":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, s => s.TotalSceneCount);
                        break;
                    case "sizeondisk":
                        NumericFilterLong.Apply(pageSpec, jsonElement, op, s => s.SizeOnDisk);
                        break;
                    case "network":
                        StringFilter.Apply(pageSpec, jsonElement, op, s => s.Network);
                        break;
                    case "tags":
                        TagsFilter.Apply(pageSpec, jsonElement, op);
                        break;
                }
            }
        }

        private static bool ValidateFilter(StudioFilterResource filter)
        {
            return !(
                filter == null
                || string.IsNullOrWhiteSpace(filter.Key)
                || filter.Value is not JsonElement);
        }

        private static List<StudioFilterResource> ValidatedFilters(List<StudioFilterResource> filters)
        {
            return filters.Where(ValidateFilter).ToList();
        }
    }
}
