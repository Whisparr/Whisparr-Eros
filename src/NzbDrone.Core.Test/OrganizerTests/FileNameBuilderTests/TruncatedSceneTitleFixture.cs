using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.CustomFormats;
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
        private NamingConfig _namingConfig;

        [SetUp]
        public void Setup()
        {
            _scene = Builder<Movie>
                    .CreateNew()
                    .With(s => s.Title = "The Fantastic Life of Mr. Sisko")
                    .With(s => s.MovieMetadata.Value.ItemType = ItemType.Scene)
                    .Build();

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
    }
}
