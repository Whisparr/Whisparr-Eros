using System.Collections.Generic;
using System.Globalization;
using System.Threading;
using System.Xml.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Extras.Metadata;
using NzbDrone.Core.Extras.Metadata.Consumers.Xbmc;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.MediaInfo;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.Extras.Metadata.Consumers.Xbmc
{
    [TestFixture]
    public class MovieMetadataFixture : CoreTest<XbmcMetadata>
    {
        private Movie _movie;
        private MovieFile _movieFile;

        [SetUp]
        public void Setup()
        {
            Subject.Definition = new MetadataDefinition
            {
                Settings = new XbmcMetadataSettings { MovieMetadata = true }
            };

            // Shaped like a movie loaded from the database: Studio is never persisted, only StudioTitle is
            _movie = new Movie
            {
                Path = @"C:\Test\Scenes\Bratty Sis\Stepsis Has A New Fetish (2026)".AsOsAgnostic(),
                MovieMetadata = new MovieMetadata
                {
                    Title = "Stepsis Has A New Fetish",
                    StudioTitle = "Bratty Sis",
                    Studio = null
                }
            };

            _movieFile = new MovieFile
            {
                RelativePath = "Bratty Sis - Stepsis Has A New Fetish (2026).mkv"
            };

            Mocker.GetMock<ICreditService>()
                  .Setup(s => s.GetAllCreditsForMovieMetadata(It.IsAny<int>()))
                  .Returns(new List<Credit>());
        }

        [Test]
        public void should_write_studio_title_when_studio_resource_is_not_loaded()
        {
            GetStudioElement().Value.Should().Be("Bratty Sis");
        }

        [Test]
        public void should_write_empty_studio_when_movie_has_no_studio()
        {
            _movie.MovieMetadata.Value.StudioTitle = null;

            GetStudioElement().Value.Should().BeEmpty();
        }

        [TestCase("en-US")]
        [TestCase("de-DE")]
        public void should_write_framerate_with_invariant_decimal_separator(string culture)
        {
            var originalCulture = Thread.CurrentThread.CurrentCulture;

            try
            {
                Thread.CurrentThread.CurrentCulture = CultureInfo.GetCultureInfo(culture);

                _movieFile.MediaInfo = new MediaInfoModel
                {
                    Width = 1920,
                    Height = 1080,
                    VideoFps = 29.97m
                };

                var result = Subject.MovieMetadata(_movie, _movieFile);

                XDocument.Parse(result.Contents).Root
                         .Element("fileinfo").Element("streamdetails").Element("video").Element("framerate")
                         .Value.Should().Be("29.97");
            }
            finally
            {
                Thread.CurrentThread.CurrentCulture = originalCulture;
            }
        }

        private XElement GetStudioElement()
        {
            var result = Subject.MovieMetadata(_movie, _movieFile);

            return XDocument.Parse(result.Contents).Root.Element("studio");
        }
    }
}
