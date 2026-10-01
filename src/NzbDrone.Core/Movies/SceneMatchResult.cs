using System.Collections.Generic;
using System.Linq;

namespace NzbDrone.Core.Movies
{
    /// <summary> The outcome of matching a scene release against the library. </summary>
    public class SceneMatchResult
    {
        // More candidates than this is no longer a coin toss a human can settle at a glance
        public const int MaxAmbiguousCandidates = 3;

        /// <summary> The scene the release was matched to, if the match is good enough to use automatically. </summary>
        public Movie Movie { get; set; }

        /// <summary>
        /// Scenes a dateless release may belong to when no match was good enough to use automatically:
        /// one scene matched on a weak match type, or a few scenes of the studio matched equally well.
        /// </summary>
        public List<SceneMatchCandidate> ReviewCandidates { get; set; } = new ();

        public bool NeedsReview => Movie == null && ReviewCandidates.Any();

        public static SceneMatchResult Matched(Movie movie)
        {
            return new SceneMatchResult { Movie = movie };
        }
    }

    public class SceneMatchCandidate
    {
        public Movie Movie { get; set; }
        public MovieParseMatchType MatchType { get; set; }

        public SceneMatchCandidate()
        {
        }

        public SceneMatchCandidate(Movie movie, MovieParseMatchType matchType)
        {
            Movie = movie;
            MatchType = matchType;
        }
    }
}
