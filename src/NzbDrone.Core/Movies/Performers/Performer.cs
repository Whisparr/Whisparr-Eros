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
        public string Disambiguation { get; set; }
        public List<string> Aliases { get; set; }
        public string SortName { get; set; }
        public string CleanName { get; set; }
        public List<MediaCover.MediaCover> Images { get; set; }
        public Gender Gender { get; set; }
        public DateTime? BirthDate { get; set; }
        public DateTime? DeathDate { get; set; }
        public int? Age { get; set; }
        public Ethnicity? Ethnicity { get; set; }
        public string Country { get; set; }
        public EyeColor? EyeColor { get; set; }
        public HairColor? HairColor { get; set; }
        public int? Height { get; set; }
        public string CupSize { get; set; }
        public int? BandSize { get; set; }
        public int? WaistSize { get; set; }
        public int? HipSize { get; set; }
        public BreastTypeEnum BreastType { get; set; }
        public int? CareerStart { get; set; }
        public int? CareerEnd { get; set; }
        public List<string> Tattoos { get; set; }
        public List<string> Piercings { get; set; }
        public PerformerStatus Status { get; set; }
        public string RootFolderPath { get; set; }
        public DateTime Added { get; set; }
        public bool Monitored { get; set; }
        public bool MoviesMonitored { get; set; }
        public int QualityProfileId { get; set; }
        public bool SearchOnAdd { get; set; }
        public DateTime? LastInfoSync { get; set; }
        public HashSet<int> Tags { get; set; }

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

    public enum BreastTypeEnum
    {
        Natural,
        Fake,
        NA
    }

    public enum EyeColor
    {
        Blue,
        Brown,
        Grey,
        Green,
        Hazel,
        Red,
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
