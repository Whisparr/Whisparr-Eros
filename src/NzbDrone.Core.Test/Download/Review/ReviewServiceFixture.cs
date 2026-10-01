using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Blocklisting;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Download.Review
{
    [TestFixture]
    public class ReviewServiceFixture : CoreTest<ReviewService>
    {
        private Movie _scene;
        private Movie _otherScene;
        private List<ReviewItem> _stored;

        [SetUp]
        public void Setup()
        {
            _scene = new Movie { Id = 4, Title = "Poolside", Monitored = true };
            _otherScene = new Movie { Id = 5, Title = "Locker Room", Monitored = true };
            _stored = new List<ReviewItem>();

            var repository = Mocker.GetMock<IReviewItemRepository>();

            repository.Setup(s => s.Insert(It.IsAny<ReviewItem>()))
                      .Returns<ReviewItem>(i =>
                      {
                          i.Id = _stored.Count + 1;
                          _stored.Add(i);
                          return i;
                      });

            repository.Setup(s => s.FindByGuid(It.IsAny<int>(), It.IsAny<string>()))
                      .Returns<int, string>((indexerId, guid) => _stored.Where(i => i.IndexerId == indexerId && i.Guid == guid).ToList());

            repository.Setup(s => s.FindByTitle(It.IsAny<int>(), It.IsAny<string>()))
                      .Returns<int, string>((indexerId, title) => _stored.Where(i => i.IndexerId == indexerId && i.Title == title).ToList());

            repository.Setup(s => s.Pending())
                      .Returns(() => _stored.Where(i => i.Status == ReviewItemStatus.Pending).ToList());

            repository.Setup(s => s.Get(It.IsAny<int>()))
                      .Returns<int>(id => _stored.Single(i => i.Id == id));

            repository.Setup(s => s.Get(It.IsAny<IEnumerable<int>>()))
                      .Returns<IEnumerable<int>>(ids => _stored.Where(i => ids.Contains(i.Id)).ToList());

            repository.Setup(s => s.DeleteMany(It.IsAny<IEnumerable<int>>()))
                      .Callback<IEnumerable<int>>(ids => _stored.RemoveAll(i => ids.Contains(i.Id)));

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovie(_scene.Id))
                  .Returns(_scene);

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.GetMovie(_otherScene.Id))
                  .Returns(_otherScene);

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.FindByIds(It.IsAny<List<int>>()))
                  .Returns<List<int>>(ids => new[] { _scene, _otherScene }.Where(m => ids.Contains(m.Id)).ToList());

            Mocker.GetMock<Queue.IQueueService>()
                  .Setup(s => s.GetQueue())
                  .Returns(new List<Queue.Queue>());
        }

        private static ReleaseInfo GivenRelease(string guid = "guid-1", DownloadProtocol protocol = DownloadProtocol.Usenet)
        {
            var release = protocol == DownloadProtocol.Torrent
                ? new TorrentInfo { InfoHash = "ABCDEF", MagnetUrl = "magnet:?xt=urn:btih:ABCDEF", Seeders = 12 }
                : new ReleaseInfo();

            release.Guid = guid;
            release.Title = "Helix Studios - Hot Afternoon - Dakota Lovell";
            release.IndexerId = 1;
            release.Indexer = "Indexer";
            release.Size = 1000;
            release.DownloadProtocol = protocol;
            release.PublishDate = DateTime.UtcNow;

            return release;
        }

        private DownloadDecision GivenDecision(Quality quality, ReleaseSourceType source, IEnumerable<SceneMatchCandidate> candidates, params DownloadRejection[] rejections)
        {
            var candidateList = candidates.ToList();

            var remoteMovie = new RemoteMovie
            {
                Movie = candidateList.FirstOrDefault()?.Movie ?? _scene,
                Release = GivenRelease(),
                ParsedMovieInfo = new ParsedMovieInfo { Quality = new QualityModel(quality) },
                ReleaseSource = source,
                ReviewCandidates = candidateList
            };

            return new DownloadDecision(remoteMovie, rejections);
        }

        private DownloadDecision GivenWeakMatch(ReleaseSourceType source = ReleaseSourceType.Rss, params DownloadRejection[] otherRejections)
        {
            var rejections = otherRejections.Append(new DownloadRejection(DownloadRejectionReason.NeedsReview, "Needs review")).ToArray();

            return GivenDecision(Quality.WEBDL720p, source, new[] { new SceneMatchCandidate(_scene, MovieParseMatchType.PerformersNotTitle) }, rejections);
        }

        private List<ReviewItem> Capture(params DownloadDecision[] decisions)
        {
            return Subject.Capture(decisions, new List<DownloadDecision>());
        }

        private static DownloadRejection QualityNotWanted => new (DownloadRejectionReason.QualityNotWanted, "Quality not wanted");

        [TestCase(ReleaseSourceType.Rss)]
        [TestCase(ReleaseSourceType.Search)]
        [TestCase(ReleaseSourceType.UserInvokedSearch)]
        public void should_capture_weak_dateless_match_from_automatic_grabs(ReleaseSourceType source)
        {
            var added = Capture(GivenWeakMatch(source));

            added.Should().ContainSingle();

            var item = added.Single();
            item.MovieId.Should().Be(_scene.Id);
            item.Reason.Should().Be(ReviewReason.WeakMatch);
            item.Status.Should().Be(ReviewItemStatus.Pending);
            item.Guid.Should().Be("guid-1");
            item.Candidates.Should().ContainSingle(c => c.MovieId == _scene.Id && c.MatchType == MovieParseMatchType.PerformersNotTitle);

            Mocker.GetMock<IEventAggregator>().Verify(v => v.PublishEvent(It.IsAny<ReviewQueueUpdatedEvent>()), Times.Once());
        }

        [TestCase(ReleaseSourceType.InteractiveSearch)]
        [TestCase(ReleaseSourceType.ReleasePush)]
        public void should_not_capture_from_interactive_search_or_pushed_release(ReleaseSourceType source)
        {
            Capture(GivenWeakMatch(source)).Should().BeEmpty();
        }

        [Test]
        public void should_capture_ambiguous_match_with_all_candidates()
        {
            var decision = GivenDecision(Quality.WEBDL720p,
                ReleaseSourceType.Rss,
                new[] { new SceneMatchCandidate(_scene, MovieParseMatchType.Title), new SceneMatchCandidate(_otherScene, MovieParseMatchType.Title) },
                new DownloadRejection(DownloadRejectionReason.NeedsReview, "Needs review"));

            var item = Capture(decision).Single();

            item.Reason.Should().Be(ReviewReason.AmbiguousMatch);
            item.CandidateMovieIds.Should().Equal(_scene.Id, _otherScene.Id);
        }

        [Test]
        public void should_capture_confident_match_rejected_only_for_unknown_quality()
        {
            var decision = GivenDecision(Quality.Unknown, ReleaseSourceType.Rss, Array.Empty<SceneMatchCandidate>(), QualityNotWanted);

            var item = Capture(decision).Single();

            item.Reason.Should().Be(ReviewReason.UnknownQuality);
            item.CandidateMovieIds.Should().Equal(_scene.Id);
            item.Candidates.Single().MatchType.Should().BeNull();
        }

        [Test]
        public void should_capture_weak_match_with_unknown_quality_once_with_both_reasons()
        {
            var decision = GivenDecision(Quality.Unknown,
                ReleaseSourceType.Rss,
                new[] { new SceneMatchCandidate(_scene, MovieParseMatchType.Performers) },
                QualityNotWanted,
                new DownloadRejection(DownloadRejectionReason.NeedsReview, "Needs review"));

            Capture(decision).Single().Reason.Should().Be(ReviewReason.WeakMatch | ReviewReason.UnknownQuality);
        }

        [Test]
        public void should_not_capture_known_quality_the_profile_does_not_want()
        {
            var decision = GivenDecision(Quality.SDTV, ReleaseSourceType.Rss, Array.Empty<SceneMatchCandidate>(), QualityNotWanted);

            Capture(decision).Should().BeEmpty();
        }

        [Test]
        public void should_not_capture_confident_release_rejected_for_other_reasons()
        {
            var decision = GivenDecision(Quality.Unknown, ReleaseSourceType.Rss, Array.Empty<SceneMatchCandidate>(), QualityNotWanted, new DownloadRejection(DownloadRejectionReason.DiskCutoffMet, "Cutoff met"));

            Capture(decision).Should().BeEmpty();
        }

        [Test]
        public void should_not_capture_confident_release_without_rejections()
        {
            Capture(GivenDecision(Quality.WEBDL720p, ReleaseSourceType.Rss, Array.Empty<SceneMatchCandidate>())).Should().BeEmpty();
        }

        [Test]
        public void should_not_capture_weak_match_that_would_be_rejected_anyway()
        {
            Capture(GivenWeakMatch(ReleaseSourceType.Rss, new DownloadRejection(DownloadRejectionReason.Blocklisted, "Blocklisted"))).Should().BeEmpty();
        }

        [Test]
        public void should_capture_weak_match_that_is_only_delayed()
        {
            Capture(GivenWeakMatch(ReleaseSourceType.Rss, new DownloadRejection(DownloadRejectionReason.MinimumAgeDelay, "Delayed", RejectionType.Temporary))).Should().ContainSingle();
        }

        [Test]
        public void should_not_capture_release_for_scene_grabbed_in_the_same_batch()
        {
            var grabbed = GivenDecision(Quality.WEBDL1080p, ReleaseSourceType.Rss, Array.Empty<SceneMatchCandidate>());

            Subject.Capture(new[] { GivenWeakMatch() }, new[] { grabbed }).Should().BeEmpty();
        }

        [TestCase(ReviewItemStatus.Pending)]
        [TestCase(ReviewItemStatus.Approved)]
        [TestCase(ReviewItemStatus.Rejected)]
        public void should_never_capture_the_same_release_for_the_same_scene_again(ReviewItemStatus status)
        {
            Capture(GivenWeakMatch()).Single().Status = status;

            Capture(GivenWeakMatch()).Should().BeEmpty();
            _stored.Should().ContainSingle();
        }

        [Test]
        public void should_capture_the_same_release_once_within_a_batch()
        {
            Capture(GivenWeakMatch(), GivenWeakMatch()).Should().ContainSingle();
        }

        [Test]
        public void should_keep_torrent_details_of_captured_release()
        {
            var decision = GivenWeakMatch();
            decision.RemoteMovie.Release = GivenRelease(protocol: DownloadProtocol.Torrent);

            var item = Capture(decision).Single();

            item.TorrentInfo.InfoHash.Should().Be("ABCDEF");

            var release = item.GetRelease();
            release.Should().BeOfType<TorrentInfo>();
            ((TorrentInfo)release).MagnetUrl.Should().Be("magnet:?xt=urn:btih:ABCDEF");
            release.Guid.Should().Be("guid-1");
        }

        [Test]
        public void should_announce_captured_releases_once_per_command()
        {
            Capture(GivenWeakMatch());
            var unknownQuality = GivenDecision(Quality.Unknown, ReleaseSourceType.Rss, Array.Empty<SceneMatchCandidate>(), QualityNotWanted);
            unknownQuality.RemoteMovie.Release.Guid = "guid-2";
            Capture(unknownQuality);

            Subject.Handle(new CommandExecutedEvent(new CommandModel()));
            Subject.Handle(new CommandExecutedEvent(new CommandModel()));

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.Is<ReviewNeededEvent>(e => e.Items.Count == 2)), Times.Once());
        }

        [Test]
        public void should_not_announce_when_nothing_was_captured()
        {
            Subject.Handle(new CommandExecutedEvent(new CommandModel()));

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<ReviewNeededEvent>()), Times.Never());
        }

        [Test]
        public async Task should_grab_approved_release_for_chosen_scene_and_quality()
        {
            var decision = GivenDecision(Quality.Unknown,
                ReleaseSourceType.Rss,
                new[] { new SceneMatchCandidate(_scene, MovieParseMatchType.Title), new SceneMatchCandidate(_otherScene, MovieParseMatchType.Title) },
                new DownloadRejection(DownloadRejectionReason.NeedsReview, "Needs review"));

            var item = Capture(decision).Single();

            await Subject.Approve(item.Id, _otherScene.Id, Quality.WEBDL1080p);

            Mocker.GetMock<IDownloadService>()
                  .Verify(v => v.DownloadReport(It.Is<RemoteMovie>(r => r.Movie == _otherScene &&
                                                                        r.ParsedMovieInfo.Quality.Quality == Quality.WEBDL1080p &&
                                                                        r.Release.Guid == "guid-1"),
                                                null),
                          Times.Once());

            item.Status.Should().Be(ReviewItemStatus.Approved);
            item.MovieId.Should().Be(_otherScene.Id);
            Mocker.GetMock<IReviewItemRepository>().Verify(v => v.Update(item), Times.Once());
        }

        [Test]
        public async Task should_grab_approved_release_with_parsed_quality_without_override()
        {
            var item = Capture(GivenWeakMatch()).Single();

            await Subject.Approve(item.Id);

            Mocker.GetMock<IDownloadService>()
                  .Verify(v => v.DownloadReport(It.Is<RemoteMovie>(r => r.Movie == _scene && r.ParsedMovieInfo.Quality.Quality == Quality.WEBDL720p), null), Times.Once());
        }

        [Test]
        public async Task should_grab_torrent_as_torrent()
        {
            var decision = GivenWeakMatch();
            decision.RemoteMovie.Release = GivenRelease(protocol: DownloadProtocol.Torrent);

            var item = Capture(decision).Single();

            item.Release = new ReleaseInfo { Guid = "guid-1", Title = item.Title, DownloadProtocol = DownloadProtocol.Torrent };

            await Subject.Approve(item.Id);

            Mocker.GetMock<IDownloadService>()
                  .Verify(v => v.DownloadReport(It.Is<RemoteMovie>(r => r.Release is TorrentInfo && ((TorrentInfo)r.Release).InfoHash == "ABCDEF"), null), Times.Once());
        }

        [Test]
        public async Task should_refuse_to_approve_when_scene_already_has_a_file()
        {
            var item = Capture(GivenWeakMatch()).Single();
            _scene.MovieFileId = 9;

            Func<Task> approve = () => Subject.Approve(item.Id);

            (await approve.Should().ThrowAsync<NzbDroneClientException>()).Which.Message.Should().Contain("already has a file");

            Mocker.GetMock<IDownloadService>().Verify(v => v.DownloadReport(It.IsAny<RemoteMovie>(), It.IsAny<int?>()), Times.Never());
            item.Status.Should().Be(ReviewItemStatus.Pending);
        }

        [Test]
        public async Task should_refuse_to_approve_when_scene_is_already_queued()
        {
            var item = Capture(GivenWeakMatch()).Single();

            Mocker.GetMock<Queue.IQueueService>()
                  .Setup(s => s.GetQueue())
                  .Returns(new List<Queue.Queue> { new () { Movie = _scene } });

            Func<Task> approve = () => Subject.Approve(item.Id);

            (await approve.Should().ThrowAsync<NzbDroneClientException>()).Which.Message.Should().Contain("download queue");

            Mocker.GetMock<IDownloadService>().Verify(v => v.DownloadReport(It.IsAny<RemoteMovie>(), It.IsAny<int?>()), Times.Never());
        }

        [Test]
        public async Task should_refuse_to_approve_for_a_scene_that_is_not_a_candidate()
        {
            var item = Capture(GivenWeakMatch()).Single();

            Func<Task> approve = () => Subject.Approve(item.Id, 99);

            (await approve.Should().ThrowAsync<NzbDroneClientException>()).Which.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
        }

        [Test]
        public async Task should_refuse_to_approve_a_release_that_was_already_rejected()
        {
            var item = Capture(GivenWeakMatch()).Single();
            item.Status = ReviewItemStatus.Rejected;

            Func<Task> approve = () => Subject.Approve(item.Id);

            (await approve.Should().ThrowAsync<NzbDroneClientException>()).Which.StatusCode.Should().Be(System.Net.HttpStatusCode.Conflict);
        }

        [Test]
        public void should_blocklist_rejected_release_for_every_candidate()
        {
            var decision = GivenDecision(Quality.WEBDL720p,
                ReleaseSourceType.Rss,
                new[] { new SceneMatchCandidate(_scene, MovieParseMatchType.Title), new SceneMatchCandidate(_otherScene, MovieParseMatchType.Title) },
                new DownloadRejection(DownloadRejectionReason.NeedsReview, "Needs review"));

            var item = Capture(decision).Single();

            Subject.Reject(new List<int> { item.Id });

            Mocker.GetMock<IBlocklistService>().Verify(v => v.Block(It.Is<RemoteMovie>(r => r.Movie == _scene && r.Release.Title == item.Title), ReviewService.REJECTED_MESSAGE), Times.Once());
            Mocker.GetMock<IBlocklistService>().Verify(v => v.Block(It.Is<RemoteMovie>(r => r.Movie == _otherScene), ReviewService.REJECTED_MESSAGE), Times.Once());

            item.Status.Should().Be(ReviewItemStatus.Rejected);
            _stored.Should().ContainSingle("a rejected release is kept so it is never offered again");
        }

        [Test]
        public void should_not_reject_a_release_twice()
        {
            var item = Capture(GivenWeakMatch()).Single();
            item.Status = ReviewItemStatus.Approved;

            Subject.Reject(new List<int> { item.Id });

            Mocker.GetMock<IBlocklistService>().Verify(v => v.Block(It.IsAny<RemoteMovie>(), It.IsAny<string>()), Times.Never());
            item.Status.Should().Be(ReviewItemStatus.Approved);
        }

        [Test]
        public void should_drop_pending_item_when_its_scene_gets_a_file()
        {
            Capture(GivenWeakMatch());

            Subject.Handle(new MovieFileImportedEvent(new LocalMovie { Movie = _scene }, null, null, true, null));

            _stored.Should().BeEmpty();
        }

        [Test]
        public void should_drop_pending_item_when_its_scene_is_unmonitored()
        {
            Capture(GivenWeakMatch());

            Subject.Handle(new MovieEditedEvent(new Movie { Id = _scene.Id, Monitored = false }, _scene));

            _stored.Should().BeEmpty();
        }

        [Test]
        public void should_drop_pending_item_when_its_scene_is_deleted()
        {
            Capture(GivenWeakMatch());

            Subject.Handle(new MoviesDeletedEvent(new List<Movie> { _scene }, false, false));

            _stored.Should().BeEmpty();
        }

        [Test]
        public void should_keep_item_when_monitored_scene_is_edited()
        {
            Capture(GivenWeakMatch());

            Subject.Handle(new MovieEditedEvent(_scene, _scene));

            _stored.Should().ContainSingle();
        }

        [Test]
        public void should_keep_ambiguous_item_for_the_remaining_candidate()
        {
            var decision = GivenDecision(Quality.WEBDL720p,
                ReleaseSourceType.Rss,
                new[] { new SceneMatchCandidate(_scene, MovieParseMatchType.Title), new SceneMatchCandidate(_otherScene, MovieParseMatchType.Title) },
                new DownloadRejection(DownloadRejectionReason.NeedsReview, "Needs review"));

            var item = Capture(decision).Single();

            Subject.Handle(new MoviesBulkEditedEvent(new List<Movie> { new () { Id = _scene.Id, Monitored = false } }));

            item.CandidateMovieIds.Should().Equal(_otherScene.Id);
            item.MovieId.Should().Be(_otherScene.Id);
            item.Reason.Should().Be(ReviewReason.WeakMatch);
            Mocker.GetMock<IReviewItemRepository>().Verify(v => v.UpdateMany(It.Is<IList<ReviewItem>>(l => l.Contains(item))), Times.Once());
        }
    }
}
