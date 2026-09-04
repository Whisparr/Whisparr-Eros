using System;
using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Blocklisting;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.History;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.MediaInfo;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.CustomFormats;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Qualities
{
    // Sorting by quality is done in SQL, so the unit tests on the rank service prove nothing about
    // the ordering an API caller actually gets. These go through the real repositories against a
    // real database.
    [TestFixture]
    public class QualityProfileRankIntegrationFixture : DbTest
    {
        private int _metadataSequence;

        [SetUp]
        public void Setup()
        {
            _metadataSequence = 0;

            Mocker.SetConstant<IQualityProfileRepository>(Mocker.Resolve<QualityProfileRepository>());
            Mocker.SetConstant<IQualityProfileRankRepository>(Mocker.Resolve<QualityProfileRankRepository>());
            Mocker.SetConstant<IQualityProfileRankService>(Mocker.Resolve<QualityProfileRankService>());

            Mocker.GetMock<ICustomFormatService>().Setup(x => x.All()).Returns(new List<CustomFormat>());
        }

        [Test]
        public void should_order_history_across_two_profiles_by_normalised_score()
        {
            // SDTV is worst in A but middling in B, so a raw quality id or weight would order these
            // differently from the profile-relative rank this is meant to produce.
            var profileA = GivenProfile(Quality.SDTV, Quality.HDTV720p);
            var profileB = GivenProfile(Quality.Bluray1080p, Quality.SDTV, Quality.HDTV720p, Quality.WEBDL1080p);

            var movieA = GivenMovie(profileA.Id);
            var movieB = GivenMovie(profileB.Id);

            var history = Mocker.Resolve<HistoryRepository>();
            Mocker.SetConstant<IHistoryRepository>(history);

            GivenHistory(movieA.Id, Quality.HDTV720p);
            GivenHistory(movieB.Id, Quality.SDTV);
            GivenHistory(movieB.Id, Quality.WEBDL1080p);

            var result = history.GetPaged(PagedSpec<MovieHistory>(), null, null);

            result.Records.Select(r => r.Quality.Quality.Id)
                  .Should().Equal(Quality.SDTV.Id, Quality.HDTV720p.Id, Quality.WEBDL1080p.Id);
        }

        [Test]
        public void should_order_blocklist_across_two_profiles_by_normalised_score()
        {
            var profileA = GivenProfile(Quality.SDTV, Quality.HDTV720p);
            var profileB = GivenProfile(Quality.Bluray1080p, Quality.SDTV, Quality.HDTV720p, Quality.WEBDL1080p);

            var movieA = GivenMovie(profileA.Id);
            var movieB = GivenMovie(profileB.Id);

            var blocklist = Mocker.Resolve<BlocklistRepository>();

            GivenBlocklist(blocklist, movieA.Id, Quality.HDTV720p);
            GivenBlocklist(blocklist, movieB.Id, Quality.SDTV);
            GivenBlocklist(blocklist, movieB.Id, Quality.WEBDL1080p);

            var result = blocklist.GetPaged(PagedSpec<Blocklist>());

            result.Records.Select(b => b.Quality.Quality.Id)
                  .Should().Equal(Quality.SDTV.Id, Quality.HDTV720p.Id, Quality.WEBDL1080p.Id);
        }

        [Test]
        public void should_order_cutoff_unmet_by_normalised_score()
        {
            var profile = GivenProfile(Quality.SDTV, Quality.HDTV720p, Quality.WEBDL1080p, Quality.Bluray1080p);
            profile.Cutoff = Quality.Bluray1080p.Id;
            Mocker.Resolve<IQualityProfileRepository>().Update(profile);

            var movies = Mocker.Resolve<MovieRepository>();

            var web = GivenMovieWithFile(movies, profile.Id, Quality.WEBDL1080p);
            var sd = GivenMovieWithFile(movies, profile.Id, Quality.SDTV);
            var hd = GivenMovieWithFile(movies, profile.Id, Quality.HDTV720p);

            var belowCutoff = new List<QualitiesBelowCutoff>
            {
                new (profile.Id, new[] { Quality.SDTV.Id, Quality.HDTV720p.Id, Quality.WEBDL1080p.Id })
            };

            var result = movies.MoviesWhereCutoffUnmet(PagedSpec<Movie>(), belowCutoff);

            result.Records.Select(m => m.Id).Should().Equal(sd.Id, hd.Id, web.Id);
        }

        [Test]
        public void should_order_descending_when_asked()
        {
            var profile = GivenProfile(Quality.SDTV, Quality.HDTV720p, Quality.WEBDL1080p);
            var movie = GivenMovie(profile.Id);

            var blocklist = Mocker.Resolve<BlocklistRepository>();

            GivenBlocklist(blocklist, movie.Id, Quality.SDTV);
            GivenBlocklist(blocklist, movie.Id, Quality.WEBDL1080p);

            var spec = PagedSpec<Blocklist>();
            spec.SortDirection = SortDirection.Descending;

            blocklist.GetPaged(spec).Records.Select(b => b.Quality.Quality.Id)
                     .Should().Equal(Quality.WEBDL1080p.Id, Quality.SDTV.Id);
        }

        [Test]
        public void should_sort_a_quality_missing_from_the_profile_last_when_ascending()
        {
            var profile = GivenProfile(Quality.SDTV, Quality.HDTV720p);
            var movie = GivenMovie(profile.Id);

            var blocklist = Mocker.Resolve<BlocklistRepository>();

            GivenBlocklist(blocklist, movie.Id, Quality.SDTV);
            GivenBlocklist(blocklist, movie.Id, Quality.Bluray2160p);

            // Bluray2160p has no rank for this profile, so the COALESCE default of -1 puts it first.
            blocklist.GetPaged(PagedSpec<Blocklist>()).Records.Select(b => b.Quality.Quality.Id)
                     .Should().Equal(Quality.Bluray2160p.Id, Quality.SDTV.Id);
        }

        [Test]
        public void should_report_the_full_count_when_sorting_by_quality()
        {
            var profile = GivenProfile(Quality.SDTV, Quality.HDTV720p);
            var movie = GivenMovie(profile.Id);

            var blocklist = Mocker.Resolve<BlocklistRepository>();

            GivenBlocklist(blocklist, movie.Id, Quality.SDTV);
            GivenBlocklist(blocklist, movie.Id, Quality.HDTV720p);

            var spec = PagedSpec<Blocklist>();
            spec.PageSize = 1;

            // The rank join is a LEFT JOIN, so it must not multiply or drop rows in the count query.
            blocklist.GetPaged(spec).TotalRecords.Should().Be(2);
        }

        private static PagingSpec<T> PagedSpec<T>()
            where T : ModelBase
        {
            return new PagingSpec<T>
            {
                Page = 1,
                PageSize = 10,
                SortKey = "quality",
                SortDirection = SortDirection.Ascending
            };
        }

        private QualityProfile GivenProfile(params Quality[] qualities)
        {
            var profile = new QualityProfile
            {
                Name = $"profile-{Guid.NewGuid()}",
                Cutoff = qualities.Last().Id,
                MinFormatScore = 0,
                FormatItems = CustomFormatsTestHelpers.GetDefaultFormatItems(),
                Items = qualities.Select(q => new QualityProfileQualityItem { Quality = q, Allowed = true }).ToList()
            };

            Mocker.Resolve<IQualityProfileRepository>().Insert(profile);
            Mocker.Resolve<IQualityProfileRankService>().UpdateRanksForProfile(profile);

            return profile;
        }

        private Movie GivenMovie(int qualityProfileId, int movieFileId = 0)
        {
            var metadata = Db.Insert(Builder<MovieMetadata>.CreateNew()
                .With(m => m.Id = 0)
                .With(m => m.ForeignId = $"metadata-{++_metadataSequence}")
                .BuildNew());

            return Db.Insert(Builder<Movie>.CreateNew()
                .With(m => m.Id = 0)
                .With(m => m.MovieMetadataId = metadata.Id)
                .With(m => m.QualityProfileId = qualityProfileId)
                .With(m => m.MovieFileId = movieFileId)
                .With(m => m.Tags = new HashSet<int>())
                .BuildNew());
        }

        private Movie GivenMovieWithFile(MovieRepository movies, int qualityProfileId, Quality quality)
        {
            var movie = GivenMovie(qualityProfileId);

            var movieFile = Db.Insert(Builder<MovieFile>.CreateNew()
                .With(f => f.Id = 0)
                .With(f => f.MovieId = movie.Id)
                .With(f => f.Quality = new QualityModel(quality))
                .With(f => f.Languages = new List<Language> { Language.English })
                .With(f => f.MediaInfo = new MediaInfoModel { RawStreamData = "{ \"streams\": [] }", VideoFormat = "h264" })
                .BuildNew());

            movie.MovieFileId = movieFile.Id;
            movies.Update(movie);

            return movie;
        }

        private void GivenHistory(int movieId, Quality quality)
        {
            Mocker.Resolve<IHistoryRepository>().Insert(Builder<MovieHistory>.CreateNew()
                .With(h => h.Id = 0)
                .With(h => h.MovieId = movieId)
                .With(h => h.SourceTitle = "test")
                .With(h => h.Date = DateTime.UtcNow)
                .With(h => h.Quality = new QualityModel(quality))
                .With(h => h.EventType = MovieHistoryEventType.Grabbed)
                .With(h => h.Languages = new List<Language> { Language.English })
                .BuildNew());
        }

        private void GivenBlocklist(BlocklistRepository repository, int movieId, Quality quality)
        {
            repository.Insert(Builder<Blocklist>.CreateNew()
                .With(b => b.Id = 0)
                .With(b => b.MovieId = movieId)
                .With(b => b.SourceTitle = "test")
                .With(b => b.Date = DateTime.UtcNow)
                .With(b => b.Quality = new QualityModel(quality))
                .With(b => b.Languages = new List<Language> { Language.English })
                .BuildNew());
        }
    }
}
