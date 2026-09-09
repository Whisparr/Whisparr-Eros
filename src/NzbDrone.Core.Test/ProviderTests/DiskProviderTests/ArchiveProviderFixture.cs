using System.IO;
using FluentAssertions;
using ICSharpCode.SharpZipLib.Zip;
using NUnit.Framework;
using NzbDrone.Common;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.ProviderTests.DiskProviderTests
{
    [TestFixture]
    public class ArchiveProviderFixture : TestBase<ArchiveService>
    {
        [Test]
        public void Should_extract_to_correct_folder()
        {
            var destinationFolder = new DirectoryInfo(GetTempFilePath());
            var testArchive = OsInfo.IsWindows ? "TestArchive.zip" : "TestArchive.tar.gz";

            Subject.Extract(GetTestPath("Files/" + testArchive), destinationFolder.FullName);

            destinationFolder.Exists.Should().BeTrue();
            destinationFolder.GetDirectories().Should().HaveCount(1);
            destinationFolder.GetDirectories("*", SearchOption.AllDirectories).Should().HaveCount(3);
            destinationFolder.GetFiles("*.*", SearchOption.AllDirectories).Should().HaveCount(6);
        }

        [Test]
        public void should_refuse_a_zip_entry_that_escapes_the_destination()
        {
            // Zip slip: an archive can name an entry ../../evil.txt and write anywhere the
            // process can reach. Nothing stopped that before.
            var destinationFolder = new DirectoryInfo(GetTempFilePath());
            var archivePath = Path.Combine(GetTempFilePath(), "traversal.zip");

            Directory.CreateDirectory(Path.GetDirectoryName(archivePath));

            using (var zipStream = new ZipOutputStream(File.Create(archivePath)))
            {
                zipStream.PutNextEntry(new ZipEntry("../../escaped.txt"));
                zipStream.Write(new byte[] { 1, 2, 3 }, 0, 3);
                zipStream.CloseEntry();
            }

            Assert.Throws<IOException>(() => Subject.Extract(archivePath, destinationFolder.FullName));

            var escaped = Path.GetFullPath(Path.Combine(destinationFolder.FullName, "../../escaped.txt"));
            File.Exists(escaped).Should().BeFalse();
        }
    }
}
