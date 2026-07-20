using System.Collections.Generic;
using FluentAssertions;
using NLog;
using NUnit.Framework;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Profiles;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using Whisparr.Api.V3.Movies;

namespace NzbDrone.Api.Test.v3.Movies
{
    // MovieFileResource.ToResource dereferences Movie.QualityProfile to compute QualityCutoffNotMet,
    // so hydrating MovieFile without a profile throws. The repository tests can't catch that because
    // they never map a resource. These cover the shape the paged index returns.
    [Parallelizable(ParallelScope.All)]
    public class MovieResourceFixture
    {
        // QualityCutoffNotMet uses neither dependency.
        private readonly IUpgradableSpecification _upgradableSpecification =
            new UpgradableSpecification(null, LogManager.GetCurrentClassLogger());

        private static QualityProfile Profile() => new QualityProfile
        {
            Id = 1,
            Name = "TestProfile",
            UpgradeAllowed = true,
            Cutoff = Quality.Bluray1080p.Id,
            MinFormatScore = 0,
            FormatItems = new List<ProfileFormatItem>(),
            Items = new List<QualityProfileQualityItem>
            {
                new QualityProfileQualityItem { Quality = Quality.DVD, Allowed = true },
                new QualityProfileQualityItem { Quality = Quality.HDTV720p, Allowed = true },
                new QualityProfileQualityItem { Quality = Quality.Bluray1080p, Allowed = true }
            }
        };

        private static Movie MovieWithFile(Quality quality, QualityProfile profile) => new Movie
        {
            Id = 1,
            Path = "/movies/some.movie",
            QualityProfileId = profile.Id,
            QualityProfile = profile,
            MovieFileId = 1,
            MovieMetadata = new MovieMetadata { Title = "Some Movie", ItemType = ItemType.Scene },
            MovieFile = new MovieFile
            {
                Id = 1,
                MovieId = 1,
                RelativePath = "some.movie.mkv",
                Quality = new QualityModel(quality)
            }
        };

        [Test]
        public void should_map_movie_file_quality()
        {
            var resource = MovieWithFile(Quality.HDTV720p, Profile()).ToResource(0, _upgradableSpecification);

            resource.MovieFile.Should().NotBeNull();
            resource.MovieFile.Quality.Quality.Id.Should().Be(Quality.HDTV720p.Id);
        }

        [Test]
        public void should_map_quality_cutoff_not_met_when_below_cutoff()
        {
            // Profile cutoff is Bluray1080p, so a 720p file has not met it.
            var resource = MovieWithFile(Quality.HDTV720p, Profile()).ToResource(0, _upgradableSpecification);

            resource.MovieFile.QualityCutoffNotMet.Should().BeTrue();
        }

        [Test]
        public void should_map_quality_cutoff_met_when_at_cutoff()
        {
            var resource = MovieWithFile(Quality.Bluray1080p, Profile()).ToResource(0, _upgradableSpecification);

            resource.MovieFile.QualityCutoffNotMet.Should().BeFalse();
        }

        [Test]
        public void should_not_map_movie_file_when_movie_has_none()
        {
            var movie = MovieWithFile(Quality.HDTV720p, Profile());
            movie.MovieFile = null;
            movie.MovieFileId = 0;

            movie.ToResource(0, _upgradableSpecification).MovieFile.Should().BeNull();
        }
    }
}
