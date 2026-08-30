using System.Collections.Generic;
using System.Collections.Specialized;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Processes;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.MediaInfo;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Tags;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MediaFiles
{
    [TestFixture]
    public class ImportScriptServiceFixture : CoreTest<ImportScriptService>
    {
        private LocalMovie _localMovie;
        private MovieFile _movieFile;
        private StringDictionary _environmentVariables;

        [SetUp]
        public void Setup()
        {
            var movie = Builder<Movie>.CreateNew()
                .With(m => m.Path = "/movies/Some Movie")
                .With(m => m.Tags = new HashSet<int> { 1, 2 })
                .Build();

            movie.MovieMetadata = Builder<MovieMetadata>.CreateNew()
                .With(m => m.Genres = new List<string>())
                .With(m => m.OriginalLanguage = Language.English)
                .Build();

            var mediaInfo = new MediaInfoModel
            {
                AudioLanguages = new List<string> { "eng" },
                AudioChannelPositions = "stereo",
                Subtitles = new List<string>()
            };

            _movieFile = Builder<MovieFile>.CreateNew()
                .With(f => f.RelativePath = "movie.mkv")
                .With(f => f.Quality = new QualityModel(Quality.HDTV720p))
                .With(f => f.MediaInfo = mediaInfo)
                .Build();

            _localMovie = new LocalMovie
            {
                Movie = movie,
                MediaInfo = mediaInfo,
                OldFiles = new List<DeletedMovieFile>(),
                CustomFormats = new List<CustomFormat>()
            };

            Mocker.GetMock<IConfigService>().SetupGet(c => c.UseScriptImport).Returns(true);
            Mocker.GetMock<IConfigService>().SetupGet(c => c.ScriptImportPath).Returns("/scripts/import.sh");

            Mocker.GetMock<IProcessProvider>()
                .Setup(p => p.StartAndCapture(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<StringDictionary>()))
                .Callback<string, string, StringDictionary>((_, _, env) => _environmentVariables = env)
                .Returns(new ProcessOutput { ExitCode = 0 });

            Mocker.GetMock<IDiskProvider>();
        }

        [Test]
        public void should_not_throw_when_a_tag_no_longer_exists()
        {
            // A movie can hold a tag id that has since been deleted. Fetching each id individually
            // threw ModelNotFoundException and took the whole import script down with it.
            Mocker.GetMock<ITagRepository>()
                .Setup(t => t.GetTags(It.IsAny<HashSet<int>>()))
                .Returns(new List<Tag> { new Tag { Id = 1, Label = "kept" } });

            Subject.TryImport("/downloads/movie.mkv", "/movies/Some Movie/movie.mkv", _localMovie, _movieFile, TransferMode.Move);

            _environmentVariables["Whisparr_Movie_Tags"].Should().Be("kept");
        }

        [Test]
        public void should_fetch_all_tags_in_a_single_query()
        {
            Mocker.GetMock<ITagRepository>()
                .Setup(t => t.GetTags(It.IsAny<HashSet<int>>()))
                .Returns(new List<Tag>
                {
                    new Tag { Id = 1, Label = "first" },
                    new Tag { Id = 2, Label = "second" }
                });

            Subject.TryImport("/downloads/movie.mkv", "/movies/Some Movie/movie.mkv", _localMovie, _movieFile, TransferMode.Move);

            _environmentVariables["Whisparr_Movie_Tags"].Should().Be("first|second");

            Mocker.GetMock<ITagRepository>()
                .Verify(t => t.GetTags(It.Is<HashSet<int>>(ids => ids.SetEquals(new[] { 1, 2 }))), Times.Once());

            Mocker.GetMock<ITagRepository>()
                .Verify(t => t.Get(It.IsAny<int>()), Times.Never());
        }
    }
}
