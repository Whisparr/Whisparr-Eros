using System.Collections.Generic;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;

namespace Whisparr.Api.V3.Collections
{
    public class CollectionMovieResource
    {
        public string ImdbId { get; set; }
        public int TmdbId { get; set; }
        public string TpdbId { get; set; }
        public string ForeignId { get; set; }
        public string StashId { get; set; }
        public string Title { get; set; }
        public string CleanTitle { get; set; }
        public string SortTitle { get; set; }
        public MovieStatusType Status { get; set; }
        public string Overview { get; set; }
        public int Runtime { get; set; }
        public List<MediaCover> Images { get; set; }
        public int Year { get; set; }
        public Ratings Ratings { get; set; }
        public List<string> Genres { get; set; }
        public ItemType ItemType { get; set; }
        public string Folder { get; set; }
        public bool IsExisting { get; set; }
        public bool IsExcluded { get; set; }
    }

    public static class CollectionMovieResourceMapper
    {
        public static CollectionMovieResource ToResource(this MovieMetadata model)
        {
            if (model == null)
            {
                return null;
            }

            return new CollectionMovieResource
            {
                ForeignId = model.ForeignId,
                TmdbId = model.TmdbId,
                TpdbId = model.TpdbId,
                StashId = model.StashId,
                Title = model.Title,
                Status = model.Status,
                Overview = model.Overview,
                SortTitle = model.SortTitle,
                Images = model.Images,
                ImdbId = model.ImdbId,
                Ratings = model.Ratings,
                Runtime = model.Runtime,
                CleanTitle = model.CleanTitle,
                Genres = model.Genres,
                Year = model.Year,
                ItemType = model.ItemType
            };
        }
    }
}
