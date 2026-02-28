using System;
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
            if (element.ValueKind != JsonValueKind.String)
            {
                return;
            }

            var value = element.GetString();
            if (string.IsNullOrWhiteSpace(value))
            {
                return;
            }

            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body;

            // Build property != null
            var notNull = Expression.NotEqual(property, Expression.Constant(null, typeof(string)));

            // Build property.Contains(value)
            var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
            var containsCall = Expression.Call(property, containsMethod, Expression.Constant(value));

            Expression final;

            switch (operation)
            {
                case "contains":
                    final = Expression.AndAlso(notNull, containsCall);
                    break;

                case "notcontains":
                    final = Expression.OrElse(
                        Expression.Equal(property, Expression.Constant(null, typeof(string))),
                        Expression.Not(containsCall));

                    break;

                case "equal":
                    final = Expression.Equal(property, Expression.Constant(value));
                    break;

                case "notequal":
                    final = Expression.NotEqual(property, Expression.Constant(value));
                    break;

                case "startswith":
                    var startsWithMethod = typeof(string).GetMethod("StartsWith", new[] { typeof(string) });
                    var startsWithCall = Expression.Call(property, startsWithMethod, Expression.Constant(value));
                    final = Expression.AndAlso(notNull, startsWithCall);
                    break;
                case "notstartswith":
                    var notStartsWithMethod = typeof(string).GetMethod("StartsWith", new[] { typeof(string) });
                    var notStartsWithCall = Expression.Call(property, notStartsWithMethod, Expression.Constant(value));
                    final = Expression.OrElse(
                        Expression.Equal(property, Expression.Constant(null, typeof(string))),
                        Expression.Not(notStartsWithCall));

                    break;
                case "endswith":
                    var endsWithMethod = typeof(string).GetMethod("EndsWith", new[] { typeof(string) });
                    var endsWithCall = Expression.Call(property, endsWithMethod, Expression.Constant(value));
                    final = Expression.AndAlso(notNull, endsWithCall);
                    break;
                case "notendswith":
                    var notEndsWithMethod = typeof(string).GetMethod("EndsWith", new[] { typeof(string) });
                    var notEndsWithCall = Expression.Call(property, notEndsWithMethod, Expression.Constant(value));
                    final = Expression.OrElse(
                        Expression.Equal(property, Expression.Constant(null, typeof(string))),
                        Expression.Not(notEndsWithCall));

                    break;

                default:
                    return;
            }

            var lambda = Expression.Lambda<Func<T, bool>>(final, param);
            pageSpec.FilterExpressions.Add(lambda);
        }
    }
}
