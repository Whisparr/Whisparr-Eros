using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class EnumFilterLazy
    {
        /// <summary>Apply enum-based filter for nullable enum properties where the enum is wrapped in a LazyLoaded object like TMetadata
        /// handles unwrapping the LazyLoaded.Value and converting the enum to int for comparison</summary>
        public static void Apply<T, TEnum>(
       PagingSpec<T> pageSpec,
       JsonElement element,
       string operation,
       Expression<Func<T, TEnum>> propertySelector)
       where TEnum : struct, Enum
        {
            // STEP 1 — extract enum values
            var enumValues = new List<int>();

            if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String &&
                        Enum.TryParse(typeof(TEnum), item.GetString(), true, out var enumValue))
                    {
                        enumValues.Add((int)enumValue);
                    }
                }
            }
            else if (element.ValueKind == JsonValueKind.String)
            {
                if (Enum.TryParse(typeof(TEnum), element.GetString(), true, out var enumValue))
                {
                    enumValues.Add((int)enumValue);
                }
            }

            if (enumValues.Count == 0)
            {
                return;
            }

            // STEP 2 — unwrap LazyLoaded<T>.Value generically
            var param = propertySelector.Parameters[0];
            var body = propertySelector.Body;

            if (body is MemberExpression itemTypeExpr &&
                itemTypeExpr.Expression is MemberExpression valueExpr &&
                valueExpr.Member.Name == "Value")
            {
                // LazyLoaded<TMetadata>
                var lazyType = valueExpr.Expression.Type;

                // Extract TMetadata
                var metadataType = lazyType.GetGenericArguments()[0];

                // Cast LazyLoaded<TMetadata> to TMetadata
                var casted = Expression.Convert(valueExpr.Expression, metadataType);

                // Access the enum property on the metadata object
                body = Expression.Property(casted, itemTypeExpr.Member.Name);
            }

            // STEP 3 — convert enum to int
            var convertedProperty = Expression.Convert(body, typeof(int));

            // STEP 4 — build Contains(...) expression
            Expression containsCall = Expression.Call(
                typeof(Enumerable),
                "Contains",
                new[] { typeof(int) },
                Expression.Constant(enumValues),
                convertedProperty);

            var finalExpr = operation == "notequal"
                ? Expression.Not(containsCall)
                : containsCall;

            var lambda = Expression.Lambda<Func<T, bool>>(finalExpr, param);
            pageSpec.FilterExpressions.Add(lambda);
        }
    }
}
