using System.Collections.Generic;

namespace Whisparr.Api.V3.Performers
{
    /// <summary>A resource for editing multiple performers.</summary>
    public class PerformerEditorResource
    {
        /// <summary>The IDs of the performers to be edited.</summary>
        public List<int> PerformerIds { get; set; }

        /// <summary>Whether the performers' scenes are monitored.</summary>
        public bool? Monitored { get; set; }

        /// <summary>Whether the performers' movies are monitored.</summary>
        public bool? MoviesMonitored { get; set; }

        /// <summary>The quality profile ID to set for the performers' movies.</summary>
        public int? QualityProfileId { get; set; }

        /// <summary>The root folder path to set for the performers' movies.</summary>
        public string RootFolderPath { get; set; }

        /// <summary>Whether to search for new content after it is added to the performers.</summary>
        public bool? SearchOnAdd { get; set; }

        /// <summary>The IDs of the tags to apply to the performers.</summary>
        public List<int> Tags { get; set; }

        /// <summary>Instructions for applying tags to the performers.</summary>
        public ApplyTags ApplyTags { get; set; }
    }
}
