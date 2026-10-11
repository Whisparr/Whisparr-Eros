using System;
using System.IO;
using FluentAssertions;
using Moq;
using NetVips;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Test.Framework;
using VipsImage = NetVips.Image;

namespace NzbDrone.Core.Test.MediaCoverTests
{
    [TestFixture]
    public class ImageResizerFixture : CoreTest<ImageResizer>
    {
        [SetUp]
        public void SetUp()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns<string>(s => File.Exists(s));

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.DeleteFile(It.IsAny<string>()))
                  .Callback<string>(s => File.Delete(s));
        }

        [Test]
        public void should_resize_image()
        {
            var mainFile = Path.Combine(TempFolder, "logo.png");
            var resizedFile = Path.Combine(TempFolder, "logo-170.png");

            File.Copy(GetTestPath("Files/1024.png"), mainFile);

            Subject.Resize(mainFile, resizedFile, 170);

            var fileInfo = new FileInfo(resizedFile);
            fileInfo.Exists.Should().BeTrue();
            fileInfo.Length.Should().BeInRange(1000, 30000);

            using var image = VipsImage.NewFromFile(resizedFile);
            image.Height.Should().Be(170);
            image.Width.Should().Be(170);
        }

        [Test]
        public void should_resize_jpeg_to_height_and_keep_aspect_ratio()
        {
            var mainFile = Path.Combine(TempFolder, "poster.jpg");
            var resizedFile = Path.Combine(TempFolder, "poster-250.jpg");

            using (var source = VipsImage.Black(300, 600, bands: 3))
            {
                source.Jpegsave(mainFile);
            }

            Subject.Resize(mainFile, resizedFile, 250);

            using var image = VipsImage.NewFromFile(resizedFile);
            image.Height.Should().Be(250);
            image.Width.Should().Be(125);
            image.Get("vips-loader").Should().Be("jpegload");
            image.Get("jpeg-chroma-subsample").Should().Be("4:2:0");
        }

        [Test]
        public void should_delete_file_if_failed()
        {
            var mainFile = Path.Combine(TempFolder, "junk.png");
            var resizedFile = Path.Combine(TempFolder, "junk-170.png");

            File.WriteAllText(mainFile, "Just some junk data that should make it throw an Exception.");

            Assert.Throws(Is.InstanceOf<Exception>(), () => Subject.Resize(mainFile, resizedFile, 170));

            File.Exists(resizedFile).Should().BeFalse();
        }

        [Test]
        public void should_not_decode_formats_other_than_jpeg_png_or_webp()
        {
            var mainFile = Path.Combine(TempFolder, "poster.tif");
            var resizedFile = Path.Combine(TempFolder, "poster-170.jpg");

            using (var source = VipsImage.Black(10, 10))
            {
                source.Tiffsave(mainFile);
            }

            Assert.Throws<VipsException>(() => Subject.Resize(mainFile, resizedFile, 170));

            File.Exists(resizedFile).Should().BeFalse();
        }

        [Test]
        public void should_be_available_with_libvips_8_15()
        {
            ImageResizer.GetUnavailableReason(true, null, (8 << 16) | (15 << 8)).Should().BeNull();
        }

        [Test]
        public void should_be_unavailable_when_libvips_is_older_than_8_15()
        {
            ImageResizer.GetUnavailableReason(true, null, (8 << 16) | (14 << 8) | 1).Should().Be("libvips 8.14.1 is older than 8.15");
        }

        [Test]
        public void should_be_unavailable_when_libvips_version_is_unknown()
        {
            ImageResizer.GetUnavailableReason(true, null, null).Should().Be("libvips of unknown version is older than 8.15");
        }

        [Test]
        public void should_be_unavailable_when_libvips_cannot_be_loaded()
        {
            ImageResizer.GetUnavailableReason(false, new DllNotFoundException("libvips.so.42"), null).Should().Be("libvips could not be loaded (libvips.so.42)");
            ImageResizer.GetUnavailableReason(false, null, null).Should().Be("libvips could not be loaded (not found)");
        }
    }
}
