using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Qualities;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Movies;

namespace NzbDrone.Api.Test.v3.Movies
{
    [Parallelizable(ParallelScope.Self)]
    public class MovieLookupControllerFixture : TestBase<MovieLookupController>
    {
        private const string ForeignId = "019bfb1f-89a6-77c8-a5b2-856d3735a2b1";

        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<ISearchForNewMovie>()
                .Setup(s => s.SearchForNewEntity("droned", null))
                .Returns(new List<object> { BuildMovie() });

            Mocker.GetMock<IImportListExclusionService>()
                .Setup(s => s.GetAllExclusions())
                .Returns(new List<ImportListExclusion>());

            Mocker.GetMock<IMovieService>()
                .Setup(s => s.FindByForeignIds(It.IsAny<List<string>>()))
                .Returns(new List<Movie>());
        }

        [Test]
        public void should_report_the_existing_file_when_the_match_has_one()
        {
            var existing = BuildMovie();
            existing.Id = 18;
            existing.MovieFileId = 7;
            existing.MovieFile = new MovieFile
            {
                Id = 7,
                Size = 4200,
                Quality = new QualityModel(Quality.WEBDL1080p)
            };

            GivenExistingMovie(existing);

            var result = Subject.Search("droned").Single();

            result.IsExisting.Should().BeTrue();
            result.HasFile.Should().BeTrue();
            result.SizeOnDisk.Should().Be(4200);
            result.ExistingQuality.Quality.Should().Be(Quality.WEBDL1080p);
        }

        [Test]
        public void should_report_no_file_when_the_match_is_missing()
        {
            var existing = BuildMovie();
            existing.Id = 18;

            GivenExistingMovie(existing);

            var result = Subject.Search("droned").Single();

            result.IsExisting.Should().BeTrue();
            result.HasFile.Should().BeFalse();
            result.ExistingQuality.Should().BeNull();
        }

        // The repository left-joins the movie file, which can hand back a hollow row
        // rather than null when the movie has no file at all.
        [Test]
        public void should_report_no_file_when_the_match_only_has_an_empty_joined_file()
        {
            var existing = BuildMovie();
            existing.Id = 18;
            existing.MovieFile = new MovieFile { Quality = new QualityModel() };

            GivenExistingMovie(existing);

            var result = Subject.Search("droned").Single();

            result.IsExisting.Should().BeTrue();
            result.HasFile.Should().BeFalse();
            result.SizeOnDisk.Should().Be(0);
            result.ExistingQuality.Should().BeNull();
        }

        [Test]
        public void should_not_report_a_file_when_the_result_is_not_in_the_library()
        {
            var result = Subject.Search("droned").Single();

            result.IsExisting.Should().BeFalse();
            result.HasFile.Should().BeNull();
            result.ExistingQuality.Should().BeNull();
        }

        private static Movie BuildMovie()
        {
            return new Movie
            {
                MovieMetadata = new MovieMetadata
                {
                    ForeignId = ForeignId,
                    Title = "Droned",
                    Images = new List<MediaCover>()
                }
            };
        }

        private void GivenExistingMovie(Movie movie)
        {
            Mocker.GetMock<IMovieService>()
                .Setup(s => s.FindByForeignIds(It.IsAny<List<string>>()))
                .Returns(new List<Movie> { movie });
        }
    }
}
