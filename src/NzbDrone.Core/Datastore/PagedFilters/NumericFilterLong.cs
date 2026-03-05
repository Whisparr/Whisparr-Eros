using System;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class NumericFilterLong
    {
        /// <summary>Apply numeric comparison filter for non-nullable long (int64) properties</summary>
        public static void Apply<T>(
            PagingSpec<T> pageSpec,
            JsonElement element,
            string operation,
            Expression<Func<T,
            long>> propertySelector)
        {
            var values = FilterUtils.ParseLongArray(element);
            if (values.Count == 0)
            {
                return;
            }

            // For comparison operators, use the first value
            // TODO: UI currently allows multiple values even for comparison ops - consider fixing UI
            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body;

            switch (operation)
            {
                case "equal":
                    var equalExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.Call(
                            typeof(Enumerable),
                            "Contains",
                            new[] { typeof(long) },
                            Expression.Constant(values),
                            property),
                        param);
                    pageSpec.FilterExpressions.Add(equalExpr);
                    break;
                case "notequal":
                    var notEqualCall = Expression.Call(
                        typeof(Enumerable),
                        "Contains",
                        new[] { typeof(long) },
                        Expression.Constant(values),
                        property);
                    var notEqualExpr = Expression.Lambda<Func<T, bool>>(Expression.Not(notEqualCall), param);
                    pageSpec.FilterExpressions.Add(notEqualExpr);
                    break;
                case "greaterthan":
                    var gtValue = values.First();
                    var gtExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.LessThan(Expression.Constant(gtValue), property),
                        param);
                    pageSpec.FilterExpressions.Add(gtExpr);
                    break;
                case "lessthan":
                    var ltValue = values.First();
                    var ltExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.GreaterThan(Expression.Constant(ltValue), property),
                        param);
                    pageSpec.FilterExpressions.Add(ltExpr);
                    break;
                case "greaterthanorequal":
                    var gteValue = values.First();
                    var gteExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.LessThanOrEqual(Expression.Constant(gteValue), property),
                        param);
                    pageSpec.FilterExpressions.Add(gteExpr);
                    break;
                case "lessthanorequal":
                    var lteValue = values.First();
                    var lteExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.GreaterThanOrEqual(Expression.Constant(lteValue), property),
                        param);
                    pageSpec.FilterExpressions.Add(lteExpr);
                    break;
            }
        }
    }
}
