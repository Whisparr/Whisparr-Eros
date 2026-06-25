using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.ParserTests.ParsingServiceTests
{
    [TestFixture]
    public class NoDateEpisodicMapFixture : TestBase<ParsingService>
    {
        private Movie _targetScene;
        private MovieSearchCriteria _searchCriteria;

        [SetUp]
        public void Setup()
        {
            _targetScene = Builder<Movie>.CreateNew()
                .With(m => m.Id = 99)
                .With(m => m.Title = "Lara in Trouble S01 E01")
                .With(m => m.MovieMetadata.Value.StudioTitle = "Wildeer Studio")
                .With(m => m.MovieMetadata.Value.StudioForeignId = "wildeer-studio-id")
                .With(m => m.MovieMetadata.Value.ItemType = ItemType.Scene)
                .Build();

            _searchCriteria = new MovieSearchCriteria
            {
                Movie = _targetScene,
                InteractiveSearch = true
            };

            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.NoDateEpisodicParsingMode)
                .Returns(NoDateEpisodicParsingMode.InteractiveOnly);

            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.NoDateEpisodicRangePackMode)
                .Returns(NoDateEpisodicRangePackMode.InteractiveOnly);

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.FindAllByTitle("Wildeer Studio"))
                .Returns(new List<Studio>
                {
                    new Studio { ForeignId = "wildeer-studio-id", Title = "Wildeer Studio" }
                });

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.IsNoDateEpisodicSceneMatch(It.IsAny<ParsedMovieInfo>(), _targetScene, true))
                .Returns(true);
        }

        [Test]
        public void should_map_no_date_episodic_release_to_search_target()
        {
            var parsed = Parser.Parser.ParseMovieTitle("[Wildeer Studio] Lara In Trouble S01 E01 - E06 [1080p]");

            var remoteMovie = Subject.Map(parsed, string.Empty, 0, _searchCriteria);

            remoteMovie.Movie.Should().Be(_targetScene);
            remoteMovie.MovieRequested.Should().BeTrue();
            remoteMovie.ParsedMovieInfo.IsNoDateEpisodic.Should().BeTrue();
        }
    }
}
