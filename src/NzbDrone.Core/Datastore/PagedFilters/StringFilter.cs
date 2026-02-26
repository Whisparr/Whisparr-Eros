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

                case "doesnotcontain":
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

                default:
                    return;
            }

            var lambda = Expression.Lambda<Func<T, bool>>(final, param);
            pageSpec.FilterExpressions.Add(lambda);
        }
    }
}
