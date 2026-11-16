using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.OrganizerTests.FileNameBuilderTests
{
    [TestFixture]

    public class TruncatedSceneTitleFixture : CoreTest<FileNameBuilder>
    {
        private Movie _scene;
        private MovieFile _movieFile;
        private NamingConfig _namingConfig;

        [SetUp]
        public void Setup()
        {
            _scene = Builder<Movie>
                    .CreateNew()
                    .With(s => s.Title = "The Fantastic Life of Mr. Sisko")
                    .With(s => s.MovieMetadata.Value.ItemType = ItemType.Scene)
                    .Build();

            _movieFile = new MovieFile { Quality = new QualityModel(Quality.HDTV720p), ReleaseGroup = "WhisparrTest" };

            _namingConfig = NamingConfig.Default;
            _namingConfig.RenameScenes = true;

            Mocker.GetMock<INamingConfigService>()
                  .Setup(c => c.GetConfig()).Returns(_namingConfig);

            Mocker.GetMock<IQualityDefinitionService>()
                .Setup(v => v.Get(Moq.It.IsAny<Quality>()))
                .Returns<Quality>(v => Quality.DefaultQualityDefinitions.First(c => c.Quality == v));

            Mocker.GetMock<ICustomFormatService>()
                  .Setup(v => v.All())
                  .Returns(new List<CustomFormat>());
        }

        [TestCase("{Scene Title:16}", "The Fantastic...")]
        [TestCase("{Scene TitleThe:17}", "Fantastic Life...")]
        [TestCase("{Scene CleanTitle:-13}", "...Mr. Sisko")]
        [TestCase("{Scene CleanTitle:100}", "The Fantastic Life of Mr. Sisko")]
        [TestCase("{Scene CleanTitle}", "The Fantastic Life of Mr. Sisko")]
        public void should_truncate_scene_title(string format, string expected)
        {
            _namingConfig.SceneFolderFormat = format;

            var result = Subject.GetMovieFolder(_scene, _namingConfig);
            result.Should().Be(expected);
        }

        [Test]
        public void should_trim_scene_title_from_the_end_when_file_name_is_too_long()
        {
            _namingConfig.StandardSceneFormat = "{Scene Title}";
            _namingConfig.MaxFilePathLength = 18;

            Subject.BuildFileName(_scene, _movieFile).Should().Be("The Fantastic Life");
        }

        [Test]
        public void should_not_carry_title_trim_into_later_names()
        {
            // Too long to fit even with the whole title removed, so the trim reaches the limit
            _namingConfig.StandardSceneFormat = "{Scene Title} - this fixed text is longer than the limit";
            _namingConfig.MaxFilePathLength = 40;

            Subject.BuildFileName(_scene, _movieFile);

            _namingConfig.StandardSceneFormat = "{Scene Title}";
            _namingConfig.MaxFilePathLength = NamingConfig.Default.MaxFilePathLength;
            _namingConfig.SceneFolderFormat = "{Scene CleanTitle}";

            Subject.BuildFileName(_scene, _movieFile).Should().Be("The Fantastic Life of Mr. Sisko");
            Subject.GetMovieFolder(_scene, _namingConfig).Should().Be("The Fantastic Life of Mr. Sisko");
        }
    }
}
