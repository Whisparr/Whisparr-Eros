using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.LibrarySearch;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.LibrarySearchTests
{
    [TestFixture]
    public class LibrarySearchRankerFixture : CoreTest
    {
        private static LibrarySearchScore ScoreMovie(string query, string title, string foreignId = null)
        {
            return LibrarySearchRanker.Score(query, query.CleanMovieTitle(), title, title.CleanMovieTitle(), foreignId, t => t.CleanMovieTitle());
        }

        private static List<string> Rank(string query, params string[] titles)
        {
            return LibrarySearchRanker.Rank(titles, query, t => t, t => t.CleanMovieTitle(), _ => null, t => t.CleanMovieTitle());
        }

        [TestCase("Anna Bell", "Anna Bell")]
        [TestCase("anna bell", "Anna Bell")]
        [TestCase("Anna-Bell", "Anna Bell")]
        [TestCase("Chloé", "Chloe")]
        public void should_score_exact_clean_match_as_exact(string query, string title)
        {
            ScoreMovie(query, title).Should().Be(new LibrarySearchScore(LibrarySearchTier.Exact, 0));
        }

        [Test]
        public void should_score_foreign_id_match_as_exact()
        {
            ScoreMovie("abc-123", "Some Scene", "abc-123").Tier.Should().Be(LibrarySearchTier.Exact);
        }

        [TestCase("Anna", "Anna Goes To The Beach")]
        [TestCase("Anna Go", "Anna Goes To The Beach")]
        public void should_score_title_start_as_prefix(string query, string title)
        {
            ScoreMovie(query, title).Tier.Should().Be(LibrarySearchTier.Prefix);
        }

        [TestCase("Beach", "Anna Goes To The Beach")]
        [TestCase("Goes To", "Anna Goes To The Beach")]
        [TestCase("Bell", "Anna-Bell Rides")]
        public void should_score_word_start_as_word_start(string query, string title)
        {
            ScoreMovie(query, title).Tier.Should().Be(LibrarySearchTier.WordStart);
        }

        [TestCase("each", "Anna Goes To The Beach")]
        [TestCase("nna", "Anna Goes To The Beach")]
        [TestCase("each", "")]
        public void should_score_mid_word_as_substring(string query, string title)
        {
            ScoreMovie(query, title).Tier.Should().Be(LibrarySearchTier.Substring);
        }

        [Test]
        public void should_rank_by_tier_before_distance()
        {
            Rank("anna", "Hannah", "Anna Goes To The Beach", "Anna", "Meet Anna")
                .Should().Equal("Anna", "Anna Goes To The Beach", "Meet Anna", "Hannah");
        }

        [Test]
        public void should_rank_by_distance_within_a_tier()
        {
            Rank("anna", "Anna Goes To The Beach", "Anna Bell")
                .Should().Equal("Anna Bell", "Anna Goes To The Beach");
        }

        [Test]
        public void should_rank_by_title_when_tier_and_distance_tie()
        {
            Rank("anna", "Anna Zed", "Anna Abe")
                .Should().Equal("Anna Abe", "Anna Zed");
        }

        [Test]
        public void should_rank_studios_with_their_own_clean()
        {
            var studios = new[] { "Brazzers Exxtra", "Brazzers" };

            LibrarySearchRanker.Rank(studios, "Brazzers", s => s, s => s.CleanStudioTitle().ToLower(), _ => null, s => s.CleanStudioTitle().ToLower())
                .First().Should().Be("Brazzers");
        }
    }
}
