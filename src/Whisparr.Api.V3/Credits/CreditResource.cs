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

        public string PersonName { get; set; }
        public int PerformerId { get; set; }
        public string ForeignId { get; set; }
        public int MovieMetadataId { get; set; }
        public List<MediaCover> Images { get; set; }
        public string Job { get; set; }
        public string Character { get; set; }
        public int Order { get; set; }
        public CreditType Type { get; set; }
        public bool CanMonitor { get; set; }
        public bool Monitored { get; set; }
        public bool CanMovieMonitor { get; set; }
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
