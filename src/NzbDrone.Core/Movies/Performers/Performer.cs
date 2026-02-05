using System;
using System.Collections.Generic;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Movies.Performers
{
    public class Performer : ModelBase
    {
        public Performer()
        {
            Images = new List<MediaCover.MediaCover>();
            Tags = new HashSet<int>();
        }

        public string ForeignId { get; set; }
        public int TmdbId { get; set; }
        public string TpdbId { get; set; }
        public string MergedIntoId { get; set; }
        public string Name { get; set; }
        public string SortName { get; set; }
        public string CleanName { get; set; }
        public List<MediaCover.MediaCover> Images { get; set; }
        public Gender Gender { get; set; }
        public Ethnicity? Ethnicity { get; set; }
        public HairColor? HairColor { get; set; }
        public int? Age { get; set; }
        public int? CareerStart { get; set; }
        public int? CareerEnd { get; set; }
        public PerformerStatus Status { get; set; }
        public string RootFolderPath { get; set; }
        public DateTime Added { get; set; }
        public bool Monitored { get; set; }
        public bool MoviesMonitored { get; set; }
        public int QualityProfileId { get; set; }
        public bool SearchOnAdd { get; set; }
        public DateTime? LastInfoSync { get; set; }
        public HashSet<int> Tags { get; set; }

        /// <summary> Number of scenes in Whisparr with this performer</summary>
        public int TotalSceneCount { get; set; }

        /// <summary> Number of movies in Whisparr with this performer</summary>
        public int TotalMovieCount { get; set; }

        /// <summary>Total size in bytes of all files on disk associated with this performer</summary>
        public long SizeOnDisk { get; set; }

        /// <summary>Number of scenes have a file on disk that has this performer in them. This is not the same as TotalMovieCount, which is the total number of movies that have this performer in them, regardless of whether they have a file on disk or not.</summary>
        /// <remarks> This is not the same as TotalSceneCount, which is the total number of scenes that have this performer in them. </remarks>
        public int SceneCount { get; set; }

        /// <summary>Number of movies have a file on disk that has this performer in them. </summary>
        /// <remarks> This is not the same as TotalMovieCount, which is the total number of movies that have this performer in them. </remarks>
        public int MovieCount { get; set; }

        public void ApplyChanges(Performer otherPerformer)
        {
            QualityProfileId = otherPerformer.QualityProfileId;
            SearchOnAdd = otherPerformer.SearchOnAdd;
            Monitored = otherPerformer.Monitored;
            MoviesMonitored = otherPerformer.MoviesMonitored;
            RootFolderPath = otherPerformer.RootFolderPath;
            Tags = otherPerformer.Tags;
        }

        public override string ToString()
        {
            return string.Format("[{0}]", Name.NullSafe());
        }
    }

    public enum PerformerStatus
    {
        Active,
        Inactive,
        Unknown,
        Deleted
    }

    public enum Ethnicity
    {
        Caucasian,
        Black,
        Asian,
        Indian,
        Latin,
        MiddleEastern,
        Mixed,
        Other
    }

    public enum HairColor
    {
        Blonde,
        Brunette,
        Black,
        Red,
        Auburn,
        Grey,
        Bald,
        Various,
        Other
    }

    public enum Gender
    {
        Male,
        Female,
        TransMale,
        TransFemale,
        Intersex,
        NonBinary
    }
}
