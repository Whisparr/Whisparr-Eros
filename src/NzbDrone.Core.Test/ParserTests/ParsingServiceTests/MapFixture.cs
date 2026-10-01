using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.ParserTests.ParsingServiceTests
{
    [TestFixture]
    public class MapFixture : TestBase<ParsingService>
    {
        private Movie _movie;
        private ParsedMovieInfo _parsedMovieInfo;
        private ParsedMovieInfo _wrongYearInfo;
        private ParsedMovieInfo _wrongTitleInfo;
        private ParsedMovieInfo _romanTitleInfo;
        private ParsedMovieInfo _umlautInfo;
        private ParsedMovieInfo _multiLanguageInfo;
        private ParsedMovieInfo _multiLanguageWithOriginalInfo;
        private MovieSearchCriteria _movieSearchCriteria;

        [SetUp]
        public void Setup()
        {
            _movie = Builder<Movie>.CreateNew()
                                   .With(m => m.Title = "Fack Ju Göthe 2")
                                   .With(m => m.MovieMetadata.Value.CleanTitle = "fackjugoethe2")
                                   .With(m => m.Year = 2015)
                                   .With(m => m.MovieMetadata.Value.OriginalLanguage = Language.English)
                                   .Build();

            _parsedMovieInfo = new ParsedMovieInfo
            {
                MovieTitles = new List<string> { _movie.Title },
                Languages = new List<Language> { Language.English },
                Year = _movie.Year,
            };

            _wrongYearInfo = new ParsedMovieInfo
            {
                MovieTitles = new List<string> { _movie.Title },
                Languages = new List<Language> { Language.English },
                Year = 1900,
            };

            _wrongTitleInfo = new ParsedMovieInfo
            {
                MovieTitles = new List<string> { "Other Title" },
                Languages = new List<Language> { Language.English },
                Year = 2015
            };

            _romanTitleInfo = new ParsedMovieInfo
            {
                MovieTitles = new List<string> { "Fack Ju Göthe II" },
                Languages = new List<Language> { Language.English },
                Year = _movie.Year,
            };

            _umlautInfo = new ParsedMovieInfo
            {
                MovieTitles = new List<string> { "Fack Ju Goethe 2" },
                Languages = new List<Language> { Language.English },
                Year = _movie.Year
            };

            _multiLanguageInfo = new ParsedMovieInfo
            {
                MovieTitles = { _movie.Title },
                Languages = new List<Language> { Language.Original, Language.French }
            };

            _multiLanguageWithOriginalInfo = new ParsedMovieInfo
            {
                MovieTitles = { _movie.Title },
                Languages = new List<Language> { Language.Original, Language.French, Language.English }
            };

            _movieSearchCriteria = new MovieSearchCriteria
            {
                Movie = _movie
            };
        }

        private void GivenMatchByMovieTitle()
        {
            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.FindByTitle(It.IsAny<string>()))
                  .Returns(_movie);
        }

        [Test]
        public void should_lookup_Movie_by_name()
        {
            GivenMatchByMovieTitle();

            Subject.Map(_parsedMovieInfo, "", 0, null);

            Mocker.GetMock<IMovieService>()
                .Verify(v => v.FindByTitle(It.IsAny<List<string>>(), It.IsAny<int>(), It.IsAny<List<string>>(), null), Times.Once());
        }

        [Test]
        public void should_use_search_criteria_movie_title()
        {
            GivenMatchByMovieTitle();

            Subject.Map(_parsedMovieInfo, "", 0, _movieSearchCriteria);

            Mocker.GetMock<IMovieService>()
                  .Verify(v => v.FindByTitle(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_match_roman_title()
        {
            Subject.Map(_romanTitleInfo, "", 0, _movieSearchCriteria).Movie.Should().Be(_movieSearchCriteria.Movie);
        }

        [Test]
        public void should_match_umlauts()
        {
            Subject.Map(_umlautInfo, "", 0, _movieSearchCriteria).Movie.Should().Be(_movieSearchCriteria.Movie);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_pass_interactive_search_to_scene_lookup(bool interactiveSearch)
        {
            var scene = Builder<Movie>.CreateNew()
                                      .With(m => m.Title = "Shower Sex")
                                      .With(m => m.MovieMetadata.Value.ItemType = ItemType.Scene)
                                      .Build();

            var searchCriteria = new MovieSearchCriteria
            {
                Movie = scene,
                InteractiveSearch = interactiveSearch
            };

            var parsedMovieInfo = Parser.Parser.ParseMovieTitle("Helix Studios - Shower Sex - Joey Mills & Landon Vega [720p].mp4");

            Subject.Map(parsedMovieInfo, "", 0, searchCriteria);

            Mocker.GetMock<IMovieService>()
                  .Verify(v => v.FindSceneMatch(parsedMovieInfo, interactiveSearch, searchCriteria), Times.Once());
        }

        [Test]
        public void should_fall_back_to_movie_lookup_for_dateless_release()
        {
            var movie = Builder<Movie>.CreateNew()
                                      .With(m => m.Title = "Mission Impossible - Ghost Protocol")
                                      .With(m => m.MovieMetadata.Value.CleanTitle = "Mission Impossible - Ghost Protocol".CleanMovieTitle())
                                      .With(m => m.MovieMetadata.Value.ItemType = ItemType.Movie)
                                      .Build();

            var searchCriteria = new MovieSearchCriteria
            {
                Movie = movie
            };

            var parsedMovieInfo = Parser.Parser.ParseMovieTitle("Mission Impossible - Ghost Protocol 1080p");

            parsedMovieInfo.IsDatelessScene.Should().BeTrue();

            Subject.Map(parsedMovieInfo, "", 0, searchCriteria).Movie.Should().Be(movie);
        }

        private static Movie GivenScene(int id, string foreignId)
        {
            var scene = new Movie
            {
                Id = id,
                Title = "Scene " + id,
                ForeignId = foreignId
            };

            scene.MovieMetadata.Value.ItemType = ItemType.Scene;

            return scene;
        }

        private ParsedMovieInfo GivenSceneMatch(SceneMatchResult match)
        {
            var parsedMovieInfo = Parser.Parser.ParseMovieTitle("Helix Studios - Hot Afternoon - Dakota Lovell [720p].mp4");

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.FindSceneMatch(parsedMovieInfo, It.IsAny<bool>(), It.IsAny<SearchCriteriaBase>()))
                  .Returns(match);

            return parsedMovieInfo;
        }

        [Test]
        public void should_keep_review_candidates_of_weak_dateless_match_from_rss()
        {
            var scene = GivenScene(5, "scene-5");
            var loadedScene = GivenScene(5, "scene-5");

            var parsedMovieInfo = GivenSceneMatch(new SceneMatchResult
            {
                ReviewCandidates = new List<SceneMatchCandidate> { new (scene, MovieParseMatchType.PerformersNotTitle) }
            });

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.FindByIds(It.Is<List<int>>(ids => ids.Contains(5))))
                  .Returns(new List<Movie> { loadedScene });

            var remoteMovie = Subject.Map(parsedMovieInfo, "", 0, null);

            remoteMovie.Movie.Should().BeNull();
            remoteMovie.ReviewCandidates.Should().ContainSingle();
            remoteMovie.ReviewCandidates[0].Movie.Should().BeSameAs(loadedScene);
            remoteMovie.ReviewCandidates[0].MatchType.Should().Be(MovieParseMatchType.PerformersNotTitle);
        }

        [Test]
        public void should_put_searched_scene_first_among_review_candidates()
        {
            var searched = GivenScene(6, "scene-6");

            var parsedMovieInfo = GivenSceneMatch(new SceneMatchResult
            {
                ReviewCandidates = new List<SceneMatchCandidate>
                {
                    new (GivenScene(5, "scene-5"), MovieParseMatchType.Title),
                    new (GivenScene(6, "scene-6"), MovieParseMatchType.Title)
                }
            });

            var remoteMovie = Subject.Map(parsedMovieInfo, "", 0, new MovieSearchCriteria { Movie = searched });

            remoteMovie.Movie.Should().BeNull();
            remoteMovie.ReviewCandidates.Should().HaveCount(2);
            remoteMovie.ReviewCandidates[0].Movie.Should().BeSameAs(searched);
            remoteMovie.ReviewCandidates[1].Movie.Id.Should().Be(5);
        }

        [Test]
        public void should_drop_review_candidates_that_are_not_the_searched_scene()
        {
            var parsedMovieInfo = GivenSceneMatch(new SceneMatchResult
            {
                ReviewCandidates = new List<SceneMatchCandidate> { new (GivenScene(5, "scene-5"), MovieParseMatchType.PerformersNotTitle) }
            });

            var remoteMovie = Subject.Map(parsedMovieInfo, "", 0, new MovieSearchCriteria { Movie = GivenScene(7, "scene-7") });

            remoteMovie.Movie.Should().BeNull();
            remoteMovie.ReviewCandidates.Should().BeEmpty();
        }

        [Test]
        public void should_load_profile_and_file_of_scene_matched_on_studio_catalogue_from_rss()
        {
            var scene = GivenScene(5, "scene-5");
            var loadedScene = GivenScene(5, "scene-5");
            loadedScene.QualityProfile = new NzbDrone.Core.Profiles.Qualities.QualityProfile();

            var parsedMovieInfo = GivenSceneMatch(SceneMatchResult.Matched(scene));

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovie(5))
                  .Returns(loadedScene);

            var remoteMovie = Subject.Map(parsedMovieInfo, "", 0, null);

            remoteMovie.Movie.Should().BeSameAs(loadedScene);
            remoteMovie.ReviewCandidates.Should().BeEmpty();
        }
    }
}
