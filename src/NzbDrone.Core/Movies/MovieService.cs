using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using DryIoc.ImTools;
using NLog;
using NzbDrone.Common;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.AutoTagging;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Parser.RomanNumerals;

namespace NzbDrone.Core.Movies
{
    public interface IMovieService
    {
        Movie GetMovie(int movieId);
        List<Movie> GetMovies(IEnumerable<int> movieIds);
        PagingSpec<Movie> Paged(PagingSpec<Movie> pagingSpec);
        Movie AddMovie(Movie newMovie);
        List<Movie> AddMovies(List<Movie> newMovies);
        List<Movie> FindByIds(List<int> ids);
        Movie FindByTpdbId(string tpdbid);
        Movie FindByImdbId(string imdbid);
        Movie FindByTmdbId(int tmdbid);
        Movie FindByForeignId(string foreignId);
        List<Movie> FindByForeignIds(List<string> foreignIds);
        Movie FindByTitle(string title);
        Movie FindByTitle(string title, int year);
        Movie FindByTitle(List<string> titles, int? year, List<string> otherTitles, List<Movie> candidates);
        List<Movie> FindByTitleCandidates(List<string> titles, out List<string> otherTitles);
        Movie FindScene(ParsedMovieInfo parsedMovieInfo, bool interactiveSearch = false, SearchCriteriaBase searchCriteria = null);
        List<Movie> GetByStudioForeignId(string studioForeignId);
        List<Movie> GetByPerformerForeignId(string performerForeignId);
        Movie FindByPath(string path);
        Dictionary<int, string> AllMoviePaths();
        List<int> AllMovieIds();
        List<int> AllMovieIdsOrderByLastInfoSync();
        List<int> AllMovieTmdbIds();
        List<string> AllMovieTpdbIds();
        List<string> AllMovieStashIds();
        List<string> AllMovieForeignIds();
        bool MovieExists(Movie movie);
        List<Movie> GetMoviesByFileId(int fileId);
        List<Movie> GetMoviesByFileId(IEnumerable<int> fileId);
        List<Movie> GetMoviesByCollectionTmdbId(int collectionId);
        List<Movie> GetMoviesBetweenDates(DateTime start, DateTime end, bool includeUnmonitored);
        PagingSpec<Movie> MoviesWithoutFiles(PagingSpec<Movie> pagingSpec, HashSet<int> movieTags = null);
        void DeleteMovie(int movieId, bool deleteFiles, bool addImportListExclusion = false);
        void DeleteMovies(List<int> movieIds, bool deleteFiles, bool addImportListExclusion = false);
        List<Movie> GetAllMovies();
        Dictionary<int, List<int>> AllMovieTags();
        Movie UpdateMovie(Movie movie);
        List<Movie> UpdateMovie(List<Movie> movies, bool useExistingRelativeFolder);
        List<Movie> UpdateMovieMonitored(List<Movie> movies, bool monitored);
        void UpdateLastSearchTime(Movie movie);
        bool MoviePathExists(string folder);
        void RemoveAddOptions(Movie movie);
        bool UpdateTags(Movie movie);
        bool ExistsByMetadataId(int metadataId);
        void SetFileIds(List<Movie> movies);
        Dictionary<Movie, MovieParseMatchType> MatchMovies(string parsedMovieTitle, string releaseDate, string foreignId, string episode, List<Movie> movies, bool verifyDate, bool verifyEpisode);
        List<Movie> SearchMovies(string query);
        HashSet<int> AllMovieWithCollectionsTmdbIds();
    }

    public class MovieService : IMovieService, IHandle<MovieFileAddedEvent>,
                                               IHandle<MovieFileDeletedEvent>
    {
        private readonly IMovieRepository _movieRepository;
        private readonly ICreditService _creditService;
        private readonly IStudioService _studioService;
        private readonly IConfigService _configService;
        private readonly IEventAggregator _eventAggregator;
        private readonly IBuildMoviePaths _moviePathBuilder;
        private readonly IAutoTaggingService _autoTaggingService;
        private readonly ICacheManager _cacheManager;
        private readonly string _cacheName;
        private readonly Logger _logger;

        public MovieService(IMovieRepository movieRepository,
                            ICreditService creditService,
                            IStudioService studioService,
                            IEventAggregator eventAggregator,
                            IConfigService configService,
                            IBuildMoviePaths moviePathBuilder,
                            IAutoTaggingService autoTaggingService,
                            ICacheManager cacheManager,
                            Logger logger)
        {
            _movieRepository = movieRepository;
            _creditService = creditService;
            _studioService = studioService;
            _eventAggregator = eventAggregator;
            _configService = configService;
            _moviePathBuilder = moviePathBuilder;
            _autoTaggingService = autoTaggingService;
            _cacheManager = cacheManager;
            _cacheName = "Whisparr.Api.V3.Movies.MovieResource_movieResources";

            _logger = logger;
        }

        /// <summary> Get a single movie by its unique identifier. </summary>
        /// <param name="movieId">The unique identifier of the movie to retrieve.</param>
        public Movie GetMovie(int movieId)
        {
            return _movieRepository.Get(movieId);
        }

        /// <summary> Get multiple movies by their unique identifiers. </summary>
        /// <param name="movieIds">A collection of unique identifiers for the movies to retrieve.</param>
        public List<Movie> GetMovies(IEnumerable<int> movieIds)
        {
            return _movieRepository.Get(movieIds).ToList();
        }

        /// <summary> Get a paged list of movies. </summary>
        /// <param name="pagingSpec"></param>
        /// <returns></returns>
        public PagingSpec<Movie> Paged(PagingSpec<Movie> pagingSpec)
        {
            return _movieRepository.GetPaged(pagingSpec);
        }

        /// <summary> Add a new movie to the repository. </summary>
        /// <param name="newMovie">The movie object to add.</param>
        public Movie AddMovie(Movie newMovie)
        {
            var movie = _movieRepository.Insert(newMovie);
            if (movie.Title != null)
            {
                _eventAggregator.PublishEvent(new MovieAddedEvent(GetMovie(movie.Id)));
            }

            return movie;
        }

        /// <summary> Add multiple new movies to the repository. </summary>
        /// <param name="newMovies">A list of movie objects to add.</param>
        /// <returns>The list of added movies.</returns>
        public List<Movie> AddMovies(List<Movie> newMovies)
        {
            _movieRepository.InsertMany(newMovies);

            _eventAggregator.PublishEvent(new MoviesImportedEvent(newMovies));

            return newMovies;
        }

        /// <summary> Find a movie by its title. </summary>
        /// <param name="title">The title of the movie to find.</param>
        /// <returns>The movie object if found; otherwise, null.</returns>
        public Movie FindByTitle(string title)
        {
            var candidates = FindByTitleCandidates(new List<string> { title }, out var otherTitles);

            return FindByTitle(new List<string> { title }, null, otherTitles, candidates);
        }

        /// <summary> Find a movie by its title and release year. </summary>
        /// <param name="title">The title of the movie to find.</param>
        /// <param name="year">The release year of the movie to find.</param>
        /// <returns>The movie object if found; otherwise, null.</returns>
        public Movie FindByTitle(string title, int year)
        {
            var candidates = FindByTitleCandidates(new List<string> { title }, out var otherTitles);

            return FindByTitle(new List<string> { title }, year, otherTitles, candidates);
        }

        /// <summary> Find a movie by a list of titles, optional year, and other titles from candidates. </summary>
        /// <param name="titles">A list of titles to search for.</param>
        /// <param name="year">An optional release year to filter the search.</param>
        /// <param name="otherTitles">A list of other titles to consider from candidates.</param>
        /// <param name="candidates">A list of candidate movies to search within.</param>
        /// <returns>The movie object if found; otherwise, null.</returns>
        public Movie FindByTitle(List<string> titles, int? year, List<string> otherTitles, List<Movie> candidates)
        {
            var cleanTitles = titles.Select(t => t.CleanMovieTitle().ToLowerInvariant());

            var result = candidates.Where(x => cleanTitles.Contains(x.MovieMetadata.Value.CleanTitle))
                .AllWithYear(year)
                .ToList();

            if (result == null || result.Count == 0)
            {
                result =
                    candidates.Where(movie => otherTitles.Contains(movie.MovieMetadata.Value.CleanTitle)).AllWithYear(year).ToList();
            }

            if (result == null || result.Count == 0)
            {
                result = candidates
                    .Where(m => m.MovieMetadata.Value.AlternativeTitles.Any(t => cleanTitles.Contains(t.CleanTitle) ||
                                                        otherTitles.Contains(t.CleanTitle)))
                    .AllWithYear(year).ToList();
            }

            return ReturnSingleMovieOrThrow(result.ToList());
        }

        /// <summary> Find movies by a list of title candidates. </summary>
        /// <param name="titles">A list of titles to search for.</param>
        /// <param name="otherTitles">Outputs a list of other titles found during the search.</param>
        /// <returns>A list of movies matching the title candidates.</returns>
        public List<Movie> FindByTitleCandidates(List<string> titles, out List<string> otherTitles)
        {
            var lookupTitles = new List<string>();
            otherTitles = new List<string>();

            foreach (var title in titles)
            {
                var cleanTitle = title.CleanMovieTitle().ToLowerInvariant();
                var alternateTitle = title.AlternateTitle().ToLowerInvariant();
                var romanTitle = cleanTitle;
                var arabicTitle = cleanTitle;

                foreach (var arabicRomanNumeral in RomanNumeralParser.GetArabicRomanNumeralsMapping())
                {
                    var arabicNumber = arabicRomanNumeral.ArabicNumeralAsString;
                    var romanNumber = arabicRomanNumeral.RomanNumeral;

                    romanTitle = romanTitle.Replace(arabicNumber, romanNumber);
                    arabicTitle = arabicTitle.Replace(romanNumber, arabicNumber);
                }

                romanTitle = romanTitle.ToLowerInvariant();

                otherTitles.AddRange(new List<string> { arabicTitle, romanTitle });
                lookupTitles.AddRange(new List<string> { cleanTitle, arabicTitle, romanTitle, alternateTitle });
            }

            return _movieRepository.FindByTitles(lookupTitles);
        }

        /// <summary> Search for movies based on a query string. </summary>
        /// <param name="query">The search query string.</param>
        /// <returns>A list of movies matching the search query.</returns>
        public List<Movie> SearchMovies(string query)
        {
            var cleanTitle = query.CleanMovieTitle();

            return _movieRepository.SearchMovies(cleanTitle, query);
        }

        /// <summary> Find multiple movies by their unique identifiers. </summary>
        /// <param name="ids">A list of unique identifiers for the movies to find.</param>
        /// <returns>A list of movies matching the provided identifiers.</returns>
        public List<Movie> FindByIds(List<int> ids)
        {
            return _movieRepository.FindByIds(ids).ToList();
        }

        /// <summary> Find a movie by its TPDB identifier. </summary>
        /// <param name="tpdbid">The TPDB identifier of the movie to find.</param>
        /// <returns>The movie object if found; otherwise, null.</returns>
        public Movie FindByTpdbId(string tpdbid)
        {
            return _movieRepository.FindByTpdbId(tpdbid);
        }

        /// <summary> Find a movie by its IMDb identifier. </summary>
        /// <param name="imdbid">The IMDb identifier of the movie to find.</param>
        /// <returns>The movie object if found; otherwise, null.</returns>
        [Obsolete("IMDB is not used on this platform")]
        public Movie FindByImdbId(string imdbid)
        {
            return _movieRepository.FindByImdbId(imdbid);
        }

        /// <summary> Find a movie by its TMDB identifier. </summary>
        /// <param name="tmdbid">The TMDB identifier of the movie to find.</param>
        /// <returns>The movie object if found; otherwise, null.</returns>
        public Movie FindByTmdbId(int tmdbid)
        {
            return _movieRepository.FindByTmdbId(tmdbid);
        }

        /// <summary> Find a movie by its foreign identifier. </summary>
        /// <param name="foreignId">The foreign identifier (StashDB UUID)of the movie to find.</param>
        /// <returns>The movie object if found; otherwise, null.</returns>
        public Movie FindByForeignId(string foreignId)
        {
            return _movieRepository.FindByForeignId(foreignId);
        }

        public List<Movie> FindByForeignIds(List<string> foreignIds)
        {
            return _movieRepository.FindByForeignIds(foreignIds);
        }

        /// <summary> Find a movie by its file system path. </summary>
        /// <param name="path">The file system path of the movie to find.</param>
        /// <returns>The movie object if found; otherwise, null.</returns>
        public Movie FindByPath(string path)
        {
            return _movieRepository.FindByPath(path);
        }

        /// <summary> Get a dictionary of all movie IDs and their corresponding file system paths. </summary>
        /// <returns>A dictionary mapping movie IDs to their file system paths.</returns>
        public Dictionary<int, string> AllMoviePaths()
        {
            return _movieRepository.AllMoviePaths();
        }

        /// <summary> Get a list of all movie IDs in the repository. </summary>
        /// <returns>A list of all movie IDs.</returns>
        public List<int> AllMovieIds()
        {
            return _movieRepository.AllMovieIds();
        }

        /// <summary> Get a list of all movie IDs in the repository. Order by yLastInfoSyn</summary>
        /// <returns>A list of all movie IDs.</returns>
        public List<int> AllMovieIdsOrderByLastInfoSync()
        {
            return _movieRepository.AllMovieIdsOrderByLastInfoSync();
        }

        /// <summary> Get a list of all TMDB IDs for movies in the repository. </summary>
        /// <returns>A list of all TMDB IDs.</returns>
        public List<int> AllMovieTmdbIds()
        {
            return _movieRepository.AllMovieTmdbIds();
        }

        /// <summary> Get a list of all TPDB IDs for movies in the repository. </summary>
        /// <returns>A list of all TPDB IDs.</returns>
        public List<string> AllMovieTpdbIds()
        {
            return _movieRepository.AllMovieTpdbIds();
        }

        /// <summary> Get a list of all StashDB IDs for movies in the repository. </summary>
        /// <returns>A list of all StashDB IDs.</returns>
        public List<string> AllMovieStashIds()
        {
            return _movieRepository.AllMovieStashIds();
        }

        /// <summary> Get a list of all foreign IDs for movies in the repository. </summary>
        /// <returns>A list of all foreign IDs.</returns>
        public List<string> AllMovieForeignIds()
        {
            return _movieRepository.AllMovieForeignIds();
        }

        /// <summary> Get a list of all studio foreign IDs for movies in the repository. </summary>
        /// <param name="studioForeignId">The foreign ID of the studio.</param>
        /// <returns>A list of movies associated with the specified studio foreign ID.</returns>
        public List<Movie> GetByStudioForeignId(string studioForeignId)
        {
            return _movieRepository.GetByStudioForeignId(studioForeignId);
        }

        /// <summary> Get a list of all movies with the performer foreign ID in the repository. </summary>
        /// <param name="performerForeignId">The foreign ID of the performer.</param>
        /// <returns>A list of movies associated with the specified performer foreign ID.</returns>
        public List<Movie> GetByPerformerForeignId(string performerForeignId)
        {
            return _movieRepository.GetByPerformerForeignId(performerForeignId);
        }

        /// <summary> Delete a movie from the repository. </summary>
        /// <param name="movieId">The unique identifier of the movie to delete.</param>
        /// <param name="deleteFiles">Indicates whether to delete the associated files from the file system.</param>
        /// <param name="addImportListExclusion">Indicates whether to add the movie to the import list exclusion.</param>
        /// <returns>void</returns>
        public void DeleteMovie(int movieId, bool deleteFiles, bool addImportListExclusion = false)
        {
            var movie = _movieRepository.Get(movieId);

            _movieRepository.Delete(movieId);
            _eventAggregator.PublishEvent(new MoviesDeletedEvent(new List<Movie> { movie }, deleteFiles, addImportListExclusion));
            _logger.Info("Deleted movie {0}", movie);

            RemoveMovieResourcesCache($"{movieId}");
        }

        /// <summary> Delete multiple movies from the repository. </summary>
        /// <param name="movieIds">A list of unique identifiers of the movies to delete.</param>
        /// <param name="deleteFiles">Indicates whether to delete the associated files from the file system.</param>
        /// <param name="addImportListExclusion">Indicates whether to add the movies to the import list exclusion.</param>
        /// <returns>void</returns>
        public void DeleteMovies(List<int> movieIds, bool deleteFiles, bool addImportListExclusion = false)
        {
            var moviesToDelete = _movieRepository.Get(movieIds).ToList();

            _movieRepository.DeleteMany(movieIds);

            _eventAggregator.PublishEvent(new MoviesDeletedEvent(moviesToDelete, deleteFiles, addImportListExclusion));

            foreach (var movie in moviesToDelete)
            {
                RemoveMovieResourcesCache($"{movie.Id}");
                _logger.Info("Deleted movie {0}", movie);
            }
        }

        /// <summary> Get a list of all movies in the repository. </summary>
        /// <remarks> This method is process-intensive for larger libraries. </remarks>
        /// <returns>A list of all movies.</returns>
        public List<Movie> GetAllMovies()
        {
            return _movieRepository.All().ToList();
        }

        /// <summary> Get a dictionary of all tag IDs assigned to movies. </summary>
        /// <returns>A dictionary mapping movie IDs to lists of tag IDs.</returns>
        public Dictionary<int, List<int>> AllMovieTags()
        {
            return _movieRepository.AllMovieTags();
        }

        /// <summary> Update an existing movie in the repository. </summary>
        /// <param name="movie">The movie object with updated information.</param>
        /// <returns>The updated movie object.</returns>
        public Movie UpdateMovie(Movie movie)
        {
            var storedMovie = GetMovie(movie.Id);

            UpdateTags(movie);

            var updatedMovie = _movieRepository.Update(movie);
            _eventAggregator.PublishEvent(new MovieEditedEvent(updatedMovie, storedMovie));

            RemoveMovieResourcesCache($"{movie.Id}");

            return updatedMovie;
        }

        /// <summary> Update multiple movies in the repository. </summary>
        /// <param name="movies">A list of movie objects with updated information.</param>
        /// <param name="useExistingRelativeFolder">Indicates whether to use the existing relative folder structure when updating paths.</param>
        /// <returns>A list of updated movie objects.</returns>
        public List<Movie> UpdateMovie(List<Movie> movies, bool useExistingRelativeFolder)
        {
            _logger.Debug("Updating {0} movies", movies.Count);

            foreach (var m in movies)
            {
                _logger.Trace("Updating: {0}", m.Title);

                if (!m.RootFolderPath.IsNullOrWhiteSpace())
                {
                    m.Path = _moviePathBuilder.BuildPath(m, useExistingRelativeFolder);

                    _logger.Trace("Changing path for {0} to {1}", m.Title, m.Path);
                }
                else
                {
                    _logger.Trace("Not changing path for: {0}", m.Title);
                }

                UpdateTags(m);

                RemoveMovieResourcesCache($"{m.Id}");
            }

            _movieRepository.UpdateMany(movies);
            _logger.Debug("{0} movies updated", movies.Count);
            _eventAggregator.PublishEvent(new MoviesBulkEditedEvent(movies));

            return movies;
        }

        /// <summary> Update the monitored status for multiple movies. </summary>
        /// <param name="movies">A list of movie objects to update.</param>
        /// <param name="monitored">The new monitored status to set for the movies.</param>
        /// <returns>A list of updated movie objects.</returns>
        public List<Movie> UpdateMovieMonitored(List<Movie> movies, bool monitored)
        {
            var methodName = "UpdateMovieMonitored";
            _logger.Debug("{0}: will update {1} movies ", methodName, movies.Count);
            foreach (var m in movies)
            {
                UpdateTags(m);
                RemoveMovieResourcesCache($"{m.Id}");
            }

            _movieRepository.UpdateMany(movies);
            _logger.Debug("{0}: {1} movies set to {2}", methodName, movies.Count, monitored ? "Monitored" : "Unmonitored");

            return movies;
        }

        /// <summary> Update the last search time for a movie. </summary>
        /// <param name="movie">The movie object to update.</param>
        /// <returns>void</returns>
        public void UpdateLastSearchTime(Movie movie)
        {
            _movieRepository.SetFields(movie, e => e.LastSearchTime);
        }

        /// <summary> Check if a movie path exists in the repository. </summary>
        /// <param name="folder">The folder path to check.</param>
        /// <returns>True if the movie path exists; otherwise, false.</returns>
        public bool MoviePathExists(string folder)
        {
            return _movieRepository.MoviePathExists(folder);
        }

        /// <summary> Remove add options for a movie. </summary>
        /// <param name="movie">The movie object to update.</param>
        /// <returns>void</returns>
        public void RemoveAddOptions(Movie movie)
        {
            _movieRepository.SetFields(movie, s => s.AddOptions);
        }

        /// <summary> Update tags for a movie based on auto-tagging rules. </summary>
        /// <param name="movie">The movie object to update.</param>
        /// <returns>True if tags were updated; otherwise, false.</returns>
        public bool UpdateTags(Movie movie)
        {
            _logger.Trace("Updating tags for {0}", movie);

            var tagsAdded = new HashSet<int>();
            var tagsRemoved = new HashSet<int>();
            var changes = _autoTaggingService.GetTagChanges(movie);

            foreach (var tag in changes.TagsToRemove)
            {
                if (movie.Tags.Contains(tag))
                {
                    movie.Tags.Remove(tag);
                    tagsRemoved.Add(tag);
                }
            }

            foreach (var tag in changes.TagsToAdd)
            {
                if (!movie.Tags.Contains(tag))
                {
                    movie.Tags.Add(tag);
                    tagsAdded.Add(tag);
                }
            }

            if (tagsAdded.Any() || tagsRemoved.Any())
            {
                _logger.Debug("Updated tags for '{0}'. Added: {1}, Removed: {2}", movie.Title, tagsAdded.Count, tagsRemoved.Count);

                return true;
            }

            _logger.Debug("Tags not updated for '{0}'", movie.Title);

            return false;
        }

        /// <summary> Get movies associated with a specific file ID. </summary>
        /// <param name="fileId">The unique identifier of the file.</param>
        /// <returns>A list of movies associated with the specified file ID.</returns>
        public List<Movie> GetMoviesByFileId(int fileId)
        {
            return _movieRepository.GetMoviesByFileId(fileId);
        }

        /// <summary> Get movies associated with a collection of file IDs. </summary>
        /// <param name="fileId">A collection of unique identifiers for the files.</param>
        /// <returns>A list of movies associated with the specified file IDs.</returns>
        public List<Movie> GetMoviesByFileId(IEnumerable<int> fileId)
        {
            return _movieRepository.GetMoviesByFileId(fileId);
        }

        /// <summary> Get movies associated with a specific TMDB collection  ID. </summary>
        /// <param name="collectionId">The TMDB ID of the collection.</param>
        /// <returns>A list of movies associated with the specified collection TMDB ID.</returns>
        public List<Movie> GetMoviesByCollectionTmdbId(int collectionId)
        {
            return _movieRepository.GetMoviesByCollectionTmdbId(collectionId);
        }

        /// <summary> Get movies released between specific dates. </summary>
        /// <param name="start">The start date of the range.</param>
        /// <param name="end">The end date of the range.</param>
        /// <param name="includeUnmonitored">Indicates whether to include unmonitored movies in the results.</param>
        /// <returns>A list of movies released between the specified dates.</returns>
        public List<Movie> GetMoviesBetweenDates(DateTime start, DateTime end, bool includeUnmonitored)
        {
            var movies = _movieRepository.MoviesBetweenDates(start.ToUniversalTime(), end.ToUniversalTime(), includeUnmonitored);

            return movies;
        }

        /// <summary> Get a paged list of movies without associated files. </summary>
        /// <param name="pagingSpec">The paging specification for the query.</param>
        /// <param name="movieTags">When set, restrict the results to movies carrying at least one of these tag ids.</param>
        /// <returns>A paged list of movies without associated files.</returns>
        public PagingSpec<Movie> MoviesWithoutFiles(PagingSpec<Movie> pagingSpec, HashSet<int> movieTags = null)
        {
            var movieResult = _movieRepository.MoviesWithoutFiles(pagingSpec, movieTags);

            return movieResult;
        }

        /// <summary> Check if a movie already exists in the repository based on various identifiers. </summary>
        /// <param name="movie">The movie object to check for existence.</param>
        /// <returns>True if the movie exists; otherwise, false.</returns>
        public bool MovieExists(Movie movie)
        {
            Movie result = null;

            if (movie.TmdbId != 0)
            {
                result = _movieRepository.FindByTmdbId(movie.TmdbId);
                if (result != null)
                {
                    return true;
                }
            }

            if (movie.ImdbId.IsNotNullOrWhiteSpace())
            {
                result = _movieRepository.FindByImdbId(movie.ImdbId);
                if (result != null)
                {
                    return true;
                }
            }

            if (movie.TpdbId.IsNotNullOrWhiteSpace())
            {
                result = _movieRepository.FindByTpdbId(movie.TpdbId);
                if (result != null)
                {
                    return true;
                }
            }

            if (movie.Title.IsNotNullOrWhiteSpace())
            {
                if (movie.Year > 1850)
                {
                    result = FindByTitle(movie.Title.CleanMovieTitle(), movie.Year);
                    if (result != null)
                    {
                        return true;
                    }
                }
                else
                {
                    result = FindByTitle(movie.Title.CleanMovieTitle());
                    if (result != null)
                    {
                        return true;
                    }
                }
            }

            return false;
        }

        /// <summary> Check if a movie exists by its metadata ID. </summary>
        /// <param name="metadataId">The metadata ID of the movie to check.</param>
        /// <returns>True if the movie exists; otherwise, false.</returns>
        public bool ExistsByMetadataId(int metadataId)
        {
            return _movieRepository.ExistsByMetadataId(metadataId);
        }

        /// <summary> Find a movie based on parsed movie information. </summary>
        /// <param name="parsedMovieInfo">The parsed movie information to use for the search.</param>
        /// <param name="interactive">Indicates whether the search is interactive.</param>
        /// <param name="searchCriteria">Optional search criteria to refine the search.</param>
        /// <returns>The movie object if found; otherwise, null.</returns>
        public Movie FindScene(ParsedMovieInfo parsedMovieInfo, bool interactive = false, SearchCriteriaBase searchCriteria = null)
        {
            Movie result = null;
            if (parsedMovieInfo.StashId.IsNotNullOrWhiteSpace())
            {
                result = FindByForeignId(parsedMovieInfo.StashId);
            }

            if (result == null && parsedMovieInfo.Code.IsNotNullOrWhiteSpace())
            {
                result = FindByTitle(parsedMovieInfo.Code);
            }

            if (result == null)
            {
                var studios = _studioService.FindAllByTitle(parsedMovieInfo.StudioTitle);

                if (studios != null && studios.Count > 0)
                {
                    var movies = new List<Movie>();

                    foreach (var studio in studios)
                    {
                        var movie = FindByStudioAndReleaseDate(studio.ForeignId, parsedMovieInfo.ReleaseDate, parsedMovieInfo.ReleaseTokens, parsedMovieInfo.StashId, parsedMovieInfo.Episode, interactive, searchCriteria);

                        if (movie != null)
                        {
                            movies.Add(movie);
                        }
                    }

                    if (movies.Count == 1)
                    {
                        result = movies.First();
                    }
                }
                else
                {
                    _logger.Debug("Could not find Studio name. '{0}'", parsedMovieInfo.StudioTitle);
                }
            }

            return result;
        }

        /// <summary> Get a set of all TMDB IDs for movies with collections in the repository. </summary>
        /// <returns>A set of TMDB IDs for movies with collections.</returns>
        public HashSet<int> AllMovieWithCollectionsTmdbIds()
        {
            return _movieRepository.AllMovieWithCollectionsTmdbIds();
        }

        /// <summary> Find a movie by studio foreign ID and release date. </summary>
        /// <param name="studioForeignId">The foreign ID of the studio.</param>
        /// <param name="releaseDate">The release date of the movie.</param>
        /// <param name="releaseTokens">The release tokens associated with the movie.</param>
        /// <param name="foreignId">The foreign ID of the movie.</param>
        /// <param name="episode">The episode information, if applicable.</param>
        /// <param name="interactiveSearch">Indicates whether the search is interactive.</param>
        /// <param name="searchCriteria">Optional search criteria to refine the search.</param>
        /// <remarks> This method employs fuzzy matching techniques to find the best match based on the provided parameters. </remarks>
        /// <returns>The movie object if found; otherwise, null.</returns>
        private Movie FindByStudioAndReleaseDate(string studioForeignId, string releaseDate, string releaseTokens, string foreignId, string episode, bool interactiveSearch = false, SearchCriteriaBase searchCriteria = null)
        {
            var methodName = "FindByStudioAndReleaseDate";
            if (string.IsNullOrEmpty(studioForeignId))
            {
                _logger.Debug($"{methodName}: Studio ForeignID is null or empty.");
                studioForeignId = string.Empty;
            }

            if (string.IsNullOrEmpty(releaseDate))
            {
                _logger.Debug($"{methodName}: Release Date is null or empty.");
                releaseDate = string.Empty;
            }

            if (string.IsNullOrEmpty(releaseTokens))
            {
                _logger.Debug($"{methodName}: Release Tokens is null or empty.");
                releaseTokens = string.Empty;
            }

            var movies = new List<Movie>();
            var verifyDate = false;
            var verifyEpisode = false;

            var hasReleaseDate = releaseDate.IsNotNullOrWhiteSpace();

            if (hasReleaseDate)
            {
                _logger.Debug("{0}: DB query for for movies for Studio ForeignID: [{1}] and Date: [{2}].", methodName, studioForeignId, releaseDate);
                movies = _movieRepository.FindByStudioAndDate(studioForeignId, releaseDate) ?? new List<Movie>();
            }

            // Try fuzzy release token matching if we've made it this far
            // Use Levenshtein Distance to find the closest match above 80%
            var fuzzyMatchMoviesWithScores = new List<(Movie movie, int score)>();
            var fuzzyTitleMatchingThreshold = _configService.WhisparrFuzzyTitleMatchingThreshold;
            if (fuzzyTitleMatchingThreshold >= 70)
            {
                _logger.Trace("Fuzzy match running with a score of {1}", fuzzyTitleMatchingThreshold);

                foreach (var movie in movies)
                {
                    var fuzzyStudioTitle = movie.MovieMetadata.Value.StudioTitle;
                    var fuzzyReleaseDate = movie.MovieMetadata.Value.ReleaseDate;
                    if (fuzzyStudioTitle.IsNullOrWhiteSpace() || fuzzyReleaseDate.IsNullOrWhiteSpace())
                    {
                        // We don't want to match unless studio was properly matched up, false positives
                        // Passion-HD trips this a lot
                        _logger.Trace("{0}: Skipping fuzzy match for movie {1} due to missing studio or release date", methodName, movie.ToString());
                        continue;
                    }

                    var fuzzyMatch = FuzzyMatchReleaseTokens(releaseTokens, movie);

                    if (fuzzyMatch.score >= fuzzyTitleMatchingThreshold)
                    {
                        fuzzyMatchMoviesWithScores.Add(fuzzyMatch);
                    }
                }
            }
            else
            {
                _logger.Trace("Fuzzy match disabled with a threshold of {1}", fuzzyTitleMatchingThreshold);
            }

            if (fuzzyMatchMoviesWithScores.Any())
            {
                // There can be only one
                var highest = fuzzyMatchMoviesWithScores.OrderByDescending(m => m.score).First();
                _logger.Trace("{0}: Returning fuzzy matched movie [{1} - {2}]", methodName, highest.movie.Title, highest.movie.ForeignId);
                return highest.movie;
            }

            if (hasReleaseDate)
            {
                _logger.Debug("{0}: DB query for for movies for Studio ForeignID: [{1}] and Date: [{2}].", methodName, studioForeignId, releaseDate);
                movies = _movieRepository.FindByStudioAndDate(studioForeignId, releaseDate);

                if (movies == null || !movies.Any())
                {
                    movies = new List<Movie>();
                }

                // movies with release date if missing day
                if (releaseDate.EndsWith("-01"))
                {
                    var monthMovies = _movieRepository.FindByStudioAndDate(studioForeignId, releaseDate.Substring(0, releaseDate.Length - 3));
                    if (monthMovies != null && monthMovies.Any())
                    {
                        movies.AddRange(monthMovies);
                    }
                }

                // movies with release date if missing day
                if (releaseDate.EndsWith("-01-01"))
                {
                    var yearMovies = _movieRepository.FindByStudioAndDate(studioForeignId, releaseDate.Substring(0, releaseDate.Length - 6));
                    if (yearMovies != null && yearMovies.Any())
                    {
                        movies.AddRange(yearMovies);
                    }
                }

                // Requires a higher level of matching if we had to fallback to studio only
                if (movies == null || !movies.Any())
                {
                    movies = _movieRepository.GetByStudioForeignId(studioForeignId);
                    verifyDate = true;
                }

                // WhisparrAutoMatchOnDate enabled and only one match, return it
                // Only applies when the date query itself found the match (verifyDate=false means we didn't fall back to studio-only)
                if (_configService.WhisparrAutoMatchOnDate && movies.Count == 1 && !verifyDate)
                {
                    _logger.Debug("{0}: WhisparrAutoMatchOnDate enabled, returning single movie match by studio and date.", methodName);
                    return movies.First();
                }
            }
            else
            {
                // Requires a higher level of matching if we had to fallback to studio only
                movies = _movieRepository.GetByStudioForeignId(studioForeignId);
                verifyEpisode = true;
            }

            if (movies == null || !movies.Any())
            {
                return null;
            }

            // Movies with more than one movieFile is in the list, so filter to only one
            movies = movies.DistinctBy(movie => movie.Id).ToList();
            var parsedMovieTitle = Parser.Parser.NormalizeEpisodeTitle(releaseTokens);

            if (parsedMovieTitle.IsNotNullOrWhiteSpace() || foreignId.IsNotNullOrWhiteSpace())
            {
                var matches = MatchMovies(parsedMovieTitle, releaseDate, foreignId, episode, movies, verifyDate, verifyEpisode);

                _logger.Debug("{0}: Found {1} matches for Studio ForeignID: {2}, Date: {3}, Parsed Title: {4}, ForeignID: {5}",
                            methodName,
                            matches.Count,
                            studioForeignId,
                            releaseDate,
                            parsedMovieTitle,
                            foreignId);

                if (matches.Count == 1)
                {
                    return matches.First().Key;
                }

                movies = matches.Keys.ToList();
            }

            _logger.Debug("{0}: Failed to find a match.  Studio ForeignID: {1}, Date: {2}",
                methodName,
                studioForeignId,
                releaseDate);

            return null;
        }

        /// <summary> Match parsed movie information against a list of movies. </summary>
        /// <param name="parsedMovieTitle">The parsed title of the movie.</param>
        /// <param name="releaseDate">The release date of the movie.</param>
        /// <param name="foreignId">The foreign ID of the movie.</param>
        /// <param name="episode">The episode information, if applicable.</param>
        /// <param name="movies">A list of movies to match against.</param>
        /// <param name="verifyDate">Indicates whether to verify the release date during matching.</param>
        /// <param name="verifyEpisode">Indicates whether to verify the episode information during matching.</param>
        /// <returns>A dictionary of matched movies and their corresponding match types.</returns>
        public Dictionary<Movie, MovieParseMatchType> MatchMovies(string parsedMovieTitle, string releaseDate, string foreignId, string episode, List<Movie> movies, bool verifyDate, bool verifyEpisode)
        {
            var matches = new Dictionary<Movie, MovieParseMatchType>();

            _logger.Debug("Checking {0} against {1} movies", parsedMovieTitle, movies.Count);

            foreach (var movie in movies)
            {
                var cleanTitle = movie.Title.IsNotNullOrWhiteSpace() ? Parser.Parser.NormalizeEpisodeTitle(movie.Title) : string.Empty;

                // If parsed title matches title, consider a match
                if (foreignId == movie.ForeignId)
                {
                    _logger.Debug("Match {0} against {1} [StashId]", parsedMovieTitle, movie.ForeignId);
                    matches.Add(movie, MovieParseMatchType.StashId);
                    continue;
                }

                // If parsed title matches title, consider a match
                if (cleanTitle.IsNotNullOrWhiteSpace() && parsedMovieTitle.Equals(cleanTitle))
                {
                    _logger.Debug("Match {0} against {1} [Title]", parsedMovieTitle, cleanTitle);
                    matches.Add(movie, MovieParseMatchType.Title);
                    continue;
                }

                if (cleanTitle.IsNotNullOrWhiteSpace() && Parser.Parser.StripSpaces(parsedMovieTitle).Equals(Parser.Parser.StripSpaces(cleanTitle)))
                {
                    _logger.Debug("Match {0} against {1} [Title]", parsedMovieTitle, cleanTitle);
                    matches.Add(movie, MovieParseMatchType.Title);
                    continue;
                }

                var code = movie.MovieMetadata.Value.Code;
                if (code.IsNotNullOrWhiteSpace())
                {
                    if (episode.IsNotNullOrWhiteSpace())
                    {
                        if (episode.Equals(code, StringComparison.InvariantCultureIgnoreCase))
                        {
                            _logger.Debug("Match {0} against {1} [Code]", episode, code);
                            matches.Add(movie, MovieParseMatchType.Episode);
                            continue;
                        }
                        else if (int.TryParse(code, out var codeNumber) && int.TryParse(Regex.Match(episode, @"\d+", RegexOptions.None, RegexDefaults.Timeout).Value, out var episodeNumber))
                        {
                            if (codeNumber == episodeNumber)
                            {
                                _logger.Debug("Match {0} against {1} [Code]", episode, code);
                                matches.Add(movie, MovieParseMatchType.Episode);
                                continue;
                            }
                        }
                    }
                    else
                    {
                        if (parsedMovieTitle.Contains(code, StringComparison.InvariantCultureIgnoreCase)
                            && parsedMovieTitle.Contains(cleanTitle, StringComparison.InvariantCultureIgnoreCase))
                        {
                            _logger.Debug("Match {0} against {1} [Code]", parsedMovieTitle, code);
                            matches.Add(movie, MovieParseMatchType.Episode);
                            continue;
                        }
                    }
                }

                if (!movie.MovieMetadata.Value.Credits.Any())
                {
                    // Load the Credits if not already loaded
                    movie.MovieMetadata.Value.Credits = _creditService.GetAllCreditsForMovieMetadata(movie.MovieMetadata.Value.Id);
                }

                var cleanPerformers = movie.MovieMetadata.Value.Credits
                    .Select(a => Parser.Parser.NormalizeEpisodeTitle(a.Performer.Name ?? a.PersonName))
                    .Where(n => n.IsNotNullOrWhiteSpace());

                if (cleanPerformers == null || cleanPerformers.Empty())
                {
                    continue;
                }

                // If parsed title matches performer, consider a match
                if (cleanPerformers.Any(p => p.IsNotNullOrWhiteSpace() && parsedMovieTitle.Equals(p)))
                {
                    _logger.Debug("Match {0} against {1} [Performers]", parsedMovieTitle, cleanPerformers.Join(", "));
                    matches.Add(movie, MovieParseMatchType.PerformersTitle);
                    continue;
                }

                var cleanCharacters = movie.MovieMetadata.Value.Credits
                    .Select(a => Parser.Parser.NormalizeEpisodeTitle(a.Character))
                    .Where(x => x.IsNotNullOrWhiteSpace());

                // If parsed title matches character, consider a match
                if (cleanCharacters.Any() && cleanCharacters.Any(c => c.IsNotNullOrWhiteSpace() && parsedMovieTitle.Equals(c)))
                {
                    _logger.Debug("Match {0} against {1} [Characters]", parsedMovieTitle, cleanCharacters.Join(", "));
                    matches.Add(movie, MovieParseMatchType.CharactersTitle);
                    continue;
                }

                var cleanFemalePerformers = movie.MovieMetadata.Value.Credits.Where(a => a.Performer.Gender == Gender.Female)
                                                                             .Select(a => Parser.Parser.NormalizeEpisodeTitle(a.Performer.Name))
                                                                             .Where(x => x.IsNotNullOrWhiteSpace()).ToList();

                // If all female performers are in title, consider a match
                if (cleanFemalePerformers.Any() && cleanFemalePerformers.All(x => parsedMovieTitle.Contains(x)))
                {
                    _logger.Debug("Match {0} against {1} [Female Performers]", parsedMovieTitle, cleanFemalePerformers.Join(", "));
                    matches.Add(movie, MovieParseMatchType.Performers);
                    continue;
                }

                var cleanFemaleCharacters = movie.MovieMetadata.Value.Credits.Where(a => a.Performer.Gender == Gender.Female)
                                                                             .Select(a => Parser.Parser.NormalizeEpisodeTitle(a.Character))
                                                                             .Where(x => x.IsNotNullOrWhiteSpace()).ToList();

                // If all female characters are in title, consider a match
                if (cleanFemaleCharacters.Any() && cleanFemalePerformers.All(x => parsedMovieTitle.Contains(x)))
                {
                    _logger.Debug("Match {0} against {1} [Female Characters]", parsedMovieTitle, cleanFemaleCharacters.Join(", "));
                    matches.Add(movie, MovieParseMatchType.Characters);
                    continue;
                }

                if (cleanTitle.IsNullOrWhiteSpace())
                {
                    continue;
                }

                // If parsed title contains a performer and the title then consider a match
                if (cleanPerformers.Any(x => parsedMovieTitle.Contains(x)) && parsedMovieTitle.Contains(cleanTitle))
                {
                    _logger.Debug("Match {0} against {1} {2} [Title & Performer]", parsedMovieTitle, cleanTitle, cleanPerformers.Join(", "));
                    matches.Add(movie, MovieParseMatchType.PerformerTitle);
                    continue;
                }

                // If parsed title contains a character and the title then consider a match
                if (cleanCharacters.Any() && cleanCharacters.Any(x => parsedMovieTitle.Contains(x)) && parsedMovieTitle.Contains(cleanTitle))
                {
                    _logger.Debug("Match {0} against {1} {2} [Title & Character]", parsedMovieTitle, cleanTitle, cleanCharacters.Join(", "));
                    matches.Add(movie, MovieParseMatchType.CharacterTitle);
                    continue;
                }

                // If parsed title contains all performer and the not title then consider a match
                if (cleanPerformers.All(x => parsedMovieTitle.Contains(x)) && !parsedMovieTitle.Contains(cleanTitle))
                {
                    _logger.Debug("Match {0} against {1} {2} [Performers & NOT Title]", parsedMovieTitle, cleanTitle, cleanPerformers.Join(", "));
                    matches.Add(movie, MovieParseMatchType.PerformersNotTitle);
                    continue;
                }

                // If parsed title contains all character and the not title then consider a match
                if (cleanCharacters.Any() && cleanCharacters.All(x => parsedMovieTitle.Contains(x)) && !parsedMovieTitle.Contains(cleanTitle))
                {
                    _logger.Debug("Match {0} against {1} {2} [Characters & NOT Title]", parsedMovieTitle, cleanTitle, cleanCharacters.Join(", "));
                    matches.Add(movie, MovieParseMatchType.CharactersNotTitle);
                    continue;
                }

                // Fallback: if the parsed title contains the movie's clean title, consider it a match.
                // This helps when performer aliases/order differ but the release is for the same movie.
                if (cleanTitle.IsNotNullOrWhiteSpace() && parsedMovieTitle.Contains(cleanTitle, StringComparison.InvariantCultureIgnoreCase))
                {
                    _logger.Debug("Matched [{0}] against [{1}] [ParsedTitleContainsCleanTitle]", parsedMovieTitle, cleanTitle);
                    matches.Add(movie, MovieParseMatchType.ParsedTitleContainsCleanTitle);
                    continue;
                }
            }

            // Find the best match
            if (matches.Count > 1)
            {
                var movieParseMatchTypes = (MovieParseMatchType[])Enum.GetValues(typeof(MovieParseMatchType));

                foreach (var movieMatchType in movieParseMatchTypes)
                {
                    var filteredMatches = matches.Where(m => (int)m.Value < (int)movieMatchType).ToDictionary(x => x.Key, x => x.Value);
                    if (releaseDate.IsNotNullOrWhiteSpace() && (int)movieMatchType < 2)
                    {
                        filteredMatches = new Dictionary<Movie, MovieParseMatchType>();
                    }

                    if (filteredMatches.Count == 1)
                    {
                        matches = filteredMatches;
                        break;
                    }
                }
            }

            if (matches.Count == 1 && (verifyDate || verifyEpisode))
            {
                var match = matches.First();

                if (verifyDate)
                {
                    if (match.Key.GetReleaseDate().HasValue && releaseDate.IsNotNullOrWhiteSpace())
                    {
                        var movieReleaseDate = match.Key.GetReleaseDate().Value.ToString(Movie.RELEASE_DATE_FORMAT);
                        if (!movieReleaseDate.Equals(releaseDate))
                        {
                            _logger.Debug("Removing match for {0} due to release date mismatch. Parsed: {1}, Movie Release Date: {2}",
                                match.Key,
                                releaseDate,
                                movieReleaseDate);
                            matches.Remove(match.Key);
                        }
                    }
                    else
                    {
                        // add a non-match if we can't verify the date
                        matches = new Dictionary<Movie, MovieParseMatchType>();
                    }
                }

                if (verifyEpisode)
                {
                    if (match.Key?.MovieMetadata?.Value?.Code != null && episode.IsNotNullOrWhiteSpace())
                    {
                        var code = match.Key.MovieMetadata.Value.Code;
                        if (!episode.Equals(code, StringComparison.InvariantCultureIgnoreCase))
                        {
                            if (int.TryParse(code, out var codeNumber) && int.TryParse(Regex.Match(episode, @"\d+", RegexOptions.None, RegexDefaults.Timeout).Value, out var episodeNumber))
                            {
                                if (codeNumber != episodeNumber)
                                {
                                    matches = new Dictionary<Movie, MovieParseMatchType>();
                                }
                            }
                            else
                            {
                                // add a non-match if we can't verify the date
                                matches = new Dictionary<Movie, MovieParseMatchType>();
                            }
                        }
                    }
                    else
                    {
                        // add a non-match if we can't verify the date
                        matches = new Dictionary<Movie, MovieParseMatchType>();
                    }
                }
            }

            return matches;
        }

        /// <summary> Return a single movie from a list or throw an exception if multiple movies are found. </summary>
        /// <param name="movies">The list of movies to evaluate.</param>
        /// <returns>The single movie if found; otherwise, null.</returns>
        private Movie ReturnSingleMovieOrThrow(List<Movie> movies)
        {
            if (movies.Count == 0)
            {
                return null;
            }

            if (movies.Count == 1)
            {
                return movies.First();
            }

            throw new MultipleMoviesFoundException(movies, "Expected one movie, but found {0}. Matching movies: {1}", movies.Count, string.Join(",", movies));
        }

        /// <summary> Sets the file IDs for the given movies. </summary>
        /// <param name="movies">The enumerable collection of movies to evaluate.</param>
        /// <remarks> The movies you pass in should have the Id's set already. </remarks>
        /// <returns>void</returns>
        public void SetFileIds(List<Movie> movies)
        {
            _movieRepository.SetFileId(movies);
        }

        /// <summary> Handle the event when a movie file is added. </summary>
        /// <param name="message">The event message containing details about the added movie file.</param>
        /// <returns>void</returns>
        public void Handle(MovieFileAddedEvent message)
        {
            if (message.MovieFile.Movie != null)
            {
                var movie = message.MovieFile.Movie;
                movie.MovieFileId = message.MovieFile.Id;
                _movieRepository.Update(movie);

                // _movieRepository.SetFileId(message.MovieFile.Id, message.MovieFile.Movie.Value.Id);
                _logger.Info("Assigning file [{0}] to movie [{1}]", message.MovieFile.RelativePath, message.MovieFile.Movie);
            }
        }

        /// <summary> Handle the event when a movie file is deleted. </summary>
        /// <param name="message">The event message containing details about the deleted movie file.</param>
        /// <returns>void</returns>
        public void Handle(MovieFileDeletedEvent message)
        {
            foreach (var movie in GetMoviesByFileId(message.MovieFile.Id))
            {
                _logger.Debug("Detaching movie {0} from file.", movie.Id);
                movie.MovieFileId = 0;

                if (message.Reason != DeleteMediaFileReason.Upgrade && _configService.AutoUnmonitorPreviouslyDownloadedMovies)
                {
                    movie.Monitored = false;
                }

                UpdateMovie(movie);
            }
        }

        /// <summary> Remove the movie resources cache for a specific cache key. </summary>
        /// <param name="cacheKey">The cache key to remove.</param>
        /// <returns>void</returns>
        private void RemoveMovieResourcesCache(string cacheKey)
        {
            var movieResourcesCache = _cacheManager.FindCache(_cacheName);
            if (movieResourcesCache != null)
            {
                movieResourcesCache.Remove(cacheKey);
            }
        }

        /// <summary>Returns the Levenshtein Distance score (0-100) between releaseTokens striung and Movie, using FuzzySharp's WeightedRatio.</summary>
        /// <param name="releaseTokens">The title string to compare.  Will be normalized.</param>
        /// <param name="movie">Movie object to compare against</param>
        /// <returns>(Movie movie, int score) local variable</returns>
        public (Movie movie, int score) FuzzyMatchReleaseTokens(string releaseTokens, Movie movie)
        {
            var methodName = "FuzzyMatchReleaseTokens";
            var normalizedTitle = releaseTokens.CleanMovieTitle().StripSpaces();
            var credits = _creditService.GetAllCreditsForMovieMetadata(movie.MovieMetadata.Value.Id);
            if (string.IsNullOrWhiteSpace(normalizedTitle) || string.IsNullOrWhiteSpace(movie.CleanTitle))
            {
                return (null, 0);
            }

            // Remove performer and character names from the normalized title to improve matching accuracy
            foreach (var credit in credits)
            {
                if (!string.IsNullOrWhiteSpace(credit.PersonName))
                {
                    var cleanName = credit.PersonName.CleanMovieTitle().StripSpaces();
                    normalizedTitle = normalizedTitle.Replace(cleanName, string.Empty, StringComparison.InvariantCultureIgnoreCase);
                }

                if (!string.IsNullOrWhiteSpace(credit.Character))
                {
                    var cleanCharacter = credit.Character.CleanMovieTitle().StripSpaces();
                    normalizedTitle = normalizedTitle.Replace(cleanCharacter, string.Empty, StringComparison.InvariantCultureIgnoreCase);
                }
            }

            var score = FuzzySharp.Fuzz.Ratio(normalizedTitle, movie.CleanTitle);
            _logger.Debug("{0}: Matching [{1}] to movie [{2}]: {3}%", methodName, normalizedTitle, movie.ToString(), score);

            return (movie, score);
        }
    }
}
