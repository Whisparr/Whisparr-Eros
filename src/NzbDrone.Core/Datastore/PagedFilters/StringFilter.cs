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

            // Each value produces one filter expression added to FilterExpressions (ANDed together).
            // For positive ops (contains/startswith/endswith) multiple values mean "path matches ALL".
            // For negative ops (notcontains/notstartswith/notendswith) multiple values mean "path matches NONE".
            foreach (var value in values)
            {
                var valueConst = Expression.Constant(value);
                var notNull = Expression.NotEqual(property, nullConst);
                Expression final;

                switch (operation)
                {
                    case "contains":
                        var containsCall = Expression.Call(property, containsMethod, valueConst);
                        final = Expression.AndAlso(notNull, containsCall);
                        break;

                    case "notcontains":
                        var notContainsCall = Expression.Call(property, containsMethod, valueConst);
                        final = Expression.OrElse(
                            Expression.Equal(property, nullConst),
                            Expression.Not(notContainsCall));
                        break;

                    case "equal":
                        final = Expression.Equal(property, valueConst);
                        break;

                    case "notequal":
                        final = Expression.NotEqual(property, valueConst);
                        break;

                    case "startswith":
                        var startsWithCall = Expression.Call(property, startsWithMethod, valueConst);
                        final = Expression.AndAlso(notNull, startsWithCall);
                        break;

                    case "notstartswith":
                        var notStartsWithCall = Expression.Call(property, startsWithMethod, valueConst);
                        final = Expression.OrElse(
                            Expression.Equal(property, nullConst),
                            Expression.Not(notStartsWithCall));
                        break;

                    case "endswith":
                        var endsWithCall = Expression.Call(property, endsWithMethod, valueConst);
                        final = Expression.AndAlso(notNull, endsWithCall);
                        break;

                    case "notendswith":
                        var notEndsWithCall = Expression.Call(property, endsWithMethod, valueConst);
                        final = Expression.OrElse(
                            Expression.Equal(property, nullConst),
                            Expression.Not(notEndsWithCall));
                        break;

                    default:
                        return;
                }

                pageSpec.FilterExpressions.Add(Expression.Lambda<Func<T, bool>>(final, param));
            }
        }
    }
}
