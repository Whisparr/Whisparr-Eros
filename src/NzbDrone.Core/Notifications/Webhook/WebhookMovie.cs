using System.Collections.Generic;
using System.IO;
using System.Linq;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;

namespace NzbDrone.Core.Notifications.Webhook
{
    public class WebhookMovie
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int Year { get; set; }
        public string FilePath { get; set; }
        public string ReleaseDate { get; set; }
        public string FolderPath { get; set; }
        public int TmdbId { get; set; }
        public string ImdbId { get; set; }
        public string StashId { get; set; }
        public string TpdbId { get; set; }
        public string Overview { get; set; }
        public string ItemType { get; set; }
        public int Runtime { get; set; }
        public string Website { get; set; }
        public string StudioTitle { get; set; }
        public string Network { get; set; }
        public List<string> Performers { get; set; }
        public List<string> Genres { get; set; }
        public List<WebhookImage> Images { get; set; }
        public List<string> Tags { get; set; }

        public WebhookMovie()
        {
        }

        public WebhookMovie(Movie movie, List<string> tags, string network)
        {
            Id = movie.Id;
            Title = movie.Title;
            Year = movie.Year;
            ReleaseDate = movie.MovieMetadata.Value.ReleaseDateUtc?.ToString("yyyy-MM-dd");
            FolderPath = movie.Path;
            TmdbId = movie.TmdbId;
            ImdbId = movie.ImdbId;
            StashId = movie.MovieMetadata.Value.StashId;
            TpdbId = movie.MovieMetadata.Value.TpdbId;
            Overview = movie.MovieMetadata.Value.Overview;
            Runtime = movie.MovieMetadata.Value.Runtime;
            Website = movie.MovieMetadata.Value.Website;
            StudioTitle = movie.MovieMetadata.Value.StudioTitle;
            Network = network;
            Performers = movie.MovieMetadata.Value.PerformerNames;
            Genres = movie.MovieMetadata.Value.Genres;
            Images = movie.MovieMetadata.Value.Images.Select(i => new WebhookImage(i)).ToList();
            Tags = tags;
            ItemType = movie.MovieMetadata.Value.ItemType.ToString();
        }

        public WebhookMovie(Movie movie, MovieFile movieFile, List<string> tags, string network)
            : this(movie, tags, network)
        {
            FilePath = Path.Combine(movie.Path, movieFile.RelativePath);
        }
    }
}
