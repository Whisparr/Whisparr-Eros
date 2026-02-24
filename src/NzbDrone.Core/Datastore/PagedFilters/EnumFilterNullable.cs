using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class EnumFilterNullable
    {
        /// <summary>Apply enum-based filter for nullable enum properties</summary>
        public static void Apply<T, TEnum>(
            PagingSpec<T> pageSpec,
            JsonElement element,
            string operation,
            Expression<Func<T, TEnum?>> propertySelector)
            where TEnum : struct, Enum
        {
            if (element.ValueKind != JsonValueKind.Array)
            {
                return;
            }

            var enumValues = new List<int>();
            foreach (var item in element.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String && Enum.TryParse(typeof(TEnum), item.GetString(), true, out var enumValue))
                {
                    enumValues.Add((int)enumValue);
                }
            }

            if (enumValues.Count == 0)
            {
                return;
            }

            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body;
            var convertedProperty = Expression.Convert(Expression.Convert(property, typeof(TEnum)), typeof(int));

            switch (operation)
            {
                case "equal":
                    var equalExpr = Expression.Lambda<Func<T, bool>>(
                        Expression.Call(
                            typeof(Enumerable),
                            "Contains",
                            new[] { typeof(int) },
                            Expression.Constant(enumValues),
                            convertedProperty),
                        param);
                    pageSpec.FilterExpressions.Add(equalExpr);
                    break;
                case "notequal":
                    var notEqualCall = Expression.Call(
                        typeof(Enumerable),
                        "Contains",
                        new[] { typeof(int) },
                        Expression.Constant(enumValues),
                        convertedProperty);
                    var notEqualExpr = Expression.Lambda<Func<T, bool>>(Expression.Not(notEqualCall), param);
                    pageSpec.FilterExpressions.Add(notEqualExpr);
                    break;
            }
        }
    }
}
