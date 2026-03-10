using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class StringArrayFilter
    {
        public static void Apply<T>(
            PagingSpec<T> pageSpec,
            JsonElement element,
            string operation,
            Expression<Func<T, List<string>>> propertySelector)
        {
            // Parse array of strings or a single string
            var values = new List<string>();

            if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        var s = item.GetString();
                        if (!string.IsNullOrWhiteSpace(s))
                        {
                            values.Add(s);
                        }
                    }
                }
            }
            else if (element.ValueKind == JsonValueKind.String)
            {
                var s = element.GetString();
                if (!string.IsNullOrWhiteSpace(s))
                {
                    values.Add(s);
                }
            }

            if (values.Count == 0)
            {
                return;
            }

            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body;

            // property IS NOT NULL
            var notNull = Expression.NotEqual(property, Expression.Constant(null, property.Type));

            // List<string>.Contains(string) — WhereBuilderSqlite translates this to a LIKE '%"value"%' clause
            var containsMethod = typeof(List<string>).GetMethod("Contains", new[] { typeof(string) });

            // Build OR chain: contains ANY
            Expression BuildOr()
            {
                Expression orExpr = null;

                foreach (var v in values)
                {
                    var contains = Expression.Call(property, containsMethod, Expression.Constant(v));
                    orExpr = orExpr == null ? contains : Expression.OrElse(orExpr, contains);
                }

                return Expression.AndAlso(notNull, orExpr);
            }

            // Build AND chain: contains ALL
            Expression BuildAnd()
            {
                Expression andExpr = null;

                foreach (var v in values)
                {
                    var contains = Expression.Call(property, containsMethod, Expression.Constant(v));
                    andExpr = andExpr == null ? contains : Expression.AndAlso(andExpr, contains);
                }

                return Expression.AndAlso(notNull, andExpr);
            }

            var final = operation switch
            {
                "contains" or "containsany" => BuildOr(),
                "containsall" => BuildAnd(),
                "doesnotcontain" => Expression.Not(BuildOr()),
                _ => null
            };

            if (final != null)
            {
                var lambda = Expression.Lambda<Func<T, bool>>(final, param);
                pageSpec.FilterExpressions.Add(lambda);
            }
        }
    }
}
