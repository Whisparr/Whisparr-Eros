using System.Collections.Generic;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Movies.Performers;

namespace NzbDrone.Core.Movies.Credits
{
    public class Credit : ModelBase
    {
        public Credit()
        {
            Images = new List<MediaCover.MediaCover>();
        }

        // Unique identifier for the performer, either by foreign ID or by name (TMDB and TPDB do not always provide a foreign ID if they are not linked in StashDB.org)
        public string UniqueId
        {
            get
            {
                if (PerformerForeignId.IsNotNullOrWhiteSpace())
                {
                    return PerformerForeignId;
                }
                else
                {
                    return PersonName;
                }
            }
        }

        public string PersonName { get; set; }
        public string Job { get; set; }
        public int MovieMetadataId { get; set; }
        public List<MediaCover.MediaCover> Images { get; set; }
        public string PerformerForeignId { get; set; }
        public string Character { get; set; }
        public int Order { get; set; }
        public CreditType Type { get; set; }
        public CreditPerformer Performer { get; set; }
    }

    public class CreditPerformer
    {
        public CreditPerformer()
        {
            Images = new List<MediaCover.MediaCover>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public string Disambiguation { get; set; }
        public string ForeignId { get; set; }
        public int TmdbId { get; set; }
        public string TpdbId { get; set; }
        public Gender Gender { get; set; }
        public string Country { get; set; }
        public List<MediaCover.MediaCover> Images { get; set; }
        public bool Monitored { get; set; }
        public bool MoviesMonitored { get; set; }
    }

    public enum CreditType
    {
        Cast,
        Crew
    }
}
