using System;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class NumericFilterNullable
    {
        /// <summary>Apply numeric comparison filter for nullable int properties</summary>
        public static void Apply<T>(
            PagingSpec<T> pageSpec,
            JsonElement element,
            string operation,
            Expression<Func<T, int?>> propertySelector)
        {
            var values = FilterUtils.ParseIntArray(element);
            if (values.Count == 0)
            {
                return;
            }

            // For comparison operators, use the first value
            // TODO: UI currently allows multiple values even for comparison ops - consider fixing UI
            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body;
            var convertedProperty = Expression.Convert(property, typeof(int));

            switch (operation)
            {
                case "equal":
                    var equalExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.Call(
                            typeof(Enumerable),
                            "Contains",
                            new[] { typeof(int) },
                            Expression.Constant(values),
                            convertedProperty),
                        param);
                    pageSpec.FilterExpressions.Add(equalExpr);
                    break;
                case "notequal":
                    var notEqualCall = Expression.Call(
                        typeof(Enumerable),
                        "Contains",
                        new[] { typeof(int) },
                        Expression.Constant(values),
                        convertedProperty);
                    var notEqualExpr = Expression.Lambda<Func<T, bool>>(Expression.Not(notEqualCall), param);
                    pageSpec.FilterExpressions.Add(notEqualExpr);
                    break;
                case "greaterthan":
                    var gtValue = values.First();
                    var gtExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.LessThan(Expression.Constant(gtValue), convertedProperty),
                        param);
                    pageSpec.FilterExpressions.Add(gtExpr);
                    break;
                case "lessthan":
                    var ltValue = values.First();
                    var ltExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.GreaterThan(Expression.Constant(ltValue), convertedProperty),
                        param);
                    pageSpec.FilterExpressions.Add(ltExpr);
                    break;
                case "greaterthanorequal":
                    var gteValue = values.First();
                    var gteExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.LessThanOrEqual(Expression.Constant(gteValue), convertedProperty),
                        param);
                    pageSpec.FilterExpressions.Add(gteExpr);
                    break;
                case "lessthanorequal":
                    var lteValue = values.First();
                    var lteExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.GreaterThanOrEqual(Expression.Constant(lteValue), convertedProperty),
                        param);
                    pageSpec.FilterExpressions.Add(lteExpr);
                    break;
            }
        }
    }
}
