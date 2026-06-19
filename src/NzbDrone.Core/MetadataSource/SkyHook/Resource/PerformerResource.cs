using System;
using System.Collections.Generic;
using NzbDrone.Core.Movies.Performers;

namespace NzbDrone.Core.MetadataSource.SkyHook.Resource
{
    public class PerformerResource
    {
        public string Name { get; set; }
        public ExternalIdResource ForeignIds { get; set; }
        public List<ImageResource> Images { get; set; }
        public string Disambiguation { get; set; }
        public List<string> Aliases { get; set; }
        public string Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public DateTime? DeathDate { get; set; }
        public int? Age { get; set; }
        public string Ethnicity { get; set; }
        public string Country { get; set; }
        public string EyeColor { get; set; }
        public string HairColor { get; set; }
        public int? Height { get; set; }
        public string CupSize { get; set; }
        public int? BandSize { get; set; }
        public int? WaistSize { get; set; }
        public int? HipSize { get; set; }
        public BreastTypeEnum BreastType { get; set; }
        public int? CareerStart { get; set; }
        public int? CareerEnd { get; set; }
        public List<string> Tattoos { get; set; }
        public List<string> Piercings { get; set; }
        public PerformerStatus Status { get; set; }
        public string MergedIntoId { get; set; }
    }
}
