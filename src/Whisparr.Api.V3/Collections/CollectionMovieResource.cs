using System.Collections.Generic;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;

namespace Whisparr.Api.V3.Collections
{
    public class CollectionMovieResource
    {
        /// <summary>
        /// The IMDb identifier for the movie (e.g. "tt1234567").
        /// </summary>
        public string ImdbId { get; set; }

        /// <summary>
        /// The TMDB identifier for the movie.
        /// </summary>
        public int TmdbId { get; set; }

        /// <summary>
        /// The TPDB identifier for the movie, if available.
        /// </summary>
        public string TpdbId { get; set; }

        /// <summary>
        /// The external provider's foreign identifier for the movie.
        /// </summary>
        public string ForeignId { get; set; }

        /// <summary>
        /// The StashDB identifier associated with the movie, if any.
        /// </summary>
        public string StashId { get; set; }

        /// <summary>
        /// The movie's title.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Normalized/clean title used for internal comparisons.
        /// </summary>
        public string CleanTitle { get; set; }

        /// <summary>
        /// Title used for sorting purposes.
        /// </summary>
        public string SortTitle { get; set; }

        /// <summary>
        /// The current status of the movie.
        /// </summary>
        public MovieStatusType Status { get; set; }

        /// <summary>
        /// A short synopsis or overview of the movie.
        /// </summary>
        public string Overview { get; set; }

        /// <summary>
        /// Runtime in minutes.
        /// </summary>
        public int Runtime { get; set; }

        /// <summary>
        /// Collection of media cover images for the movie.
        /// </summary>
        public List<MediaCover> Images { get; set; }

        /// <summary>
        /// Release year of the movie.
        /// </summary>
        public int Year { get; set; }

        /// <summary>
        /// Ratings information for the movie (e.g., TMDB/IMDb ratings).
        /// </summary>
        public Ratings Ratings { get; set; }

        /// <summary>
        /// List of genre names associated with the movie.
        /// </summary>
        public List<string> Genres { get; set; }

        /// <summary>
        /// The item type (e.g., Movie, Scene).
        /// </summary>
        public ItemType ItemType { get; set; }

        /// <summary>
        /// Calculated folder path for the movie (naming conventions applied).
        /// </summary>
        public string Folder { get; set; }

        /// <summary>
        /// Indicates whether the movie already exists in the library.
        /// </summary>
        public bool IsExisting { get; set; }

        /// <summary>
        /// Indicates whether the movie is excluded from import lists.
        /// </summary>
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
