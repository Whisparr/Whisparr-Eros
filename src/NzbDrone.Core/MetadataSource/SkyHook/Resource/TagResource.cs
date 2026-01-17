namespace NzbDrone.Core.MetadataSource.SkyHook.Resource
{
    public class TagResource
    {
        public string Name { get; set; }

        public ExternalIdResource ForeignIds { get; set; }
    }
}
