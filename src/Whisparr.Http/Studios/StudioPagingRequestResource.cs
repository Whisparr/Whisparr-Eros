using System.Collections.Generic;

namespace Whisparr.Http
{
    // Represents a single filter condition for studios
    public class StudioFilterResource
    {
        public string Key { get; set; } // e.g., "status", "monitored"
        public string Type { get; set; } // e.g., "equal", "contains", "greaterThan"
        public object Value { get; set; } // Value to filter by
    }

    // Paging request resource for studios, including filters
    public class StudioPagingRequestResource : PagingRequestResource
    {
        public List<StudioFilterResource> Filters { get; set; } = new();
    }
}
