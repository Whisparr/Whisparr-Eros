using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Crypto;
using NzbDrone.Core.Configuration.Events;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.Download.Pending;
using NzbDrone.Core.Lifecycle;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Profiles.Delay;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Download.Pending.PendingReleaseServiceTests
{
    [TestFixture]
    public class PendingReleaseCacheFixture : CoreTest<PendingReleaseService>
    {
        private Movie _movie;
        private Movie _otherMovie;
        private List<PendingRelease> _pending;

        [SetUp]
        public void Setup()
        {
            var profile = new QualityProfile
            {
                Items = Qualities.QualityFixture.GetDefaultQualities()
            };

            _movie = Builder<Movie>.CreateNew()
                                   .With(m => m.Id = 1)
                                   .With(m => m.QualityProfile = profile)
                                   .Build();

            _otherMovie = Builder<Movie>.CreateNew()
                                        .With(m => m.Id = 2)
                                        .Build();

            _pending = new List<PendingRelease>();

            Mocker.GetMock<IPendingReleaseRepository>()
                  .Setup(s => s.All())
                  .Returns(() => _pending.ToList());

            Mocker.GetMock<IPendingReleaseRepository>()
                  .Setup(s => s.AllByMovieId(It.IsAny<int>()))
                  .Returns<int>(id => _pending.Where(p => p.MovieId == id).ToList());

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovies(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Movie> { _movie });

            Mocker.GetMock<IDelayProfileService>()
                  .Setup(s => s.AllForTags(It.IsAny<HashSet<int>>()))
                  .Returns(new List<DelayProfile> { new() });

            Mocker.GetMock<IDelayProfileService>()
                  .Setup(s => s.BestForTags(It.IsAny<HashSet<int>>()))
                  .Returns(new DelayProfile());

            GivenPending(1);

            Subject.Handle(new ApplicationStartedEvent());
        }

        [Test]
        public void should_build_the_queue_from_the_cache()
        {
            Subject.GetPendingQueue().Should().HaveCount(1);
            Subject.GetPendingQueue().Should().HaveCount(1);

            VerifyLoads(1);
            Mocker.GetMock<IPendingReleaseRepository>().Verify(v => v.WithoutFallback(), Times.Never());
        }

        [Test]
        public void should_leave_fallback_releases_out_of_the_queue()
        {
            GivenPending(2, PendingReleaseReason.Fallback);
            Subject.Handle(new ApplicationStartedEvent());

            Subject.GetPendingQueue().Should().ContainSingle();
        }

        [Test]
        public void should_rebuild_when_a_movie_with_pending_releases_is_updated()
        {
            Subject.Handle(new MovieUpdatedEvent(_movie));

            VerifyLoads(2);
        }

        // A library refresh publishes an update for every movie in it.
        [Test]
        public void should_not_rebuild_when_a_movie_without_pending_releases_is_updated()
        {
            Subject.Handle(new MovieUpdatedEvent(_otherMovie));

            VerifyLoads(1);
        }

        [Test]
        public void should_rebuild_when_a_movie_with_pending_releases_is_edited()
        {
            Subject.Handle(new MovieEditedEvent(_movie, _movie));

            VerifyLoads(2);
        }

        [Test]
        public void should_not_rebuild_when_a_movie_without_pending_releases_is_edited()
        {
            Subject.Handle(new MovieEditedEvent(_otherMovie, _otherMovie));

            VerifyLoads(1);
        }

        [Test]
        public void should_rebuild_when_a_bulk_edit_includes_a_movie_with_pending_releases()
        {
            Subject.Handle(new MoviesBulkEditedEvent(new[] { _otherMovie, _movie }));

            VerifyLoads(2);
        }

        [Test]
        public void should_not_rebuild_when_a_bulk_edit_has_no_movie_with_pending_releases()
        {
            Subject.Handle(new MoviesBulkEditedEvent(new[] { _otherMovie }));

            VerifyLoads(1);
        }

        [Test]
        public void should_rebuild_when_a_quality_profile_is_updated()
        {
            Subject.Handle(new QualityProfileUpdatedEvent(1));

            VerifyLoads(2);
        }

        [Test]
        public void should_rebuild_when_config_is_saved()
        {
            Subject.Handle(new ConfigSavedEvent());

            VerifyLoads(2);
        }

        [Test]
        public void should_drop_a_removed_queue_item_from_the_queue()
        {
            var queueId = HashConverter.GetHashInt31($"pending-1-movie{_movie.Id}");

            Mocker.GetMock<IPendingReleaseRepository>()
                  .Setup(s => s.DeleteMany(It.IsAny<IEnumerable<int>>()))
                  .Callback<IEnumerable<int>>(ids => _pending.RemoveAll(p => ids.Contains(p.Id)));

            Subject.RemovePendingQueueItems(queueId);

            Subject.GetPendingQueue().Should().BeEmpty();
        }

        [Test]
        public void should_change_the_reason_on_a_copy_of_the_cached_release()
        {
            var cached = _pending.Single();
            var remoteMovie = new RemoteMovie
            {
                Movie = _movie,
                ParsedMovieInfo = cached.ParsedMovieInfo,
                Release = cached.Release
            };

            Subject.Add(new DownloadDecision(remoteMovie), PendingReleaseReason.DownloadClientUnavailable);

            Mocker.GetMock<IPendingReleaseRepository>()
                  .Verify(v => v.Update(It.Is<PendingRelease>(p => p.Reason == PendingReleaseReason.DownloadClientUnavailable && !ReferenceEquals(p, cached))), Times.Once());

            cached.Reason.Should().Be(PendingReleaseReason.Delay);
        }

        private void GivenPending(int id, PendingReleaseReason reason = PendingReleaseReason.Delay)
        {
            _pending.Add(new PendingRelease
            {
                Id = id,
                MovieId = _movie.Id,
                Title = $"Movie.Title.2020.720p-GRP{id}",
                Reason = reason,
                ParsedMovieInfo = new ParsedMovieInfo
                {
                    MovieTitles = new List<string> { "Movie Title" },
                    Quality = new QualityModel(Quality.HDTV720p)
                },
                Release = Builder<ReleaseInfo>.CreateNew()
                                              .With(r => r.Title = $"Movie.Title.2020.720p-GRP{id}")
                                              .Build()
            });
        }

        private void VerifyLoads(int times)
        {
            Mocker.GetMock<IPendingReleaseRepository>().Verify(v => v.All(), Times.Exactly(times));
        }
    }
}
