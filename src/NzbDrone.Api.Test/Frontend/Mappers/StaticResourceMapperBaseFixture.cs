using System.IO;
using FluentAssertions;
using NLog;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Test.Common;
using Whisparr.Http.Frontend.Mappers;

namespace NzbDrone.Api.Test.Frontend.Mappers
{
    [TestFixture]
    public class StaticResourceMapperBaseFixture : TestBase
    {
        private string _folder;
        private TestMapper _subject;

        [SetUp]
        public void Setup()
        {
            _folder = Path.Combine(Path.GetTempPath(), "whisparr_mapper_" + Path.GetRandomFileName());
            Directory.CreateDirectory(_folder);

            _subject = new TestMapper(_folder, Mocker.GetMock<IDiskProvider>().Object, LogManager.GetCurrentClassLogger());
        }

        [TearDown]
        public void TearDown()
        {
            if (Directory.Exists(_folder))
            {
                Directory.Delete(_folder, true);
            }
        }

        [Test]
        public void should_map_a_path_inside_the_folder()
        {
            _subject.Map("/resource/poster.jpg")
                    .Should().Be(Path.Combine(_folder, "poster.jpg"));
        }

        [Test]
        public void should_map_a_path_in_a_nested_folder()
        {
            _subject.Map("/resource/performer/1/headshot.jpg")
                    .Should().Be(Path.Combine(_folder, "performer", "1", "headshot.jpg"));
        }

        [TestCase("/resource/../escaped.txt")]
        [TestCase("/resource/../../escaped.txt")]
        [TestCase("/resource/nested/../../escaped.txt")]
        public void should_return_null_when_the_path_escapes_the_folder(string resourceUrl)
        {
            _subject.Map(resourceUrl).Should().BeNull();
        }

        [Test]
        public void should_return_null_for_a_sibling_folder_sharing_the_name_prefix()
        {
            // _folder + "-other" starts with the folder name but is not inside it.
            _subject.Map("/resource/../" + Path.GetFileName(_folder) + "-other/escaped.txt")
                    .Should().BeNull();
        }

        [Test]
        public void should_return_null_when_the_folder_itself_is_requested()
        {
            _subject.Map("/resource/").Should().BeNull();
        }

        private sealed class TestMapper : StaticResourceMapperBase
        {
            private readonly string _folderPath;

            public TestMapper(string folderPath, IDiskProvider diskProvider, Logger logger)
                : base(diskProvider, logger)
            {
                _folderPath = folderPath;
            }

            protected override string FolderPath => _folderPath;

            protected override string MapPath(string resourceUrl)
            {
                var path = resourceUrl.Replace("/resource/", "").Replace('/', Path.DirectorySeparatorChar);

                return Path.Combine(_folderPath, path);
            }

            public override bool CanHandle(string resourceUrl)
            {
                return resourceUrl.StartsWith("/resource/");
            }
        }
    }
}
