using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.MovieImport;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Profiles;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MediaFiles.MovieImport
{
    [TestFixture]
    public class LocalMovieCustomFormatCalculationServiceFixture : CoreTest<LocalMovieCustomFormatCalculationService>
    {
        private const int EnglishCustomFormatScore = 10;
        private const int SpanishCustomFormatScore = 2;
        private const string RenamedFileName = "Vixen - 2023-12-18 - Scene Title [DVD English]";

        private LocalMovie _localMovie;
        private CustomFormat _englishCustomFormat;
        private CustomFormat _spanishCustomFormat;

        [SetUp]
        public void Setup()
        {
            _englishCustomFormat = new CustomFormat("HasEnglish") { Id = 1 };
            _spanishCustomFormat = new CustomFormat("HasSpanish") { Id = 2 };

            var movie = Builder<Movie>.CreateNew()
                                      .With(e => e.Path = @"C:\Test\Vixen".AsOsAgnostic())
                                      .With(e => e.QualityProfile = new QualityProfile
                                      {
                                          Items = Qualities.QualityFixture.GetDefaultQualities(),
                                          FormatItems = new List<ProfileFormatItem>
                                          {
                                              new() { Format = _englishCustomFormat, Score = EnglishCustomFormatScore },
                                              new() { Format = _spanishCustomFormat, Score = SpanishCustomFormatScore }
                                          }
                                      })
                                      .Build();

            _localMovie = new LocalMovie
            {
                Movie = movie,
                Quality = new QualityModel(Quality.DVD),
                Languages = new List<Language> { Language.Spanish },
                Path = @"C:\Test\Unsorted\Vixen.23.12.18.Scene.Title.DVDRip.Spanish.XviD-GRP.avi".AsOsAgnostic()
            };

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<LocalMovie>(), It.Is<string>(x => x.Contains("English"))))
                  .Returns(new List<CustomFormat> { _englishCustomFormat });

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<LocalMovie>(), It.Is<string>(x => x.Contains("Spanish"))))
                  .Returns(new List<CustomFormat> { _spanishCustomFormat });

            GivenRenamedFileName(RenamedFileName);
        }

        [Test]
        public void should_build_a_filename_and_use_it_to_calculate_custom_formats()
        {
            Subject.ParseMovieCustomFormats(_localMovie).Should().BeEquivalentTo(new[] { _englishCustomFormat });
        }

        [Test]
        public void should_update_custom_formats_on_local_movie()
        {
            Subject.UpdateMovieCustomFormats(_localMovie);

            _localMovie.OriginalFileNameCustomFormats.Should().BeEquivalentTo(new[] { _spanishCustomFormat });
            _localMovie.OriginalFileNameCustomFormatScore.Should().Be(SpanishCustomFormatScore);

            _localMovie.CustomFormats.Should().BeEquivalentTo(new[] { _englishCustomFormat });
            _localMovie.CustomFormatScore.Should().Be(EnglishCustomFormatScore);
        }

        [Test]
        public void should_score_the_renamed_file_name_with_the_original_extension()
        {
            Subject.ParseMovieCustomFormats(_localMovie);

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Verify(s => s.ParseCustomFormat(_localMovie, RenamedFileName + ".avi"), Times.Once());
        }

        // A naming format can put the file in folders; existing files are scored on the file name alone.
        [Test]
        public void should_score_only_the_file_name_part_of_a_renamed_path()
        {
            GivenRenamedFileName(@"Vixen\2023\Scene Title [DVD English]".AsOsAgnostic());

            Subject.ParseMovieCustomFormats(_localMovie);

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Verify(s => s.ParseCustomFormat(_localMovie, "Scene Title [DVD English].avi"), Times.Once());
        }

        [Test]
        public void should_score_nothing_without_a_quality_profile()
        {
            _localMovie.Movie.QualityProfile = null;

            Subject.UpdateMovieCustomFormats(_localMovie);

            _localMovie.CustomFormats.Should().BeEquivalentTo(new[] { _englishCustomFormat });
            _localMovie.CustomFormatScore.Should().Be(0);
            _localMovie.OriginalFileNameCustomFormatScore.Should().Be(0);
        }

        private void GivenRenamedFileName(string fileName)
        {
            Mocker.GetMock<IBuildFileNames>()
                  .Setup(s => s.BuildFileName(It.IsAny<Movie>(), It.IsAny<MovieFile>(), null, null, false))
                  .Returns(fileName);
        }
    }
}
