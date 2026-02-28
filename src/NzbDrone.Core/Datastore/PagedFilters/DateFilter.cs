using System;
using System.Globalization;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class DateFilter
    {
        private const string INNEXT = "innext";
        private const string NOTINNEXT = "notinnext";
        private const string INLAST = "inlast";
        private const string NOTINLAST = "notinlast";

        /// <summary>Apply date-based filter for nullable DateTime? properties.</summary>
        public static void Apply<T>(PagingSpec<T> pageSpec, JsonElement element, string operation, Expression<Func<T, DateTime?>> propertySelector)
        {
            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body; // type: DateTime?

            // Constants must be typed as DateTime? to match the property; WhereBuilderSqlite strips the Convert node.
            static Expression C(DateTime value) => Expression.Convert(Expression.Constant(value), typeof(DateTime?));

            if (element.ValueKind == JsonValueKind.String &&
                DateTime.TryParse(element.GetString(), CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out var directDate))
            {
                Expression comparison = operation switch
                {
                    "lessthan" => Expression.LessThan(property, C(directDate)),
                    "greaterthan" => Expression.GreaterThan(property, C(directDate)),
                    _ => null
                };

                if (comparison != null)
                {
                    pageSpec.FilterExpressions.Add(Expression.Lambda<Func<T, bool>>(comparison, param));
                }

                return;
            }

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
                var offset = operation is INNEXT or NOTINNEXT ? amount : -amount;
                var cutoffNullable = FilterUtils.ShiftDateTime(now, unit, offset);

                if (!cutoffNullable.HasValue)
                {
                    return;
                }

                var cutoff = cutoffNullable.Value;

                switch (operation)
                {
                    case INLAST:
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.GreaterThanOrEqual(property, C(cutoff)),
                                param));

                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.LessThanOrEqual(property, C(now)),
                                param));
                        break;

                    case NOTINLAST:
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.LessThan(property, C(cutoff)),
                                param));
                        break;

                    case INNEXT:
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.GreaterThan(property, C(now)),
                                param));

                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.LessThanOrEqual(property, C(cutoff)),
                                param));
                        break;

                    case NOTINNEXT:
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.GreaterThan(property, C(cutoff)),
                                param));
                        break;
                }
            }
        }

        /// <summary>Apply date-based filter supporting both direct date comparisons and relative date formats like "in the last 7 days"</summary>
        public static void Apply<T>(PagingSpec<T> pageSpec, JsonElement element, string operation, Expression<Func<T, DateTime>> propertySelector)
        {
            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body;

            // Case 1: direct date string (e.g. "2024-01-01")
            if (element.ValueKind == JsonValueKind.String &&
                DateTime.TryParse(element.GetString(), CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out var directDate))
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
                var offset = operation is INNEXT or NOTINNEXT ? amount : -amount;
                var cutoffNullable = FilterUtils.ShiftDateTime(now, unit, offset);

                if (!cutoffNullable.HasValue)
                {
                    return;
                }

                var cutoff = cutoffNullable.Value;

                switch (operation)
                {
                    case INLAST:
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.GreaterThanOrEqual(property, Expression.Constant(cutoff)),
                                param));

                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.LessThanOrEqual(property, Expression.Constant(now)),
                                param));
                        break;

                    case NOTINLAST:
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.LessThan(property, Expression.Constant(cutoff)),
                                param));
                        break;

                    case INNEXT:
                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.GreaterThan(property, Expression.Constant(now)),
                                param));

                        pageSpec.FilterExpressions.Add(
                            Expression.Lambda<Func<T, bool>>(
                                Expression.LessThanOrEqual(property, Expression.Constant(cutoff)),
                                param));
                        break;

                    case NOTINNEXT:
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
