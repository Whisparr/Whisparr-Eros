using NzbDrone.Core.Profiles.Qualities;

namespace Whisparr.Api.V3.Profiles.Quality
{
    public class QualityProfileInUseResource
    {
        public int MovieCount { get; set; }
        public int PerformerCount { get; set; }
        public int StudioCount { get; set; }
        public int ImportListCount { get; set; }
        public bool IsFallback { get; set; }
    }

    public static class QualityProfileInUseResourceMapper
    {
        public static QualityProfileInUseResource ToResource(this QualityProfileInUse model)
        {
            if (model == null)
            {
                return null;
            }

            return new QualityProfileInUseResource
            {
                MovieCount = model.MovieCount,
                PerformerCount = model.PerformerCount,
                StudioCount = model.StudioCount,
                ImportListCount = model.ImportListCount,
                IsFallback = model.IsFallback
            };
        }
    }
}
