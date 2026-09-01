using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies.Collections;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Collections
{
    public class CollectionResource : RestResource
    {
        public CollectionResource()
        {
            Movies = new List<CollectionMovieResource>();
        }

        /// <summary>
        /// The collection's title.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Title used for sorting the collection.
        /// </summary>
        public string SortTitle { get; set; }

        /// <summary>
        /// The TMDB identifier for the collection.
        /// </summary>
        public int TmdbId { get; set; }

        /// <summary>
        /// A list of media cover images associated with the collection.
        /// </summary>
        public List<MediaCover> Images { get; set; }

        /// <summary>
        /// A short overview or synopsis for the collection.
        /// </summary>
        public string Overview { get; set; }

        /// <summary>
        /// Whether the collection is monitored for automatic actions (e.g., downloads).
        /// </summary>
        public bool Monitored { get; set; }

        /// <summary>
        /// Whether newly discovered movies in the collection are added monitored.
        /// </summary>
        public bool MonitorNewItems { get; set; }

        /// <summary>
        /// The configured root folder path where movies for this collection are stored.
        /// </summary>
        public string RootFolderPath { get; set; }

        /// <summary>
        /// The quality profile id applied to movies in this collection.
        /// </summary>
        public int QualityProfileId { get; set; }

        /// <summary>
        /// Whether new movies in the collection should be searched for automatically when added.
        /// </summary>
        public bool SearchOnAdd { get; set; }

        /// <summary>
        /// Movies that belong to this collection.
        /// </summary>
        public List<CollectionMovieResource> Movies { get; set; }

        /// <summary>
        /// Number of movies from the collection that are missing from the local library.
        /// </summary>
        public int MissingMovies { get; set; }

        /// <summary>
        /// Set of tag ids associated with the collection.
        /// </summary>
        public HashSet<int> Tags { get; set; }
    }

    public static class CollectionResourceMapper
    {
        public static CollectionResource ToResource(this MovieCollection model)
        {
            if (model == null)
            {
                return null;
            }

            return new CollectionResource
            {
                Id = model.Id,
                TmdbId = model.TmdbId,
                Title = model.Title,
                Overview = model.Overview,
                SortTitle = model.SortTitle,
                Monitored = model.Monitored,
                MonitorNewItems = model.MonitorNewItems,
                Images = model.Images,
                QualityProfileId = model.QualityProfileId,
                RootFolderPath = model.RootFolderPath,
                SearchOnAdd = model.SearchOnAdd,
                Tags = model.Tags
            };
        }

        public static List<CollectionResource> ToResource(this IEnumerable<MovieCollection> collections)
        {
            return collections.Select(ToResource).ToList();
        }

        public static MovieCollection ToModel(this CollectionResource resource)
        {
            if (resource == null)
            {
                return null;
            }

            return new MovieCollection
            {
                Id = resource.Id,
                Title = resource.Title,
                TmdbId = resource.TmdbId,
                SortTitle = resource.SortTitle,
                Overview = resource.Overview,
                Monitored = resource.Monitored,
                MonitorNewItems = resource.MonitorNewItems,
                QualityProfileId = resource.QualityProfileId,
                RootFolderPath = resource.RootFolderPath,
                SearchOnAdd = resource.SearchOnAdd,
                Tags = resource.Tags
            };
        }

        public static MovieCollection ToModel(this CollectionResource resource, MovieCollection collection)
        {
            var updatedmovie = resource.ToModel();

            collection.ApplyChanges(updatedmovie);

            return collection;
        }
    }
}
