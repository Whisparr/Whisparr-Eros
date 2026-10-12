using System;
using System.IO;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MediaCoverTests
{
    [TestFixture]
    public class CoverAlreadyExistsSpecificationFixture : CoreTest<CoverAlreadyExistsSpecification>
    {
        private const string Url = "https://stashdb.org/images/2d1c5b0e-6f3a-4a52-9a8d-0c1b2a3d4e5f";
        private const string CoverPath = "/MediaCover/performer/1/headshot.jpg";
        private const string SourcePath = CoverPath + ".source";

        private void GivenCoverOnDisk()
        {
            Mocker.GetMock<IDiskProvider>().Setup(c => c.FileExists(CoverPath, It.IsAny<StringComparison>())).Returns(true);
        }

        private void GivenRecordedSource(string url)
        {
            Mocker.GetMock<IDiskProvider>().Setup(c => c.FileExists(SourcePath, It.IsAny<StringComparison>())).Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(c => c.ReadAllText(SourcePath)).Returns(url);
        }

        [Test]
        public void should_return_false_if_file_not_exists()
        {
            Subject.AlreadyExists(Url, CoverPath).Should().BeFalse();
        }

        [Test]
        public void should_return_true_if_downloaded_from_the_same_url()
        {
            GivenCoverOnDisk();
            GivenRecordedSource(Url + "\n");

            Subject.AlreadyExists(Url, CoverPath).Should().BeTrue();
        }

        [Test]
        public void should_return_false_if_the_url_has_changed()
        {
            GivenCoverOnDisk();
            GivenRecordedSource("https://stashdb.org/images/0f9e8d7c-6b5a-4c3d-8e2f-1a0b9c8d7e6f");

            Subject.AlreadyExists(Url, CoverPath).Should().BeFalse();
        }

        [Test]
        public void should_treat_a_cover_without_a_recorded_source_as_current_and_record_it()
        {
            GivenCoverOnDisk();

            Subject.AlreadyExists(Url, CoverPath).Should().BeTrue();

            Mocker.GetMock<IDiskProvider>().Verify(c => c.WriteAllText(SourcePath, Url), Times.Once());
        }

        [Test]
        public void should_keep_the_current_cover_if_the_source_cannot_be_read()
        {
            GivenCoverOnDisk();
            Mocker.GetMock<IDiskProvider>().Setup(c => c.FileExists(SourcePath, It.IsAny<StringComparison>())).Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(c => c.ReadAllText(SourcePath)).Throws(new IOException("locked"));

            Subject.AlreadyExists(Url, CoverPath).Should().BeTrue();

            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_record_the_source_beside_the_cover()
        {
            Subject.RecordSource(Url, CoverPath);

            Mocker.GetMock<IDiskProvider>().Verify(c => c.WriteAllText(SourcePath, Url), Times.Once());
        }

        [Test]
        public void should_not_throw_if_the_source_cannot_be_recorded()
        {
            Mocker.GetMock<IDiskProvider>().Setup(c => c.WriteAllText(SourcePath, It.IsAny<string>())).Throws(new IOException("read-only"));

            Assert.DoesNotThrow(() => Subject.RecordSource(Url, CoverPath));

            ExceptionVerification.ExpectedWarns(1);
        }
    }
}
