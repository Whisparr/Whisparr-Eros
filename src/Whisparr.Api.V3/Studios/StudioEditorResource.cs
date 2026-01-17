using System.Collections.Generic;

namespace Whisparr.Api.V3.Studios
{
    /// <summary>A resource for editing multiple studios</summary>
    public class StudioEditorResource
    {
        /// <summary>The IDs of the studios to be edited</summary>
        public List<int> StudioIds { get; set; }

        /// <summary>Whether the studios' scenes are monitored</summary>
        public bool? Monitored { get; set; }

        /// <summary>Whether the studios' movies are monitored</summary>
        public bool? MoviesMonitored { get; set; }

        /// <summary>The quality profile ID to set on the studios</summary>
        public int? QualityProfileId { get; set; }

        /// <summary>The root folder path to set on the studios</summary>
        public string RootFolderPath { get; set; }

        /// <summary>Whether to search for new items when added to studio</summary>
        public bool? SearchOnAdd { get; set; }

        /// <summary>The tags to apply to the studios</summary>
        public List<int> Tags { get; set; }

        /// <summary>How to apply the tags to the studios</summary>
        public ApplyTags ApplyTags { get; set; }
    }
}
