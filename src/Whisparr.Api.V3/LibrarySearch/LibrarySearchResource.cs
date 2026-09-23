using System.Collections.Generic;
using Whisparr.Api.V3.Movies;
using Whisparr.Api.V3.Performers;
using Whisparr.Api.V3.Studios;

namespace Whisparr.Api.V3.LibrarySearch
{
    public class LibrarySearchSectionResource<TResource>
    {
        public int TotalRecords { get; set; }
        public List<TResource> Records { get; set; } = new();
    }

    public class LibrarySearchResource
    {
        public LibrarySearchSectionResource<PerformerResource> Performers { get; set; } = new();
        public LibrarySearchSectionResource<StudioResource> Studios { get; set; } = new();
        public LibrarySearchSectionResource<MovieResource> Scenes { get; set; } = new();
        public LibrarySearchSectionResource<MovieResource> Movies { get; set; } = new();
    }
}
