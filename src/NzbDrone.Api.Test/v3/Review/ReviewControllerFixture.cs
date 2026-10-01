using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Credits;
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
            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(1, 5, Quality.WEBDL1080p, false, null), Times.Once());
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
                  .Setup(s => s.Approve(1, null, null, false, null))
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
                  .Setup(s => s.Approve(2, null, null, false, null))
                  .ThrowsAsync(new NzbDroneClientException(HttpStatusCode.Conflict, "'Locker Room' already has a file"));

            var result = await Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1, 2, 3 } });

            result.Approved.Should().Equal(1);
            result.Failed.Should().HaveCount(2);
            result.Failed[0].Id.Should().Be(2);
            result.Failed[0].Message.Should().Contain("already has a file");
            result.Failed[1].Id.Should().Be(3);

            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(3, It.IsAny<int?>(), It.IsAny<Quality>(), It.IsAny<bool>(), It.IsAny<string>()), Times.Never());
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

        [Test]
        public async Task should_pass_manual_match_for_a_single_release()
        {
            var result = await Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1 }, MovieId = 7, ManualMatch = true });

            result.Approved.Should().Equal(1);
            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(1, 7, null, true, null), Times.Once());
        }

        [Test]
        public async Task should_report_why_a_scene_that_is_not_a_candidate_was_refused()
        {
            Mocker.GetMock<IReviewService>()
                  .Setup(s => s.Approve(1, 7, null, false, null))
                  .ThrowsAsync(new NzbDroneClientException(HttpStatusCode.BadRequest, "Scene 7 is not a candidate for 'Release 1'"));

            Func<Task> approve = () => Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1 }, MovieId = 7 });

            (await approve.Should().ThrowAsync<NzbDroneClientException>()).Which.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Test]
        public async Task should_require_a_scene_for_manual_match()
        {
            Func<Task> approve = () => Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1 }, ManualMatch = true });
            Func<Task> approveItems = () => Subject.Approve(new ReviewApproveResource { Items = new List<ReviewApproveItemResource> { new () { Id = 1, ManualMatch = true }, new () { Id = 2 } } });

            await approve.Should().ThrowAsync<Whisparr.Http.REST.BadRequestException>();
            await approveItems.Should().ThrowAsync<Whisparr.Http.REST.BadRequestException>();

            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(It.IsAny<int>(), It.IsAny<int?>(), It.IsAny<Quality>(), It.IsAny<bool>(), It.IsAny<string>()), Times.Never());
        }

        [Test]
        public async Task should_require_ids_or_items()
        {
            Func<Task> approve = () => Subject.Approve(new ReviewApproveResource());

            await approve.Should().ThrowAsync<Whisparr.Http.REST.BadRequestException>();
        }

        [Test]
        public async Task should_approve_each_item_with_its_own_scene_and_quality()
        {
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(1)).Returns(GivenItem(1, 4));
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(2)).Returns(GivenItem(2, 4, 5));
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(3)).Returns(GivenItem(3, 6));
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(4)).Returns(GivenItem(4, 8));

            var result = await Subject.Approve(new ReviewApproveResource
            {
                Ids = new List<int> { 3, 1 },
                Quality = "WEBDL-1080p",
                Items = new List<ReviewApproveItemResource>
                {
                    new () { Id = 1, MovieId = 7, ManualMatch = true },
                    new () { Id = 2, MovieId = 5, QualityId = (int)Quality.HDTV720p.Id },
                    new () { Id = 4, MovieId = 7, ManualMatch = true }
                }
            });

            result.Approved.Should().Equal(1, 2, 3);
            result.Failed.Should().ContainSingle().Which.Id.Should().Be(4);

            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(1, 7, Quality.WEBDL1080p, true, null), Times.Once());
            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(2, 5, Quality.HDTV720p, false, null), Times.Once());
            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(3, null, Quality.WEBDL1080p, false, null), Times.Once());
            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(4, It.IsAny<int?>(), It.IsAny<Quality>(), It.IsAny<bool>(), It.IsAny<string>()), Times.Never());
            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(1, It.IsAny<int?>(), It.IsAny<Quality>(), It.IsAny<bool>(), It.IsAny<string>()), Times.Once());
        }

        [Test]
        public async Task should_approve_a_single_item_by_itself()
        {
            Mocker.GetMock<IReviewService>()
                  .Setup(s => s.Approve(1, 7, null, true, null))
                  .ThrowsAsync(new NzbDroneClientException(HttpStatusCode.Conflict, "'Bareback' already has a file"));

            Func<Task> approve = () => Subject.Approve(new ReviewApproveResource { Items = new List<ReviewApproveItemResource> { new () { Id = 1, MovieId = 7, ManualMatch = true } } });

            (await approve.Should().ThrowAsync<NzbDroneClientException>()).Which.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }

        [Test]
        public void should_list_scenes_to_choose_from_with_their_performers()
        {
            var scene = new Movie { Id = 7, Title = "Gay Latino Bareback Porn", Monitored = true };
            scene.MovieMetadata.Value.StudioTitle = "LatinBoyz";
            scene.MovieMetadata.Value.ReleaseDate = "2020-05-01";
            scene.MovieMetadata.Value.ForeignId = "scene-7";
            scene.MovieMetadata.Value.PerformerNames = new List<string> { "Alexander", "Gato" };

            Mocker.GetMock<IReviewService>()
                  .Setup(s => s.FindScenes(1, "gato", false, 500))
                  .Returns(new List<Movie> { scene });

            var result = Subject.GetScenes(1, "gato", false, 10000);

            var resource = result.Should().ContainSingle().Subject;
            resource.MovieId.Should().Be(7);
            resource.Title.Should().Be("Gay Latino Bareback Porn");
            resource.StudioTitle.Should().Be("LatinBoyz");
            resource.ReleaseDate.Should().Be("2020-05-01");
            resource.TitleSlug.Should().Be("scene-7");
            resource.PerformerNames.Should().Equal("Alexander", "Gato");
            resource.Manual.Should().BeFalse();
        }

        [Test]
        public void should_mark_a_manually_matched_item()
        {
            var item = GivenItem(1, 4);
            item.Candidates.Add(new ReviewItemCandidate { MovieId = 5, Manual = true });
            item.MovieId = 5;

            Mocker.GetMock<IReviewService>().Setup(s => s.Get(1)).Returns(item);

            var resource = Subject.GetResourceByIdWithErrorHandler(1).Value;

            resource.ManualMatch.Should().BeTrue();
            resource.Candidates.Should().ContainSingle(c => c.Manual).Which.MovieId.Should().Be(5);
        }

        [Test]
        public async Task should_pass_a_foreign_id_for_a_scene_that_is_not_in_the_library()
        {
            var result = await Subject.Approve(new ReviewApproveResource { Ids = new List<int> { 1 }, ForeignId = "stash-bareback", ManualMatch = true });

            result.Approved.Should().Equal(1);
            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(1, null, null, true, "stash-bareback"), Times.Once());
        }

        [Test]
        public async Task should_not_grab_two_releases_for_the_same_scene_from_the_metadata_source()
        {
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(1)).Returns(GivenItem(1, 4));
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(2)).Returns(GivenItem(2, 4));
            Mocker.GetMock<IReviewService>().Setup(s => s.Get(3)).Returns(GivenItem(3, 4));

            Mocker.GetMock<IReviewService>()
                  .Setup(s => s.Approve(1, null, null, true, "stash-bareback"))
                  .ReturnsAsync(42);

            var result = await Subject.Approve(new ReviewApproveResource
            {
                Items = new List<ReviewApproveItemResource>
                {
                    new () { Id = 1, ForeignId = "stash-bareback", ManualMatch = true },
                    new () { Id = 2, ForeignId = "stash-bareback", ManualMatch = true },
                    new () { Id = 3, MovieId = 42, ManualMatch = true }
                }
            });

            result.Approved.Should().Equal(1);
            result.Failed.Select(f => f.Id).Should().Equal(2, 3);
            Mocker.GetMock<IReviewService>().Verify(v => v.Approve(It.IsAny<int>(), It.IsAny<int?>(), It.IsAny<Quality>(), It.IsAny<bool>(), It.IsAny<string>()), Times.Once());
        }

        [Test]
        public void should_list_scenes_from_the_metadata_source()
        {
            var scene = new Movie { Title = "Gay Latino Bareback Porn" };
            scene.MovieMetadata.Value.ForeignId = "stash-bareback";
            scene.MovieMetadata.Value.StudioTitle = "LatinBoyz";
            scene.MovieMetadata.Value.Credits = new List<Credit>
            {
                new () { PersonName = "Alexander" },
                new () { Performer = new CreditPerformer { Name = "Gato" } }
            };

            Mocker.GetMock<IReviewService>()
                  .Setup(s => s.LookupScenes(1, null))
                  .Returns(new List<Movie> { scene, _scene });

            var result = Subject.LookupScenes(1, null);

            result.Should().HaveCount(2);
            result[0].MovieId.Should().Be(0);
            result[0].InLibrary.Should().BeFalse();
            result[0].ForeignId.Should().Be("stash-bareback");
            result[0].TitleSlug.Should().BeNull();
            result[0].PerformerNames.Should().Equal("Alexander", "Gato");
            result[1].InLibrary.Should().BeTrue();
            result[1].MovieId.Should().Be(4);
            result[1].TitleSlug.Should().Be("scene-4");
        }

        [Test]
        public void should_offer_a_lookup_term_for_each_item()
        {
            var item = GivenItem(1, 4);
            item.ParsedMovieInfo = new ParsedMovieInfo { StudioTitle = "LatinBoyz", ReleaseTokens = "Alexander & Gato" };

            Mocker.GetMock<IReviewService>().Setup(s => s.Get(1)).Returns(item);

            Subject.GetResourceByIdWithErrorHandler(1).Value.LookupTerm.Should().Be("LatinBoyz alexander gato");
        }
    }
}
