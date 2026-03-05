using NzbDrone.Core.Movies;

namespace Whisparr.Api.V3.Movies.Helpers
{
    public static class Sorting
    {
        public static string GetSortKeyNormalized(string sortKey)
        {
            switch (sortKey?.ToLowerInvariant())
            {
                case "title": return "movieMetadata.Title";
                case "sorttitle": return "movieMetadata.SortTitle";
                case "cleantitle": return "movieMetadata.CleanTitle";
                case "studiotitle": return "movieMetadata.StudioTitle";
                case "releasedate": return "movieMetadata.ReleaseDate";
                case "year": return "movieMetadata.Year";
                case "status": return "movieMetadata.Status";
                case "monitored": return "Monitored";
                case "qualityprofileid": return "QualityProfileId";
                case "rootfolderpath": return "Path";
                case "sizeondisk": return "movieFiles.Size";
                case "itemtype": return "movieMetadata.ItemType";
                case "added": return "Added";
                case "runtime": return "movieMetadata.Runtime";
                case "moviestatus": return "MovieFileId";
                default: return "movieMetadata.SortTitle";
            }
        }

        public static object GetSortValue(Movie movie, string sortKey)
        {
            switch (sortKey.ToLowerInvariant())
            {
                case "title": return movie.Title;
                case "sorttitle": return movie.MovieMetadata.Value.CleanTitle;
                case "studiotitle": return movie.MovieMetadata.Value.StudioTitle;
                case "releasedate": return movie.MovieMetadata.Value.ReleaseDate;
                case "year": return movie.Year;
                case "status": return movie.MovieMetadata.Value.Status;
                case "monitored": return movie.Monitored;
                case "qualityprofileid": return movie.QualityProfileId;
                case "rootfolderpath": return movie.RootFolderPath;
                case "sizeondisk": return movie.MovieFile?.Size ?? 0;
                case "itemtype": return movie.MovieMetadata.Value.ItemType;
                case "added": return movie.Added;
                case "runtime": return movie.MovieMetadata.Value.Runtime;
                case "moviestatus": return movie.MovieFileId;
                default: return movie.MovieMetadata.Value.CleanTitle;
            }
        }
    }
}
