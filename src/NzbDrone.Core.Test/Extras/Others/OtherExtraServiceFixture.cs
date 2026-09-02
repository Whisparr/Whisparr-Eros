using System.Collections.Generic;
using System.IO;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Extras.Others;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.Extras.Others
{
    [TestFixture]
    public class OtherExtraServiceFixture : CoreTest<OtherExtraService>
    {
        private Movie _movie;
        private MovieFile _movieFile;
        private LocalMovie _localMovie;

        private string _movieFolder;
        private string _releaseFolder;

        [SetUp]
        public void Setup()
        {
            _movieFolder = @"C:\Test\Movies\Movie Title".AsOsAgnostic();
            _releaseFolder = @"C:\Test\Unsorted Movies\Movie.Title.2022".AsOsAgnostic();

            _movie = Builder<Movie>.CreateNew()
                                     .With(s => s.Path = _movieFolder)
                                     .Build();

            _movieFile = Builder<MovieFile>.CreateNew()
                                               .With(f => f.Path = Path.Combine(_movie.Path, "Movie Title - 2022.mkv").AsOsAgnostic())
                                               .With(f => f.RelativePath = @"Movie Title - 2022.mkv")
                                               .Build();

            _localMovie = Builder<LocalMovie>.CreateNew()
                                                 .With(l => l.Movie = _movie)
                                                 .With(l => l.Path = Path.Combine(_releaseFolder, "Movie.Title.2022.mkv").AsOsAgnostic())
                                                 .With(l => l.FileMovieInfo = new ParsedMovieInfo
                                                 {
                                                     MovieTitles = new List<string> { "Movie Title" },
                                                     Year = 2022
                                                 })
                                                 .Build();
        }

        [Test]
        [TestCase("Movie Title - 2022.nfo", "Movie Title - 2022.nfo")]
        [TestCase("Movie.Title.2022.nfo", "Movie Title - 2022.nfo")]
        [TestCase("Movie Title 2022.nfo", "Movie Title - 2022.nfo")]
        [TestCase("Movie_Title_2022.nfo", "Movie Title - 2022.nfo")]
        [TestCase(@"Movie.Title.2022\thumb.jpg", "Movie Title - 2022.jpg")]
        public void should_import_matching_file(string filePath, string expectedOutputPath)
        {
            var files = new List<string> { Path.Combine(_releaseFolder, filePath).AsOsAgnostic() };

            var results = Subject.ImportFiles(_localMovie, _movieFile, files, true).ToList();

            results.Count.Should().Be(1);

            results[0].RelativePath.AsOsAgnostic().PathEquals(expectedOutputPath.AsOsAgnostic()).Should().Be(true);
        }

        [Test]
        public void should_not_import_multiple_nfo_files()
        {
            var files = new List<string>
            {
                Path.Combine(_releaseFolder, "Movie.Title.2022.nfo").AsOsAgnostic(),
                Path.Combine(_releaseFolder, "Movie_Title_2022.nfo").AsOsAgnostic(),
            };

            var results = Subject.ImportFiles(_localMovie, _movieFile, files, true).ToList();

            results.Count.Should().Be(1);
        }

        [Test]
        [TestCase(@"audio_folder_1\Movie.Title.2022.mka", @"audio_folder_2\Movie.Title.2022.mka", "Movie Title - 2022.1.mka", "Movie Title - 2022.2.mka")]
        public void should_import_all_files_with_same_name(string firstExtraFilePath, string secondExtraFilePath, string firstOutputPath, string secondOutputPath)
        {
            var files = new List<string>
            {
                Path.Combine(_releaseFolder, firstExtraFilePath).AsOsAgnostic(),
                Path.Combine(_releaseFolder, secondExtraFilePath).AsOsAgnostic()
            };

            var results = Subject.ImportFiles(_localMovie, _movieFile, files, true).ToList();

            results.Count.Should().Be(2);

            results[0].RelativePath.AsOsAgnostic().PathEquals(firstOutputPath.AsOsAgnostic()).Should().Be(true);
            results[1].RelativePath.AsOsAgnostic().PathEquals(secondOutputPath.AsOsAgnostic()).Should().Be(true);
        }

        [Test]
        public void should_increment_suffix_for_each_duplicate_file()
        {
            var files = new List<string>
            {
                Path.Combine(_releaseFolder, @"audio_folder_1\Movie.Title.2022.mka").AsOsAgnostic(),
                Path.Combine(_releaseFolder, @"audio_folder_2\Movie.Title.2022.mka").AsOsAgnostic(),
                Path.Combine(_releaseFolder, @"audio_folder_3\Movie.Title.2022.mka").AsOsAgnostic(),
            };

            var results = Subject.ImportFiles(_localMovie, _movieFile, files, true).ToList();

            results.Count.Should().Be(3);
            results[0].RelativePath.AsOsAgnostic().PathEquals("Movie Title - 2022.1.mka".AsOsAgnostic()).Should().Be(true);
            results[1].RelativePath.AsOsAgnostic().PathEquals("Movie Title - 2022.2.mka".AsOsAgnostic()).Should().Be(true);
            results[2].RelativePath.AsOsAgnostic().PathEquals("Movie Title - 2022.3.mka".AsOsAgnostic()).Should().Be(true);
        }

        [Test]
        public void should_suffix_files_matched_by_filename_prefix()
        {
            var files = new List<string>
            {
                Path.Combine(_releaseFolder, "Movie.Title.2022.behind_scenes.mka").AsOsAgnostic(),
                Path.Combine(_releaseFolder, "Movie.Title.2022.commentary.mka").AsOsAgnostic(),
            };

            var results = Subject.ImportFiles(_localMovie, _movieFile, files, true).ToList();

            results.Count.Should().Be(2);
            results[0].RelativePath.AsOsAgnostic().PathEquals("Movie Title - 2022.1.mka".AsOsAgnostic()).Should().Be(true);
            results[1].RelativePath.AsOsAgnostic().PathEquals("Movie Title - 2022.2.mka".AsOsAgnostic()).Should().Be(true);
        }

        [Test]
        public void should_suffix_files_matched_by_both_filename_and_movie_info()
        {
            var files = new List<string>
            {
                Path.Combine(_releaseFolder, "Movie.Title.2022.behind_scenes.mka").AsOsAgnostic(),
                Path.Combine(_releaseFolder, @"extras\Movie Title 2022.mka").AsOsAgnostic(),
            };

            var results = Subject.ImportFiles(_localMovie, _movieFile, files, true).ToList();

            results.Count.Should().Be(2);
            results[0].RelativePath.AsOsAgnostic().PathEquals("Movie Title - 2022.1.mka".AsOsAgnostic()).Should().Be(true);
            results[1].RelativePath.AsOsAgnostic().PathEquals("Movie Title - 2022.2.mka".AsOsAgnostic()).Should().Be(true);
        }

        [Test]
        public void should_not_suffix_when_other_files_do_not_match_movie()
        {
            var files = new List<string>
            {
                Path.Combine(_releaseFolder, "Movie.Title.2022.mka").AsOsAgnostic(),
                Path.Combine(_releaseFolder, "Other.Movie.2019.mka").AsOsAgnostic(),
            };

            var results = Subject.ImportFiles(_localMovie, _movieFile, files, true).ToList();

            results.Count.Should().Be(1);
            results[0].RelativePath.AsOsAgnostic().PathEquals("Movie Title - 2022.mka".AsOsAgnostic()).Should().Be(true);
        }
    }
}
