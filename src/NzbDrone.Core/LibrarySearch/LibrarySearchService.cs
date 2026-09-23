using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Parser;

namespace NzbDrone.Core.LibrarySearch
{
    public interface ILibrarySearchService
    {
        LibrarySearchResult Search(string term, int limit);
        LibrarySearchPage<Movie> SearchMovies(string term, ItemType itemType, int page, int pageSize);
        LibrarySearchPage<Performer> SearchPerformers(string term, int page, int pageSize);
        LibrarySearchPage<Studio> SearchStudios(string term, int page, int pageSize);
    }

    public class LibrarySearchPage<T>
    {
        public int TotalRecords { get; set; }
        public List<T> Records { get; set; } = new();
    }

    public class LibrarySearchResult
    {
        public LibrarySearchPage<Performer> Performers { get; set; } = new();
        public LibrarySearchPage<Studio> Studios { get; set; } = new();
        public LibrarySearchPage<Movie> Scenes { get; set; } = new();
        public LibrarySearchPage<Movie> Movies { get; set; } = new();
    }

    /// <summary>Searches the local library across performers, studios, scenes and movies.</summary>
    /// <remarks>Read-only: it never touches metadata providers or indexers.</remarks>
    public class LibrarySearchService : ILibrarySearchService
    {
        private readonly IMovieService _movieService;
        private readonly IPerformerService _performerService;
        private readonly IStudioService _studioService;

        public LibrarySearchService(IMovieService movieService,
                                    IPerformerService performerService,
                                    IStudioService studioService)
        {
            _movieService = movieService;
            _performerService = performerService;
            _studioService = studioService;
        }

        public LibrarySearchResult Search(string term, int limit)
        {
            var result = new LibrarySearchResult();

            if (term.IsNullOrWhiteSpace() || term.CleanMovieTitle().IsNullOrWhiteSpace())
            {
                return result;
            }

            var titles = RankMovieTitles(term);

            result.Performers = SearchPerformers(term, 1, limit);
            result.Studios = SearchStudios(term, 1, limit);
            result.Scenes = LoadPage(titles.Where(t => t.ItemType == ItemType.Scene), 1, limit);
            result.Movies = LoadPage(titles.Where(t => t.ItemType == ItemType.Movie), 1, limit);

            return result;
        }

        public LibrarySearchPage<Movie> SearchMovies(string term, ItemType itemType, int page, int pageSize)
        {
            if (term.IsNullOrWhiteSpace() || term.CleanMovieTitle().IsNullOrWhiteSpace())
            {
                return new LibrarySearchPage<Movie>();
            }

            return LoadPage(RankMovieTitles(term).Where(t => t.ItemType == itemType), page, pageSize);
        }

        public LibrarySearchPage<Performer> SearchPerformers(string term, int page, int pageSize)
        {
            if (term.IsNullOrWhiteSpace() || term.CleanMovieTitle().IsNullOrWhiteSpace())
            {
                return new LibrarySearchPage<Performer>();
            }

            var ranked = LibrarySearchRanker.Rank(
                _performerService.SearchPerformers(term),
                term,
                p => p.Name,
                p => p.CleanName,
                p => p.ForeignId,
                t => t.CleanMovieTitle());

            return Page(ranked, page, pageSize);
        }

        public LibrarySearchPage<Studio> SearchStudios(string term, int page, int pageSize)
        {
            if (term.IsNullOrWhiteSpace() || CleanStudio(term).IsNullOrWhiteSpace())
            {
                return new LibrarySearchPage<Studio>();
            }

            var ranked = LibrarySearchRanker.Rank(
                _studioService.SearchStudios(term),
                term,
                s => s.Title,
                s => s.CleanTitle,
                s => s.ForeignId,
                CleanStudio);

            return Page(ranked, page, pageSize);
        }

        // Stored studio titles are cleaned the same way in StudioService.SearchStudios.
        private static string CleanStudio(string title) => title.CleanStudioTitle().ToLower();

        private static LibrarySearchPage<T> Page<T>(List<T> ranked, int page, int pageSize)
        {
            page = Math.Max(page, 1);
            pageSize = Math.Max(pageSize, 1);

            return new LibrarySearchPage<T>
            {
                TotalRecords = ranked.Count,
                Records = ranked.Skip((page - 1) * pageSize).Take(pageSize).ToList()
            };
        }

        private List<MovieTitleMatch> RankMovieTitles(string term)
        {
            return LibrarySearchRanker.Rank(
                _movieService.SearchMovieTitles(term),
                term,
                m => m.Title,
                m => m.CleanTitle,
                m => m.ForeignId,
                t => t.CleanMovieTitle());
        }

        private LibrarySearchPage<Movie> LoadPage(IEnumerable<MovieTitleMatch> ranked, int page, int pageSize)
        {
            var ids = Page(ranked.ToList(), page, pageSize);

            if (ids.Records.Count == 0)
            {
                return new LibrarySearchPage<Movie> { TotalRecords = ids.TotalRecords };
            }

            var movies = _movieService.GetMovies(ids.Records.Select(m => m.Id)).ToDictionary(m => m.Id);

            return new LibrarySearchPage<Movie>
            {
                TotalRecords = ids.TotalRecords,
                Records = ids.Records.Where(m => movies.ContainsKey(m.Id)).Select(m => movies[m.Id]).ToList()
            };
        }
    }
}
