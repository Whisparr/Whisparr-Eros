using System;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class DateFilter
    {
        /// <summary>Apply date-based filter supporting both direct date comparisons and relative date formats like "in the last 7 days"</summary>
        public static void Apply<T>(PagingSpec<T> pageSpec, JsonElement element, string operation, Expression<Func<T, DateTime>> propertySelector)
        {
            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body;

            // Case 1: direct date string (e.g. "2024-01-01")
            if (element.ValueKind == JsonValueKind.String &&
                DateTime.TryParse(element.GetString(), out var directDate))
            {
                Expression comparison = operation switch
                {
                    "lessthan" => Expression.LessThan(property, Expression.Constant(directDate)),
                    "greaterthan" => Expression.GreaterThan(property, Expression.Constant(directDate)),
                    _ => null
                };

                if (comparison != null)
                {
                    var lambda = Expression.Lambda<Func<T, bool>>(comparison, param);
                    pageSpec.FilterExpressions.Add(lambda);
                }

                return;
            }

            // Case 2: relative date object: { "time": "days", "value": 7 }
            if (element.ValueKind == JsonValueKind.Object &&
                element.TryGetProperty("time", out var timeEl) &&
                element.TryGetProperty("value", out var valueEl) &&
                valueEl.TryGetInt32(out var amount))
            {
                var unit = timeEl.GetString()?.ToLowerInvariant();
                if (string.IsNullOrEmpty(unit))
                {
                    return;
                }

                var now = DateTime.UtcNow;
                var offset = operation is "innext" or "notinnext" ? amount : -amount;
                var cutoffNullable = FilterUtils.ShiftDateTime(now, unit, offset);

                if (!cutoffNullable.HasValue)
                {
                    return;
                }

                var cutoff = cutoffNullable.Value;

                switch (operation)
                {
                    case "inlast":
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.GreaterThanOrEqual(property, Expression.Constant(cutoff)),
                                param));

                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.LessThanOrEqual(property, Expression.Constant(now)),
                                param));
                        break;

                    case "notinlast":
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.LessThan(property, Expression.Constant(cutoff)),
                                param));
                        break;

                    case "innext":
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.GreaterThan(property, Expression.Constant(now)),
                                param));

                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.LessThanOrEqual(property, Expression.Constant(cutoff)),
                                param));
                        break;

                    case "notinnext":
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.GreaterThan(property, Expression.Constant(cutoff)),
                                param));
                        break;
                }
            }
        }
    }
}
