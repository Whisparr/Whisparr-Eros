using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Datastore.PagedFilters;
using NzbDrone.Core.Movies.Performers;
using Whisparr.Http;

namespace Whisparr.Api.V3.Performers.Helpers
{
    public static class Paging
    {
        public static void ApplyPerformerFiltersToPagingSpec(List<PerformerFilterResource> filters, PagingSpec<Performer> pageSpec)
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
                    case "age":
                        NumericFilterNullable.Apply(pageSpec, jsonElement, op, p => p.Age);
                        break;
                    case "careerend":
                        NumericFilterNullable.Apply(pageSpec, jsonElement, op, p => p.CareerEnd);
                        break;
                    case "careerstart":
                        NumericFilterNullable.Apply(pageSpec, jsonElement, op, p => p.CareerStart);
                        break;
                    case "country":
                        StringFilter.Apply(pageSpec, jsonElement, op, p => p.Country);
                        break;
                    case "ethnicity":
                        EnumFilterNullable.Apply(pageSpec, jsonElement, op, p => p.Ethnicity);
                        break;
                    case "gender":
                        EnumFilter.Apply(pageSpec, jsonElement, op, p => p.Gender);
                        break;
                    case "haircolor":
                        EnumFilterNullable.Apply(pageSpec, jsonElement, op, p => p.HairColor);
                        break;
                    case "status":
                        EnumFilter.Apply(pageSpec, jsonElement, op, p => p.Status);
                        break;
                    case "moviesmonitored":
                        BooleanFilter.Apply(pageSpec, jsonElement, op, p => p.MoviesMonitored);
                        break;
                    case "monitored":
                        BooleanFilter.Apply(pageSpec, jsonElement, op, p => p.Monitored);
                        break;
                    case "qualityprofileid":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.QualityProfileId);
                        break;
                    case "moviecount":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.MovieCount);
                        break;
                    case "scenecount":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.SceneCount);
                        break;
                    case "totalscenecount":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.TotalSceneCount);
                        break;
                    case "totalmoviecount":
                        NumericFilterInt.Apply(pageSpec, jsonElement, op, p => p.TotalMovieCount);
                        break;
                    case "sizeondisk":
                        NumericFilterLong.Apply(pageSpec, jsonElement, op, p => p.SizeOnDisk);
                        break;
                    case "tags":
                        TagsFilter.Apply(pageSpec, jsonElement, op);
                        break;
                }
            }
        }

        private static bool ValidateFilter(PerformerFilterResource filter)
        {
            return !(
                filter == null
                || string.IsNullOrWhiteSpace(filter.Key)
                || filter.Value is not JsonElement);
        }

        private static List<PerformerFilterResource> ValidatedFilters(List<PerformerFilterResource> filters)
        {
            return filters.Where(ValidateFilter).ToList();
        }
    }
}
