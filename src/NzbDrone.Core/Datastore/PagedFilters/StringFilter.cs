using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class StringFilter
    {
        public static void Apply<T>(
            PagingSpec<T> pageSpec,
            JsonElement element,
            string operation,
            Expression<Func<T, string>> propertySelector)
        {
            List<string> values;

            if (element.ValueKind == JsonValueKind.String)
            {
                var s = element.GetString();
                if (string.IsNullOrWhiteSpace(s))
                {
                    return;
                }

                values = new List<string> { s };
            }
            else if (element.ValueKind == JsonValueKind.Array)
            {
                values = element.EnumerateArray()
                    .Where(e => e.ValueKind == JsonValueKind.String)
                    .Select(e => e.GetString())
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .ToList();

                if (!values.Any())
                {
                    return;
                }
            }
            else
            {
                return;
            }

            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body;

            var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
            var startsWithMethod = typeof(string).GetMethod("StartsWith", new[] { typeof(string) });
            var endsWithMethod = typeof(string).GetMethod("EndsWith", new[] { typeof(string) });
            var nullConst = Expression.Constant(null, typeof(string));

            // Positive ops (contains/startswith/endswith/equal): multiple values are OR'd into one
            // expression so that any matching value satisfies the filter.
            // Negative ops (notcontains/notstartswith/notendswith/notequal): each value adds a separate
            // expression (ANDed) so that none of the values may match.
            var perValueExpressions = new List<Expression>();

            foreach (var value in values)
            {
                var valueConst = Expression.Constant(value);
                var notNull = Expression.NotEqual(property, nullConst);
                Expression perValue;

                switch (operation)
                {
                    case "contains":
                        var containsCall = Expression.Call(property, containsMethod, valueConst);
                        perValue = Expression.AndAlso(notNull, containsCall);
                        perValueExpressions.Add(perValue);
                        break;

                    case "notcontains":
                        var notContainsCall = Expression.Call(property, containsMethod, valueConst);
                        perValue = Expression.OrElse(
                            Expression.Equal(property, nullConst),
                            Expression.Not(notContainsCall));
                        pageSpec.FilterExpressions.Add(Expression.Lambda<Func<T, bool>>(perValue, param));
                        break;

                    case "equal":
                        perValue = Expression.Equal(property, valueConst);
                        perValueExpressions.Add(perValue);
                        break;

                    case "notequal":
                        perValue = Expression.NotEqual(property, valueConst);
                        pageSpec.FilterExpressions.Add(Expression.Lambda<Func<T, bool>>(perValue, param));
                        break;

                    case "startswith":
                        var startsWithCall = Expression.Call(property, startsWithMethod, valueConst);
                        perValue = Expression.AndAlso(notNull, startsWithCall);
                        perValueExpressions.Add(perValue);
                        break;

                    case "notstartswith":
                        var notStartsWithCall = Expression.Call(property, startsWithMethod, valueConst);
                        perValue = Expression.OrElse(
                            Expression.Equal(property, nullConst),
                            Expression.Not(notStartsWithCall));
                        pageSpec.FilterExpressions.Add(Expression.Lambda<Func<T, bool>>(perValue, param));
                        break;

                    case "endswith":
                        var endsWithCall = Expression.Call(property, endsWithMethod, valueConst);
                        perValue = Expression.AndAlso(notNull, endsWithCall);
                        perValueExpressions.Add(perValue);
                        break;

                    case "notendswith":
                        var notEndsWithCall = Expression.Call(property, endsWithMethod, valueConst);
                        perValue = Expression.OrElse(
                            Expression.Equal(property, nullConst),
                            Expression.Not(notEndsWithCall));
                        pageSpec.FilterExpressions.Add(Expression.Lambda<Func<T, bool>>(perValue, param));
                        break;

                    default:
                        return;
                }
            }

            // Combine positive-match expressions with OR so any term satisfies the filter.
            if (perValueExpressions.Count > 0)
            {
                var combined = perValueExpressions.Aggregate(Expression.OrElse);
                pageSpec.FilterExpressions.Add(Expression.Lambda<Func<T, bool>>(combined, param));
            }
        }
    }
}
