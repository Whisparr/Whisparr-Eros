using System.Collections.Generic;

namespace Whisparr.Http
{
    // Represents a single filter condition for movies
    public class MovieFilterResource
    {
        public string Key { get; set; } // e.g., "status", "monitored", "itemType"
        public string Type { get; set; } // e.g., "equal", "contains", "greaterThan"
        public object Value { get; set; } // Value to filter by
    }

    // Paging request resource for movies, including filters
    public class MoviePagingRequestResource : PagingRequestResource
    {
        public List<MovieFilterResource> Filters { get; set; } = new();
    }
}
