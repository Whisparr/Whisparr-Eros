using NzbDrone.Core.Movies.Studios;

namespace Whisparr.Api.V3.Studios.Helpers
{
    public static class Sorting
    {
        public static object GetSortValue(Studio studio, string sortKey)
        {
            switch (sortKey.ToLowerInvariant())
            {
                case "title": return studio.Title;
                case "sorttitle": return studio.SortTitle;
                case "status": return studio.Status;
                case "network": return studio.Network;
                case "moviecount": return studio.MovieCount;
                case "scenecount": return studio.SceneCount;
                case "totalmoviecount": return studio.TotalMovieCount;
                case "totalscenecount": return studio.TotalSceneCount;
                default: return studio.SortTitle;
            }
        }
    }
}
