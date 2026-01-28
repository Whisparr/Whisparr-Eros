using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies.Credits;
using Whisparr.Http.REST;

namespace NzbDrone.Api.V3.Credits
{
    public class CreditResource : RestResource
    {
        public CreditResource()
        {
            Images = new List<MediaCover>();
        }

        /// <summary>
        /// The full name of the person associated with this credit.
        /// </summary>
        public string PersonName { get; set; }

        /// <summary>
        /// Internal identifier of the performer.
        /// </summary>
        public int PerformerId { get; set; }

        /// <summary>
        /// External provider identifier for the performer (foreign id).
        /// </summary>
        public string ForeignId { get; set; }

        /// <summary>
        /// Identifier of the associated movie metadata record.
        /// </summary>
        public int MovieMetadataId { get; set; }

        /// <summary>
        /// Collection of media covers (images) for the performer.
        /// </summary>
        public List<MediaCover> Images { get; set; }

        /// <summary>
        /// Job or role title for the credit (e.g., "Director", "Producer").
        /// </summary>
        public string Job { get; set; }

        /// <summary>
        /// Character name portrayed by the performer (for cast credits).
        /// </summary>
        public string Character { get; set; }

        /// <summary>
        /// Sort order for the credit; lower values appear earlier.
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// The type of credit (cast, crew, etc.).
        /// </summary>
        public CreditType Type { get; set; }

        /// <summary>
        /// Indicates whether the performer can be monitored via StashDB.org.
        /// </summary>
        public bool CanMonitor { get; set; }

        /// <summary>
        /// Whether the performer is currently monitored for Scenes.
        /// </summary>
        public bool Monitored { get; set; }

        /// <summary>
        /// Indicates whether movies for this performer can be monitored in the configured movie metadata source.
        /// </summary>
        public bool CanMovieMonitor { get; set; }

        /// <summary>
        /// Whether movies for this performer are currently monitored for Movies.
        /// </summary>
        public bool MoviesMonitored { get; set; }
    }

    public static class CreditResourceMapper
    {
        public static CreditResource ToResource(this Credit model, MovieMetadataType whisparrMovieMetadataSource)
        {
            if (model == null)
            {
                return null;
            }

            var canMovieMonitor = false;
            if (whisparrMovieMetadataSource == MovieMetadataType.TMDB && model.Performer.TmdbId > 0)
            {
                canMovieMonitor = true;
            }

            if (whisparrMovieMetadataSource == MovieMetadataType.TPDB && model.Performer.TpdbId.IsNotNullOrWhiteSpace())
            {
                canMovieMonitor = true;
            }

            return new CreditResource
            {
                Id = model.Id,
                PerformerId = model.Performer.Id,
                MovieMetadataId = model.MovieMetadataId,
                ForeignId = model.PerformerForeignId,
                PersonName = model.PersonName,
                Character = model.Character,
                Images = model.Images,
                Order = model.Order,
                Type = model.Type,
                CanMonitor = model.Performer?.ForeignId.IsNotNullOrWhiteSpace() == true,
                Monitored = model.Performer?.Monitored == true,
                CanMovieMonitor = canMovieMonitor,
                MoviesMonitored = model.Performer?.MoviesMonitored == true
            };
        }

        public static List<CreditResource> ToResource(this IEnumerable<Credit> credits, MovieMetadataType whisparrMovieMetadataSource)
        {
            return credits.Select(x => x.ToResource(whisparrMovieMetadataSource)).ToList();
        }

        public static Credit ToModel(this CreditResource resource)
        {
            if (resource == null)
            {
                return null;
            }

            return new Credit
            {
                Id = resource.Id,
                MovieMetadataId = resource.MovieMetadataId,
                PersonName = resource.PersonName,
                Order = resource.Order,
                Character = resource.Character,
                Job = resource.Job,
                Type = resource.Type,
                Images = resource.Images,
                PerformerForeignId = resource.ForeignId
            };
        }
    }
}
