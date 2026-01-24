using System.Collections.Generic;

namespace NzbDrone.Core.MetadataSource.SkyHook.Resource
{
    public class CollectionResource
    {
        public string Name { get; set; }
        public string Overview { get; set; }
        public ExternalIdResource ForeignIds { get; set; }
        public List<ImageResource> Images { get; set; }
        public List<MovieResource> Parts { get; set; }
    }
}
