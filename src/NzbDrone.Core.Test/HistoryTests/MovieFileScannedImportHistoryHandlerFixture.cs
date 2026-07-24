using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.History;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.HistoryTests
{
    [TestFixture]
    public class MovieFileScannedImportHistoryHandlerFixture : CoreTest<MovieFileScannedImportHistoryHandler>
    {
        private Movie _movie;

        [SetUp]
        public void Setup()
        {
            _movie = Builder<Movie>.CreateNew()
                                   .With(m => m.Path = "/data/scenes/Vixen")
                                   .Build();
        }

        private MovieHistory HandleScan(MovieFile importedMovie)
        {
            MovieHistory inserted = null;

            Mocker.GetMock<IHistoryRepository>()
                  .Setup(r => r.Insert(It.IsAny<MovieHistory>()))
                  .Callback<MovieHistory>(h => inserted = h)
                  .Returns<MovieHistory>(h => h);

            var localMovie = new LocalMovie
            {
                Movie = _movie,
                Path = $"{_movie.Path}/{importedMovie.RelativePath}",
                Quality = new QualityModel(Quality.WEBDL1080p),
                Languages = new List<Language>()
            };

            Subject.Handle(new MovieFileImportedEvent(localMovie, importedMovie, new List<DeletedMovieFile>(), false, null));

            inserted.Should().NotBeNull();

            return inserted;
        }

        [Test]
        public void should_use_scene_name_as_source_title()
        {
            var importedMovie = new MovieFile
            {
                MovieId = _movie.Id,
                SceneName = "Vixen.23.12.18.Performer.Title.XXX.1080p.x264-GRP",
                RelativePath = "Vixen - 2023-12-18 - Performer Title [WEBDL-1080p].mkv",
                Path = "/data/scenes/Vixen/Vixen - 2023-12-18 - Performer Title [WEBDL-1080p].mkv"
            };

            HandleScan(importedMovie).SourceTitle.Should().Be(importedMovie.SceneName);
        }

        [Test]
        public void should_fall_back_to_file_name_when_there_is_no_scene_name()
        {
            var importedMovie = new MovieFile
            {
                MovieId = _movie.Id,
                RelativePath = "Vixen.23.12.18.Performer.Title.XXX.1080p.x264-GRP.mkv",
                Path = "/data/scenes/Vixen/Vixen.23.12.18.Performer.Title.XXX.1080p.x264-GRP.mkv"
            };

            HandleScan(importedMovie).SourceTitle.Should().Be("Vixen.23.12.18.Performer.Title.XXX.1080p.x264-GRP");
        }

        // The absolute path is what broke custom format matching on these rows; it stays available
        // through the event data instead.
        [Test]
        public void should_not_use_the_absolute_path_as_source_title()
        {
            var importedMovie = new MovieFile
            {
                MovieId = _movie.Id,
                RelativePath = "Vixen.23.12.18.Performer.Title.XXX.1080p.x264-GRP.mkv",
                Path = "/data/scenes/Vixen/Vixen.23.12.18.Performer.Title.XXX.1080p.x264-GRP.mkv"
            };

            var history = HandleScan(importedMovie);

            history.SourceTitle.Should().NotBe(importedMovie.Path);
            history.Data["ImportedPath"].Should().Be(importedMovie.Path);
        }
    }
}
