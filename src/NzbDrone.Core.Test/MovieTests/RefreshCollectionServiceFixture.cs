using System.Collections.Generic;

using FluentAssertions;

using Moq;

using NUnit.Framework;

using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Collections;
using NzbDrone.Core.Movies.Commands;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests
{
    [TestFixture]
    public class RefreshCollectionServiceFixture : CoreTest<RefreshCollectionService>
    {
        private MovieCollection GivenCollection(bool monitorNewItems)
        {
            var collection = new MovieCollection
            {
                Id = 1,
                TmdbId = 100,
                Title = "Collection With Movies",
                CleanTitle = "collectionwithmovies",
                Monitored = true,
                SearchOnAdd = true,
                MonitorNewItems = monitorNewItems,
                QualityProfileId = 1,
                RootFolderPath = "/movies"
            };

            var collectionInfo = new MovieCollection
            {
                TmdbId = collection.TmdbId,
                Title = collection.Title,
                CleanTitle = collection.CleanTitle,
                Movies = new List<MovieMetadata>
                {
                    new MovieMetadata
                    {
                        TmdbId = 123456,
                        Title = "New Movie",
                        Status = MovieStatusType.Released
                    }
                }
            };

            Mocker.GetMock<IMovieCollectionService>()
                .Setup(s => s.GetCollection(collection.Id))
                .Returns(collection);

            Mocker.GetMock<IProvideMovieInfo>()
                .Setup(s => s.GetCollectionInfo(collection.TmdbId))
                .Returns(collectionInfo);

            Mocker.GetMock<IMovieMetadataService>()
                .Setup(s => s.GetMoviesByCollectionTmdbId(collection.TmdbId))
                .Returns(() => new List<MovieMetadata>
                {
                    new MovieMetadata
                    {
                        TmdbId = 123456,
                        Title = "New Movie",
                        Status = MovieStatusType.Released
                    }
                });

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.AllMovieTmdbIds())
                .Returns(new List<int>());

            Mocker.GetMock<IImportListExclusionService>()
                .Setup(s => s.GetAllByType(ImportExclusionType.Movie))
                .Returns(new List<ImportListExclusion>());

            return collection;
        }

        private List<Movie> GivenAddedMoviesAreCaptured()
        {
            var addedMovies = new List<Movie>();

            Mocker.GetMock<IAddMovieService>()
                .Setup(s => s.AddMovies(It.IsAny<List<Movie>>(), It.IsAny<bool>()))
                .Callback((List<Movie> movies, bool ignoreErrors) => addedMovies.AddRange(movies))
                .Returns((List<Movie> movies, bool ignoreErrors) => movies);

            return addedMovies;
        }

        [TestCase(true)]
        [TestCase(false)]
        public void should_use_monitor_new_items_when_adding_movies(bool monitorNewItems)
        {
            var collection = GivenCollection(monitorNewItems);
            var addedMovies = GivenAddedMoviesAreCaptured();

            Subject.Execute(new RefreshCollectionsCommand(new List<int> { collection.Id }));

            addedMovies.Should().HaveCount(1);
            addedMovies.Should().OnlyContain(m => m.Monitored == monitorNewItems);
            addedMovies.Should().OnlyContain(m => m.AddOptions.SearchForMovie == monitorNewItems);
        }

        [Test]
        public void should_still_discover_and_add_movies_when_monitor_new_items_is_false()
        {
            var collection = GivenCollection(false);
            var addedMovies = GivenAddedMoviesAreCaptured();

            Subject.Execute(new RefreshCollectionsCommand(new List<int> { collection.Id }));

            Mocker.GetMock<IProvideMovieInfo>()
                .Verify(s => s.GetCollectionInfo(collection.TmdbId), Times.Once());

            addedMovies.Should().HaveCount(1);
            addedMovies.Should().OnlyContain(m => !m.Monitored);
        }

        [Test]
        public void should_default_monitor_new_items_to_true_for_new_collections()
        {
            new MovieCollection().MonitorNewItems.Should().BeTrue();
        }
    }
}
