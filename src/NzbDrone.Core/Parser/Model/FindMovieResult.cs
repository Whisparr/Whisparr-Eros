using NzbDrone.Core.Movies;

namespace NzbDrone.Core.Parser.Model
{
    public class FindMovieResult
    {
        public Movie Movie { get; set; }
        public MovieMatchType MatchType { get; set; }

        public FindMovieResult(Movie movie, MovieMatchType matchType)
        {
            Movie = movie;
            MatchType = matchType;
        }
    }

    public enum MovieMatchType
    {
        Unknown = 0,
        Title = 1,
        Alias = 2,
        Id = 3,
        FuzzyTitle = 4,

        // Picked by the user from the library, e.g. a review item approved for a scene that wasn't a candidate
        Manual = 5
    }
}
