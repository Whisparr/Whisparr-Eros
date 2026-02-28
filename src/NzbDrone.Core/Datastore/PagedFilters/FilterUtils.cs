using System;
using System.Collections.Generic;
using System.Text.Json;

namespace NzbDrone.Core.Datastore.PagedFilters
{
    internal static class FilterUtils
    {
        /// <summary>Helper to parse integer arrays from JsonElement</summary>
        internal static List<int> ParseIntArray(JsonElement element)
        {
            var list = new List<int>();
            if (element.ValueKind != JsonValueKind.Array)
            {
                return list;
            }

            foreach (var item in element.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.Number && item.TryGetInt32(out var intValue))
                {
                    list.Add(intValue);
                }
                else if (item.ValueKind == JsonValueKind.String && int.TryParse(item.GetString(), out var strIntValue))
                {
                    list.Add(strIntValue);
                }
            }

            return list;
        }

        /// <summary>Helper to parse long arrays from JsonElement</summary>
        internal static List<long> ParseLongArray(JsonElement element)
        {
            var list = new List<long>();
            if (element.ValueKind != JsonValueKind.Array)
            {
                return list;
            }

            foreach (var item in element.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.Number && item.TryGetInt64(out var longValue))
                {
                    list.Add(longValue);
                }
                else if (item.ValueKind == JsonValueKind.String && long.TryParse(item.GetString(), out var strLongValue))
                {
                    list.Add(strLongValue);
                }
            }

            return list;
        }

        internal static DateTime? ShiftDateTime(DateTime baseTime, string unit, int amount)
        {
            return unit switch
            {
                "seconds" => baseTime.AddSeconds(amount),
                "minutes" => baseTime.AddMinutes(amount),
                "hours" => baseTime.AddHours(amount),
                "days" => baseTime.AddDays(amount),
                "weeks" => baseTime.AddDays(amount * 7.0),
                "months" => baseTime.AddMonths(amount),
                "years" => baseTime.AddYears(amount),
                _ => (DateTime?)null
            };
        }
    }
}
