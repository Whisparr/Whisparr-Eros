using System;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    public static class BooleanFilter
    {
        public static void Apply<T>(
            PagingSpec<T> pageSpec,
            JsonElement element,
            string operation,
            Expression<Func<T, bool>> propertySelector)
        {
            bool boolValue;

            // Direct boolean
            if (element.ValueKind == JsonValueKind.True || element.ValueKind == JsonValueKind.False)
            {
                boolValue = element.GetBoolean();
            }

            // Array format
            else if (element.ValueKind == JsonValueKind.Array)
            {
                boolValue = false;

                foreach (var item in element.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.True ||
                        (item.ValueKind == JsonValueKind.String &&
                         bool.TryParse(item.GetString(), out var parsed) && parsed))
                    {
                        boolValue = true;
                        break;
                    }
                }
            }
            else
            {
                return;
            }

            var param = propertySelector.Parameters[0];
            var property = propertySelector.Body;
            var constant = Expression.Constant(boolValue, typeof(bool));

            switch (operation)
            {
                case "equal":
                    pageSpec.FilterExpressions.Add(
                        Expression.Lambda<Func<T, bool>>(
                            Expression.Equal(property, constant),
                            param));
                    break;

                case "notequal":
                    pageSpec.FilterExpressions.Add(
                        Expression.Lambda<Func<T, bool>>(
                            Expression.NotEqual(property, constant),
                            param));
                    break;
            }
        }
    }
}
