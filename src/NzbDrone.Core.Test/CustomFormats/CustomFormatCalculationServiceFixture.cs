using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.History;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.CustomFormats
{
    [TestFixture]
    public class CustomFormatCalculationServiceFixture : CoreTest<CustomFormatCalculationService>
    {
        private const string SceneName = "Vixen.23.12.18.Performer.Title.XXX.1080p.x264-GRP";

        private Movie _movie;

        [SetUp]
        public void Setup()
        {
            _movie = Builder<Movie>.CreateNew()
                                   .With(m => m.MovieMetadata.Value.Title = "Performer Title")
                                   .Build();

            Mocker.GetMock<ICustomFormatService>()
                  .Setup(s => s.All())
                  .Returns(new List<CustomFormat>
                  {
                      new CustomFormat("x264", new ReleaseTitleSpecification { Value = "x264" }) { Id = 1 }
                  });
        }

        private MovieHistory GivenHistory(string sourceTitle)
        {
            return new MovieHistory
            {
                EventType = MovieHistoryEventType.DiskScanImported,
                SourceTitle = sourceTitle,
                Quality = new QualityModel(Quality.WEBDL1080p),
                Languages = new List<Language> { Language.English },
                MovieId = _movie.Id
            };
        }

        private MovieFile GivenMovieFile(string sceneName, string relativePath)
        {
            return new MovieFile
            {
                MovieId = _movie.Id,
                SceneName = sceneName,
                RelativePath = relativePath,
                Quality = new QualityModel(Quality.WEBDL1080p),
                Languages = new List<Language> { Language.English }
            };
        }

        [Test]
        public void should_match_history_with_a_release_name_source_title()
        {
            Subject.ParseCustomFormat(GivenHistory(SceneName), _movie)
                   .Should().ContainSingle(f => f.Name == "x264");
        }

        // Disk scan and file events record a path rather than a release name. Parsing one masks the
        // scene title out of the simple release title, which can take the codec token with it, so
        // the specifications have to be able to fall back to the file name.
        [TestCase("/data/scenes/Vixen/Vixen.23.12.18.Performer.Title.XXX.1080p.x264-GRP.mkv")]
        [TestCase("/mnt/user/data/Brazzers/Brazzers.19.11.02.Some.One.Scene.Name.XXX.SD.x264-KLEENEX.mp4")]
        public void should_match_history_with_a_file_path_source_title(string sourceTitle)
        {
            Subject.ParseCustomFormat(GivenHistory(sourceTitle), _movie)
                   .Should().ContainSingle(f => f.Name == "x264");
        }

        // The reported symptom: the files table on the movie detail page showed the format while the
        // history row for the very same file did not.
        [Test]
        public void should_match_the_same_formats_for_history_and_movie_file()
        {
            var movieFile = GivenMovieFile(SceneName, $"{SceneName}.mkv");
            var history = GivenHistory(movieFile.GetSceneOrFileName());

            Subject.ParseCustomFormat(history, _movie)
                   .Should().BeEquivalentTo(Subject.ParseCustomFormat(movieFile, _movie));
        }

        [Test]
        public void should_not_match_when_neither_the_release_name_nor_the_file_name_has_the_token()
        {
            var history = GivenHistory("Vixen - 2023-12-18 - Performer Title [WEBDL-1080p].mkv");

            Subject.ParseCustomFormat(history, _movie).Should().BeEmpty();
        }
    }
}
