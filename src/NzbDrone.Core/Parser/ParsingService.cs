using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Parser.RomanNumerals;

namespace NzbDrone.Core.Parser
{
    public interface IParsingService
    {
        Movie GetMovie(string title, bool interactive = false);
        RemoteMovie Map(ParsedMovieInfo parsedMovieInfo, string imdbId, int tmdbId, SearchCriteriaBase searchCriteria = null);
        RemoteMovie Map(ParsedMovieInfo parsedMovieInfo, int movieId);
        ParsedMovieInfo ParseMinimalPathMovieInfo(string path);
    }

    public class ParsingService : IParsingService
    {
        private static HashSet<ArabicRomanNumeral> _arabicRomanNumeralMappings;

        private readonly IMovieService _movieService;
        private readonly Logger _logger;

        public ParsingService(IMovieService movieService,
                              Logger logger)
        {
            _movieService = movieService;
            _logger = logger;

            if (_arabicRomanNumeralMappings == null)
            {
                _arabicRomanNumeralMappings = RomanNumeralParser.GetArabicRomanNumeralsMapping();
            }
        }

        public ParsedMovieInfo ParseMinimalPathMovieInfo(string path)
        {
            var fileInfo = new FileInfo(path);

            var result = Parser.ParseMovieTitle(fileInfo.Name, true);

            if (result == null)
            {
                _logger.Debug("Attempting to parse movie info using directory and file names. '{0}'", fileInfo.Directory.Name);
                result = Parser.ParseMovieTitle(fileInfo.Directory.Name + " " + fileInfo.Name);
            }

            if (result == null)
            {
                _logger.Debug("Attempting to parse movie info using directory name. '{0}'", fileInfo.Directory.Name);
                result = Parser.ParseMovieTitle(fileInfo.Directory.Name + fileInfo.Extension);
            }

            return result;
        }

        public Movie GetMovie(string title, bool interactive = false)
        {
            var parsedMovieInfo = Parser.ParseMovieTitle(title);

            if (parsedMovieInfo == null)
            {
                return _movieService.FindByTitle(title);
            }

            if (parsedMovieInfo.IsScene)
            {
                var scene = _movieService.FindScene(parsedMovieInfo, interactive, null);

                if (scene != null || !parsedMovieInfo.IsDatelessScene)
                {
                    return scene;
                }
            }

            // Not a scene, or a dateless "Studio - Title" release that may be a movie named "Title - Subtitle"
            var result = TryGetMovieByTitleAndOrYear(parsedMovieInfo);

            return result?.Movie;
        }

        public RemoteMovie Map(ParsedMovieInfo parsedMovieInfo, string imdbId, int tmdbId, SearchCriteriaBase searchCriteria = null)
        {
            return Map(parsedMovieInfo, imdbId, tmdbId, null, searchCriteria);
        }

        public RemoteMovie Map(ParsedMovieInfo parsedMovieInfo, int movieId)
        {
            return new RemoteMovie
            {
                ParsedMovieInfo = parsedMovieInfo,
                Movie = _movieService.GetMovie(movieId)
            };
        }

        public RemoteMovie Map(ParsedMovieInfo parsedMovieInfo, string imdbId, int tmdbId, Movie movie, SearchCriteriaBase searchCriteria)
        {
            var remoteMovie = new RemoteMovie
            {
                ParsedMovieInfo = parsedMovieInfo
            };

            var reviewCandidates = new List<SceneMatchCandidate>();

            if (movie == null)
            {
                var movieMatch = FindMovie(parsedMovieInfo, imdbId, tmdbId, searchCriteria, reviewCandidates);

                if (movieMatch != null)
                {
                    movie = movieMatch.Movie;
                    remoteMovie.MovieMatchType = movieMatch.MatchType;
                }
            }

            if (movie != null)
            {
                remoteMovie.Movie = movie;
            }
            else
            {
                remoteMovie.ReviewCandidates = reviewCandidates;
            }

            remoteMovie.Languages = parsedMovieInfo.Languages;

            if (searchCriteria != null)
            {
                remoteMovie.MovieRequested = remoteMovie.Movie?.Id == searchCriteria.Movie?.Id;
            }

            return remoteMovie;
        }

        private FindMovieResult FindMovie(ParsedMovieInfo parsedMovieInfo, string imdbId, int tmdbId, SearchCriteriaBase searchCriteria, List<SceneMatchCandidate> reviewCandidates)
        {
            FindMovieResult result = null;
            var searchingForScene = searchCriteria?.Movie.MovieMetadata?.Value.ItemType == ItemType.Scene;

            if (parsedMovieInfo.IsScene || searchingForScene)
            {
                result = GetSceneMovie(parsedMovieInfo, searchCriteria, reviewCandidates);

                if (result?.Movie == null)
                {
                    _logger.Debug($"No matching scene '{searchCriteria}' for '{parsedMovieInfo}'");
                }
            }

            // A dateless "Studio - Title" parse may just as well be a movie named "Title - Subtitle", so fall back to a movie lookup
            var datelessMovieFallback = result == null && parsedMovieInfo.IsDatelessScene && !searchingForScene;

            if (datelessMovieFallback || !(parsedMovieInfo.IsScene || searchingForScene))
            {
                if (result == null && tmdbId > 0)
                {
                    result = TryGetMovieByTmdbId(parsedMovieInfo, tmdbId);
                }

                if (result == null)
                {
                    if (searchCriteria != null)
                    {
                        result = TryGetMovieBySearchCriteria(parsedMovieInfo, imdbId, tmdbId, searchCriteria);
                    }
                    else
                    {
                        result = TryGetMovieByTitleAndOrYear(parsedMovieInfo);
                    }
                }

                if (result == null && parsedMovieInfo.Year >= 1800)
                {
                    result = TryGetMovieByFuzzyYear(parsedMovieInfo, searchCriteria);
                }

                if (result == null)
                {
                    _logger.Debug($"No matching movie for titles '{string.Join(", ", parsedMovieInfo.MovieTitles)} ({parsedMovieInfo.Year})'");
                }
            }

            return result;
        }

        private FindMovieResult TryGetMovieByTmdbId(ParsedMovieInfo parsedMovieInfo, int tmdbId)
        {
            var movie = _movieService.FindByTmdbId(tmdbId);

            // Should fix practically all problems, where indexer is shite at adding correct imdbids to movies.
            if (movie != null && (parsedMovieInfo.Year < 1800 || movie.MovieMetadata.Value.Year == parsedMovieInfo.Year))
            {
                return new FindMovieResult(movie, MovieMatchType.Id);
            }

            return null;
        }

        private FindMovieResult TryGetMovieByTitleAndOrYear(ParsedMovieInfo parsedMovieInfo)
        {
            var candidates = _movieService.FindByTitleCandidates(parsedMovieInfo.MovieTitles, out var otherTitles)?
                                    .Where(c => c.MovieMetadata.Value?.ItemType == ItemType.Movie).ToList();

            Movie movieByTitleAndOrYear;
            if (parsedMovieInfo.Year > 1800)
            {
                movieByTitleAndOrYear = _movieService.FindByTitle(parsedMovieInfo.MovieTitles, parsedMovieInfo.Year, otherTitles, candidates);
                if (movieByTitleAndOrYear != null && movieByTitleAndOrYear.MovieMetadata?.Value.ItemType == ItemType.Movie)
                {
                    return new FindMovieResult(movieByTitleAndOrYear, MovieMatchType.Title);
                }

                return null;
            }

            movieByTitleAndOrYear = _movieService.FindByTitle(parsedMovieInfo.MovieTitles, null, otherTitles, candidates);
            if (movieByTitleAndOrYear != null && movieByTitleAndOrYear.MovieMetadata?.Value.ItemType == ItemType.Movie)
            {
                return new FindMovieResult(movieByTitleAndOrYear, MovieMatchType.Title);
            }

            return null;
        }

        /// <summary>
        /// Fallback for releases that carry a leading category tag (e.g. "GAY:") or otherwise fail exact-title matching but parse to a reliable release year. Delegates the Levenshtein scoring and margin disambiguation to MovieService.
        /// </summary>
        /// <remarks>During a search the fuzzy result is only accepted when it is the movie that was searched for - a near-miss on some other library entry is not a reason to attribute this release to it.</remarks>
        private FindMovieResult TryGetMovieByFuzzyYear(ParsedMovieInfo parsedMovieInfo, SearchCriteriaBase searchCriteria)
        {
            var title = parsedMovieInfo.PrimaryMovieTitle;
            if (title.IsNullOrWhiteSpace())
            {
                return null;
            }

            var movie = _movieService.FindFuzzyMovieByYear(title, parsedMovieInfo.Year);
            if (movie == null || movie.MovieMetadata?.Value.ItemType != ItemType.Movie)
            {
                return null;
            }

            if (searchCriteria?.Movie != null && movie.Id != searchCriteria.Movie.Id)
            {
                _logger.Debug("Fuzzy match found [{0}] but [{1}] was searched for, ignoring", movie.Title, searchCriteria.Movie.Title);

                return null;
            }

            return new FindMovieResult(movie, MovieMatchType.FuzzyTitle);
        }

        private static FindMovieResult TryGetMovieBySearchCriteria(ParsedMovieInfo parsedMovieInfo, string imdbId, int tmdbId, SearchCriteriaBase searchCriteria)
        {
            Movie possibleMovie = null;

            var possibleTitles = new List<string>
            {
                searchCriteria.Movie.MovieMetadata.Value.CleanTitle
            };

            var cleanTitles = parsedMovieInfo.MovieTitles.Select(t => t.CleanMovieTitle()).ToArray();

            if (possibleTitles.Any(pt =>
                cleanTitles.Contains(pt)
                || _arabicRomanNumeralMappings.Any(mn =>
                    cleanTitles.Contains(pt.Replace(mn.ArabicNumeralAsString, mn.RomanNumeralLowerCase))
                    || cleanTitles.Any(t => t.Replace(mn.ArabicNumeralAsString, mn.RomanNumeralLowerCase) == pt))))
            {
                possibleMovie = searchCriteria.Movie;
            }

            if (possibleMovie != null && (parsedMovieInfo.Year < 1800 || possibleMovie.MovieMetadata.Value.Year == parsedMovieInfo.Year))
            {
                return new FindMovieResult(possibleMovie, MovieMatchType.Title);
            }

            if (tmdbId > 0 && tmdbId == searchCriteria.Movie.TmdbId)
            {
                return new FindMovieResult(searchCriteria.Movie, MovieMatchType.Id);
            }

            if (imdbId.IsNotNullOrWhiteSpace() && imdbId == searchCriteria.Movie.ImdbId)
            {
                return new FindMovieResult(searchCriteria.Movie, MovieMatchType.Id);
            }

            return null;
        }

        private FindMovieResult GetSceneMovie(ParsedMovieInfo parsedMovieInfo, SearchCriteriaBase searchCriteria, List<SceneMatchCandidate> reviewCandidates)
        {
            Movie movieInfo = null;
            SceneMatchResult sceneMatch = null;
            try
            {
                sceneMatch = _movieService.FindSceneMatch(parsedMovieInfo, searchCriteria?.InteractiveSearch ?? false, searchCriteria);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "FindScene Failed for {StudioTitle} {ReleaseDate} {ReleaseTitle}", parsedMovieInfo.StudioTitle, parsedMovieInfo.ReleaseDate, parsedMovieInfo.ReleaseTitle);
            }

            var movie = sceneMatch?.Movie;

            if (sceneMatch is { NeedsReview: true })
            {
                reviewCandidates.AddRange(GetReviewCandidates(sceneMatch.ReviewCandidates, searchCriteria));
            }

            if (movie != null && searchCriteria != null)
            {
                if (IsSearchedMovie(movie, searchCriteria))
                {
                    movieInfo = searchCriteria.Movie;
                }

                if (movieInfo != null)
                {
                    return new FindMovieResult(movieInfo, MovieMatchType.Id);
                }
            }
            else
            {
                // A scene matched on the studio catalogue alone comes without its profile and file, which deciding on the release needs
                movieInfo = movie?.QualityProfile == null && movie?.Id > 0 ? _movieService.GetMovie(movie.Id) ?? movie : movie;
            }

            if (movieInfo == null)
            {
                return null;
            }

            return new FindMovieResult(movieInfo, MovieMatchType.Title);
        }

        private List<SceneMatchCandidate> GetReviewCandidates(List<SceneMatchCandidate> candidates, SearchCriteriaBase searchCriteria)
        {
            if (searchCriteria != null)
            {
                // A search only keeps releases for the scene it searched for, the searched scene leads so the release is evaluated against it
                var searched = candidates.FirstOrDefault(c => IsSearchedMovie(c.Movie, searchCriteria));

                if (searched == null)
                {
                    return new List<SceneMatchCandidate>();
                }

                return candidates.Where(c => c != searched)
                                 .Prepend(new SceneMatchCandidate(searchCriteria.Movie, searched.MatchType))
                                 .ToList();
            }

            var movies = (_movieService.FindByIds(candidates.Select(c => c.Movie.Id).ToList()) ?? new List<Movie>()).ToDictionary(m => m.Id);

            return candidates.Select(c => new SceneMatchCandidate(movies.GetValueOrDefault(c.Movie.Id, c.Movie), c.MatchType)).ToList();
        }

        private static bool IsSearchedMovie(Movie movie, SearchCriteriaBase searchCriteria)
        {
            return (movie.ForeignId != null && searchCriteria.Movie.ForeignId == movie.ForeignId) ||
                   (movie.TmdbId != 0 && searchCriteria.Movie.TmdbId == movie.TmdbId);
        }
    }
}
