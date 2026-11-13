using NzbDrone.Core.Annotations;

namespace NzbDrone.Core.Notifications
{
    public enum MetadataLinkType
    {
        [FieldOption(Label = "TMDb")]
        Tmdb = 0,

        [FieldOption(Label = "IMDb")]
        Imdb = 1
    }
}
