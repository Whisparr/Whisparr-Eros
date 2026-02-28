using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    /// <summary>Filter for Whisparr tags (not genres) </summary>
    public static class TagFilter
    {
        public static void Apply<T>(
            PagingSpec<T> pageSpec,
            JsonElement element,
            string operation,
            Expression<Func<T, IEnumerable<int>>> tagSelector)
        {
            var tagIds = new List<int>();

            // Parse tag IDs
            if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Number && item.TryGetInt32(out var id))
                    {
                        tagIds.Add(id);
                    }
                    else if (item.ValueKind == JsonValueKind.String && int.TryParse(item.GetString(), out id))
                    {
                        tagIds.Add(id);
                    }
                }
            }
            else if (element.ValueKind == JsonValueKind.Number && element.TryGetInt32(out var singleId))
            {
                tagIds.Add(singleId);
            }
            else if (element.ValueKind == JsonValueKind.String)
            {
                var raw = element.GetString();
                if (!string.IsNullOrWhiteSpace(raw))
                {
                    tagIds = raw
                        .Trim('[', ']')
                        .Split(',')
                        .Select(s => int.TryParse(s.Trim(), out var id) ? id : (int?)null)
                        .Where(id => id.HasValue)
                        .Select(id => id.Value)
                        .ToList();
                }
            }

            if (tagIds.Count == 0)
            {
                return;
            }

            var param = tagSelector.Parameters[0];
            var tagsExpr = tagSelector.Body;

            // Build OR chain (contains ANY)
            Expression BuildOr()
            {
                Expression orExpr = null;

                foreach (var id in tagIds)
                {
                    var contains = Expression.Call(
                        tagsExpr,
                        typeof(IEnumerable<int>).GetMethod("Contains", new[] { typeof(int) }),
                        Expression.Constant(id));

                    orExpr = orExpr == null ? contains : Expression.OrElse(orExpr, contains);
                }

                return orExpr;
            }

            // Build AND chain (contains ALL)
            Expression BuildAnd()
            {
                Expression andExpr = null;

                foreach (var id in tagIds)
                {
                    var contains = Expression.Call(
                        tagsExpr,
                        typeof(IEnumerable<int>).GetMethod("Contains", new[] { typeof(int) }),
                        Expression.Constant(id));

                    andExpr = andExpr == null ? contains : Expression.AndAlso(andExpr, contains);
                }

                return andExpr;
            }

            switch (operation)
            {
                case "contains":
                    pageSpec.FilterExpressions.Add(
                        Expression.Lambda<Func<T, bool>>(BuildOr(), param));
                    break;

                case "doesnotcontain":
                    pageSpec.FilterExpressions.Add(
                        Expression.Lambda<Func<T, bool>>(Expression.Not(BuildOr()), param));
                    break;

                case "eq":
                case "==":
                    pageSpec.FilterExpressions.Add(
                        Expression.Lambda<Func<T, bool>>(BuildAnd(), param));
                    break;

                case "notequal":
                case "ne":
                    pageSpec.FilterExpressions.Add(
                        Expression.Lambda<Func<T, bool>>(Expression.Not(BuildAnd()), param));
                    break;
            }
        }
    }
}
