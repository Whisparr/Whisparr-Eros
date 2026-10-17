using System.Collections.Generic;
using NzbDrone.Core.Datastore;
using Whisparr.Http.REST;

namespace Whisparr.Http
{
    public static class ImportPagingRequest
    {
        public static PagingSpec<T> ToSpec<T>(PagingRequestResource request, params string[] sortKeys)
        {
            var page = request.Page ?? 1;
            var pageSize = request.PageSize ?? 50;
            if (page < 1 || page > int.MaxValue / 200 || pageSize < 1 || pageSize > 200)
            {
                throw new BadRequestException("page must be positive and pageSize must be between 1 and 200");
            }

            var sortKey = request.SortKey ?? "relativePath";
            if (!new HashSet<string>(sortKeys).Contains(sortKey))
            {
                throw new BadRequestException("Unsupported import sort key");
            }

            var direction = request.SortDirection ?? SortDirection.Ascending;
            if (direction != SortDirection.Ascending && direction != SortDirection.Descending)
            {
                throw new BadRequestException("Unsupported import sort direction");
            }

            return new PagingSpec<T>
            {
                Page = page,
                PageSize = pageSize,
                SortKey = sortKey,
                SortDirection = direction,
                DefaultSortKeys = new List<string> { "id" }
            };
        }
    }
}
