using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.MediaInfo;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.CustomFormats;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests.MovieRepositoryTests
{
    [TestFixture]

    public class MovieRepositoryFixture : DbTest<MovieRepository, Movie>
    {
        private IQualityProfileRepository _profileRepository;
        private int _metadataSequence;

        [SetUp]
        public void Setup()
        {
            _metadataSequence = 0;
            _profileRepository = Mocker.Resolve<QualityProfileRepository>();
            Mocker.SetConstant<IQualityProfileRepository>(_profileRepository);

            Mocker.GetMock<ICustomFormatService>()
                .Setup(x => x.All())
                .Returns(new List<CustomFormat>());
        }

        private QualityProfile GivenProfile()
        {
            var profile = new QualityProfile
            {
                Items = Qualities.QualityFixture.GetDefaultQualities(Quality.Bluray1080p, Quality.DVD, Quality.HDTV720p),
                FormatItems = CustomFormatsTestHelpers.GetDefaultFormatItems(),
                MinFormatScore = 0,
                Cutoff = Quality.Bluray1080p.Id,
                Name = "TestProfile"
            };

            _profileRepository.Insert(profile);

            return profile;
        }

        private MovieFile GivenMovieFile(Quality quality)
        {
            var movieFile = Builder<MovieFile>.CreateNew()
                .With(f => f.Id = 0)
                .With(f => f.Quality = new QualityModel(quality))
                .With(f => f.Languages = new List<Language> { Language.English })
                .With(f => f.MediaInfo = new MediaInfoModel { RawStreamData = "{ \"streams\": [] }", VideoFormat = "h264" })
                .BuildNew();

            return Db.Insert(movieFile);
        }

        // PagedBuilder INNER JOINs MovieMetadata, so a paged movie needs a metadata row to match.
        private Movie GivenPagedMovie(int qualityProfileId, int movieFileId, int year = 2020, HashSet<int> tags = null)
        {
            var metadata = Db.Insert(Builder<MovieMetadata>.CreateNew()
                .With(m => m.Id = 0)
                .With(m => m.Year = year)
                .With(m => m.ForeignId = $"metadata-{++_metadataSequence}")
                .BuildNew());

            var movie = Builder<Movie>.CreateNew()
                .With(m => m.Id = 0)
                .With(m => m.MovieMetadataId = metadata.Id)
                .With(m => m.QualityProfileId = qualityProfileId)
                .With(m => m.MovieFileId = movieFileId)
                .With(m => m.Tags = tags ?? new HashSet<int>())
                .BuildNew();

            return Subject.Insert(movie);
        }

        // Builder() joins MovieFiles on MovieFile.MovieId, while the paging spec filters on
        // Movie.MovieFileId, so a movie with a file has to have both sides pointing at each other.
        private Movie GivenPagedMovieWithFile(int qualityProfileId, Quality quality, HashSet<int> tags = null)
        {
            var movie = GivenPagedMovie(qualityProfileId, movieFileId: 0, tags: tags);

            var movieFile = Db.Insert(Builder<MovieFile>.CreateNew()
                .With(f => f.Id = 0)
                .With(f => f.MovieId = movie.Id)
                .With(f => f.Quality = new QualityModel(quality))
                .With(f => f.Languages = new List<Language> { Language.English })
                .With(f => f.MediaInfo = new MediaInfoModel { RawStreamData = "{ \"streams\": [] }", VideoFormat = "h264" })
                .BuildNew());

            movie.MovieFileId = movieFile.Id;
            Subject.Update(movie);

            return movie;
        }

        // Cutoff is Bluray1080p, so anything below it is unmet.
        private List<QualitiesBelowCutoff> GivenQualitiesBelowCutoff(QualityProfile profile)
        {
            return new List<QualitiesBelowCutoff>
            {
                new QualitiesBelowCutoff(profile.Id, new[] { Quality.HDTV720p.Id, Quality.DVD.Id })
            };
        }

        private static PagingSpec<Movie> PagingSpec() => new PagingSpec<Movie>
        {
            Page = 1,
            PageSize = 10
        };

        [Test]
        public void should_load_quality_profile()
        {
            var profile = new QualityProfile
            {
                Items = Qualities.QualityFixture.GetDefaultQualities(Quality.Bluray1080p, Quality.DVD, Quality.HDTV720p),
                FormatItems = CustomFormatsTestHelpers.GetDefaultFormatItems(),
                MinFormatScore = 0,
                Cutoff = Quality.Bluray1080p.Id,
                Name = "TestProfile"
            };

            _profileRepository.Insert(profile);

            var movie = Builder<Movie>.CreateNew().BuildNew();
            movie.QualityProfileId = profile.Id;

            Subject.Insert(movie);

            Subject.All().Single().QualityProfile.Should().NotBeNull();
        }

        [Test]
        public void should_load_movie_file_on_paged()
        {
            var profile = GivenProfile();
            var movieFile = GivenMovieFile(Quality.HDTV720p);
            GivenPagedMovie(profile.Id, movieFile.Id);

            var movie = Subject.GetPaged(PagingSpec()).Records.Single();

            movie.MovieFile.Should().NotBeNull();
            movie.MovieFile.Quality.Quality.Id.Should().Be(Quality.HDTV720p.Id);
        }

        [Test]
        public void should_load_quality_profile_on_paged()
        {
            var profile = GivenProfile();
            var movieFile = GivenMovieFile(Quality.HDTV720p);
            GivenPagedMovie(profile.Id, movieFile.Id);

            // MovieFileResource.ToResource dereferences this to compute QualityCutoffNotMet.
            Subject.GetPaged(PagingSpec()).Records.Single().QualityProfile.Should().NotBeNull();
        }

        [Test]
        public void should_not_load_media_info_on_paged()
        {
            var profile = GivenProfile();
            var movieFile = GivenMovieFile(Quality.HDTV720p);
            GivenPagedMovie(profile.Id, movieFile.Id);

            // The paged index never renders MediaInfo, so its ~7KB blob is left out of the query.
            Subject.GetPaged(PagingSpec()).Records.Single().MovieFile.MediaInfo.Should().BeNull();
        }

        [Test]
        public void should_not_load_movie_file_when_movie_has_none()
        {
            var profile = GivenProfile();
            GivenPagedMovie(profile.Id, 0);

            Subject.GetPaged(PagingSpec()).Records.Single().MovieFile.Should().BeNull();
        }

        // A dangling QualityProfileId must still resolve to a profile: MovieFileResource.ToResource
        // dereferences it unconditionally, so a null here would throw when mapping the resource.
        [Test]
        public void should_fall_back_to_a_profile_when_quality_profile_is_missing()
        {
            var profile = GivenProfile();
            var movieFile = GivenMovieFile(Quality.HDTV720p);
            GivenPagedMovie(qualityProfileId: 999, movieFileId: movieFile.Id);

            var movie = Subject.GetPaged(PagingSpec()).Records.Single();

            movie.QualityProfile.Should().NotBeNull();
            movie.QualityProfile.Id.Should().Be(profile.Id);
            movie.MovieFile.Should().NotBeNull();
        }

        // MoviesWithoutFiles shares PagedQuery with GetPaged but GROUPs BY Movies.Id, so it must
        // keep selecting only Movies/MovieMetadata columns: a bare MovieFile column under that
        // GROUP BY errors on Postgres.
        [Test]
        public void should_still_page_movies_without_files()
        {
            var profile = GivenProfile();
            GivenPagedMovie(profile.Id, movieFileId: 0);

            var spec = PagingSpec();
            Subject.MoviesWithoutFiles(spec);

            spec.Records.Should().HaveCount(1);
            spec.TotalRecords.Should().Be(1);
        }

        [Test]
        public void should_filter_movies_without_files_by_tag()
        {
            var profile = GivenProfile();
            var tagged = GivenPagedMovie(profile.Id, movieFileId: 0, tags: new HashSet<int> { 1, 2 });
            GivenPagedMovie(profile.Id, movieFileId: 0, tags: new HashSet<int> { 3 });
            GivenPagedMovie(profile.Id, movieFileId: 0);

            var spec = PagingSpec();
            Subject.MoviesWithoutFiles(spec, new HashSet<int> { 2 });

            spec.Records.Should().ContainSingle().Which.Id.Should().Be(tagged.Id);
            spec.TotalRecords.Should().Be(1);
        }

        [Test]
        public void should_match_a_movie_carrying_any_of_the_filtered_tags()
        {
            var profile = GivenProfile();
            GivenPagedMovie(profile.Id, movieFileId: 0, tags: new HashSet<int> { 7 });
            GivenPagedMovie(profile.Id, movieFileId: 0, tags: new HashSet<int> { 8 });

            var spec = PagingSpec();
            Subject.MoviesWithoutFiles(spec, new HashSet<int> { 7, 8 });

            spec.Records.Should().HaveCount(2);
        }

        [Test]
        public void should_not_filter_movies_without_files_when_no_tags_given()
        {
            var profile = GivenProfile();
            GivenPagedMovie(profile.Id, movieFileId: 0, tags: new HashSet<int> { 1 });
            GivenPagedMovie(profile.Id, movieFileId: 0);

            var spec = PagingSpec();
            Subject.MoviesWithoutFiles(spec, new HashSet<int>());

            spec.Records.Should().HaveCount(2);
        }

        [Test]
        public void should_filter_cutoff_unmet_by_tag()
        {
            var profile = GivenProfile();
            var tagged = GivenPagedMovieWithFile(profile.Id, Quality.HDTV720p, tags: new HashSet<int> { 4 });
            GivenPagedMovieWithFile(profile.Id, Quality.HDTV720p, tags: new HashSet<int> { 5 });

            var spec = PagingSpec();
            Subject.MoviesWhereCutoffUnmet(spec, GivenQualitiesBelowCutoff(profile), new HashSet<int> { 4 });

            spec.Records.Should().ContainSingle().Which.Id.Should().Be(tagged.Id);
        }

        [Test]
        public void should_filter_cutoff_unmet_by_quality()
        {
            var profile = GivenProfile();
            var dvdMovie = GivenPagedMovieWithFile(profile.Id, Quality.DVD);
            GivenPagedMovieWithFile(profile.Id, Quality.HDTV720p);

            var spec = PagingSpec();
            Subject.MoviesWhereCutoffUnmet(spec, GivenQualitiesBelowCutoff(profile), quality: new List<int> { Quality.DVD.Id });

            spec.Records.Should().ContainSingle().Which.Id.Should().Be(dvdMovie.Id);
        }

        [Test]
        public void should_not_filter_cutoff_unmet_when_no_tags_or_qualities_given()
        {
            var profile = GivenProfile();
            GivenPagedMovieWithFile(profile.Id, Quality.DVD, tags: new HashSet<int> { 1 });
            GivenPagedMovieWithFile(profile.Id, Quality.HDTV720p);

            var spec = PagingSpec();
            Subject.MoviesWhereCutoffUnmet(spec, GivenQualitiesBelowCutoff(profile));

            spec.Records.Should().HaveCount(2);
        }
    }
}
