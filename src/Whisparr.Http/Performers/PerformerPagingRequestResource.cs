using System.Collections.Generic;

namespace Whisparr.Http
{
    // Represents a single filter condition for performers
    public class PerformerFilterResource
    {
        public string Key { get; set; } // e.g., "gender", "status"
        public string Type { get; set; } // e.g., "equal", "contains", "greaterThan"
        public object Value { get; set; } // Value to filter by
    }

    // Paging request resource for performers, including filters
    public class PerformerPagingRequestResource : PagingRequestResource
    {
        public List<PerformerFilterResource> Filters { get; set; } = new();
    }
}
