using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Review;
using Whisparr.Http;

namespace NzbDrone.Api.Test.v3.Review
{
    [TestFixture]
    public class ReviewControllerFixture : TestBase<ReviewController>
    {
        private Movie _scene;
        private Movie _otherScene;

        [SetUp]
        public void Setup()
        {
            _scene = new Movie { Id = 4, Title = "Poolside", Monitored = true };
            _scene.MovieMetadata.Value.StudioTitle = "Helix Studios";
            _scene.MovieMetadata.Value.ReleaseDate = "2021-08-04";
            _scene.MovieMetadata.Value.ForeignId = "scene-4";

            _otherScene = new Movie { Id = 5, Title = "Locker Room", MovieFileId = 3 };

            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.FindByIds(It.IsAny<List<int>>()))
                  .Returns(new List<Movie> { _scene, _otherScene });
        }

        private static ReviewItem GivenItem(int id, int movieId, params int[] otherCandidates)
        {
            var candidates = new List<ReviewItemCandidate> { new () { MovieId = movieId, MatchType = MovieParseMatchType.PerformersNotTitle } };
            candidates.AddRange(Array.ConvertAll(otherCandidates, c => new ReviewItemCandidate { MovieId = c, MatchType = MovieParseMatchType.Title }));

            return new ReviewItem
            {
                Id = id,
                MovieId = movieId,
                Candidates = candidates,
                Title = "Release " + id,
                Release = new ReleaseInfo { InfoUrl = "https://indexer/details/" + id, PublishDate = DateTime.UtcNow },
                Quality = new QualityModel(Quality.Unknown),
                Reason = ReviewReason.AmbiguousMatch | ReviewReason.UnknownQuality,
                Added = DateTime.UtcNow
            };
        }

        [Test]
        public void should_page_pending_items_with_their_candidate_scenes()
        {
            PagingSpec<ReviewItem> requested = null;

            Mocker.GetMock<IReviewService>()
                  .Setup(s => s.Paged(It.IsAny<PagingSpec<ReviewItem>>()))
                  .Returns<PagingSpec<ReviewItem>>(spec =>
                  {
                      requested = spec;
                      spec.Records = new List<ReviewItem> { GivenItem(1, 4, 5) };
                      spec.TotalRecords = 1;
                      return spec;
                  });

            var result = Subject.GetReview(new PagingRequestResource { Page = 1, PageSize = 10, SortKey = "bogus" });

            requested.SortKey.Should().Be("added");
            requested.FilterExpressions.Should().ContainSingle();

            result.TotalRecords.Should().Be(1);

            var resource = result.Records.Should().ContainSingle().Subject;
            resource.InfoUrl.Should().Be("https://indexer/details/1");
            resource.Reasons.Should().BeEquivalentTo(new[] { ReviewReason.AmbiguousMatch, ReviewReason.UnknownQuality });
            resource.Candidates.Should().HaveCount(2);
            resource.Candidates[0].StudioTitle.Should().Be("Helix Studios");
            resource.Candidates[0].ReleaseDate.Should().Be("2021-08-04");
            resource.Candidates[0].TitleSlug.Should().Be("scene-4");
            resource.Candidates[0].MatchType.Should().Be(MovieParseMatchType.PerformersNotTitle);
            resource.Candidates[1].HasFile.Should().BeTrue();
        }

        [Test]
        public void should_return_pending_count()
        {
            Mocker.GetMock<IReviewService>().Setup(s => s.PendingCount()).Returns(3);

            Subject.GetStatus().Count.Should().Be(3);
        }

        [TestCase(null, "WEBDL-1080p")]
        [TestCase(3, null)]
        public async Task should_approve_with_quality_override(int? qualityId, string quality)
        {
            var result = await Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1 }, MovieId = 5, QualityId = qualityId, Quality = quality });

            result.Approved.Should().Equal(1);
            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(1, 5, Quality.WEBDL1080p), Times.Once());
        }

        [Test]
        public async Task should_reject_unknown_quality()
        {
            Func<Task> approve = () => Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1 }, Quality = "Potato-9000p" });

            await approve.Should().ThrowAsync<Whisparr.Http.REST.BadRequestException>();
        }

        [Test]
        public async Task should_reject_scene_choice_for_more_than_one_release()
        {
            Func<Task> approve = () => Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1, 2 }, MovieId = 5 });

            await approve.Should().ThrowAsync<Whisparr.Http.REST.BadRequestException>();
        }

        [Test]
        public async Task should_report_why_a_single_release_could_not_be_grabbed()
        {
            Mocker.GetMock<IReviewService>()
                  .Setup(s => s.Approve(1, null, null))
                  .ThrowsAsync(new NzbDroneClientException(HttpStatusCode.Conflict, "'Poolside' already has a file"));

            Func<Task> approve = () => Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1 } });

            (await approve.Should().ThrowAsync<NzbDroneClientException>()).Which.Message.Should().Contain("already has a file");
        }

        [Test]
        public async Task should_carry_on_and_list_failures_when_approving_several_releases()
        {
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(1)).Returns(GivenItem(1, 4));
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(2)).Returns(GivenItem(2, 5));
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(3)).Returns(GivenItem(3, 4));

            Mocker.GetMock<IReviewService>()
                  .Setup(s => s.Approve(2, null, null))
                  .ThrowsAsync(new NzbDroneClientException(HttpStatusCode.Conflict, "'Locker Room' already has a file"));

            var result = await Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1, 2, 3 } });

            result.Approved.Should().Equal(1);
            result.Failed.Should().HaveCount(2);
            result.Failed[0].Id.Should().Be(2);
            result.Failed[0].Message.Should().Contain("already has a file");
            result.Failed[1].Id.Should().Be(3);

            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(3, It.IsAny<int?>(), It.IsAny<Quality>()), Times.Never());
        }

        [Test]
        public void should_reject_and_remove_given_ids()
        {
            Subject.Reject(new ReviewBulkResource { Ids = new List<int> { 1, 2 } });
            Subject.Remove(new ReviewBulkResource { Ids = new List<int> { 3 } });
            Subject.DeleteReviewItem(4);

            Mocker.GetMock<IReviewService>().Verify(v => v.Reject(It.Is<List<int>>(l => l.Count == 2)), Times.Once());
            Mocker.GetMock<IReviewService>().Verify(v => v.Delete(It.Is<List<int>>(l => l.Contains(3))), Times.Once());
            Mocker.GetMock<IReviewService>().Verify(v => v.Delete(4), Times.Once());
        }
    }
}
