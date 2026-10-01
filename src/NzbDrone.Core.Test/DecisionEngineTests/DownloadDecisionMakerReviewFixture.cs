using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.DecisionEngineTests
{
    [TestFixture]
    public class DownloadDecisionMakerReviewFixture : CoreTest<DownloadDecisionMaker>
    {
        private List<ReleaseInfo> _reports;
        private RemoteMovie _remoteMovie;
        private Movie _candidate;
        private Mock<IDownloadDecisionEngineSpecification> _spec;

        [SetUp]
        public void Setup()
        {
            _candidate = new Movie { Id = 4, Title = "Poolside" };

            _reports = new List<ReleaseInfo> { new () { Title = "Helix Studios - Hot Afternoon - Dakota Lovell [720p]" } };

            _remoteMovie = new RemoteMovie
            {
                ParsedMovieInfo = new ParsedMovieInfo(),
                ReviewCandidates = new List<SceneMatchCandidate> { new (_candidate, MovieParseMatchType.PerformersNotTitle) }
            };

            _spec = new Mock<IDownloadDecisionEngineSpecification>();
            _spec.Setup(s => s.IsSatisfiedBy(It.IsAny<RemoteMovie>(), It.IsAny<SearchCriteriaBase>())).Returns(DownloadSpecDecision.Accept);

            Mocker.SetConstant<IEnumerable<IDownloadDecisionEngineSpecification>>(new[] { _spec.Object });

            Mocker.GetMock<IParsingService>()
                  .Setup(c => c.Map(It.IsAny<ParsedMovieInfo>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<SearchCriteriaBase>()))
                  .Returns(_remoteMovie);
        }

        [Test]
        public void should_reject_weak_match_as_needing_review_and_evaluate_it_against_the_candidate()
        {
            var decision = Subject.GetRssDecision(_reports).Single();

            decision.Rejected.Should().BeTrue();
            decision.Rejections.Should().ContainSingle(r => r.Reason == DownloadRejectionReason.NeedsReview);
            decision.RemoteMovie.Movie.Should().BeSameAs(_candidate);

            _spec.Verify(s => s.IsSatisfiedBy(It.Is<RemoteMovie>(r => r.Movie == _candidate), null), Times.Once());
        }

        [Test]
        public void should_keep_spec_rejections_next_to_needs_review()
        {
            _spec.Setup(s => s.IsSatisfiedBy(It.IsAny<RemoteMovie>(), It.IsAny<SearchCriteriaBase>()))
                 .Returns(DownloadSpecDecision.Reject(DownloadRejectionReason.Blocklisted, "Release is blocklisted"));

            var decision = Subject.GetRssDecision(_reports).Single();

            decision.Rejections.Select(r => r.Reason).Should().BeEquivalentTo(new[] { DownloadRejectionReason.Blocklisted, DownloadRejectionReason.NeedsReview });
        }

        [Test]
        public void should_mention_candidate_count_for_ambiguous_match()
        {
            _remoteMovie.ReviewCandidates.Add(new SceneMatchCandidate(new Movie { Id = 5 }, MovieParseMatchType.Title));

            var decision = Subject.GetRssDecision(_reports).Single();

            decision.Rejections.Single(r => r.Reason == DownloadRejectionReason.NeedsReview).Message.Should().Contain("2 scenes");
        }

        [Test]
        public void should_reject_weak_match_as_needing_review_in_automatic_search()
        {
            var decision = Subject.GetSearchDecision(_reports, new MovieSearchCriteria { Movie = _candidate }).Single();

            decision.Rejections.Should().Contain(r => r.Reason == DownloadRejectionReason.NeedsReview);
            decision.RemoteMovie.Movie.Should().BeSameAs(_candidate);
        }

        [Test]
        public void should_keep_unknown_movie_rejection_for_interactive_search()
        {
            var decision = Subject.GetSearchDecision(_reports, new MovieSearchCriteria { Movie = _candidate, InteractiveSearch = true }).Single();

            decision.Rejections.Should().ContainSingle(r => r.Reason == DownloadRejectionReason.UnknownMovie);
            decision.RemoteMovie.Movie.Should().BeNull();
        }

        [Test]
        public void should_keep_unknown_movie_rejection_for_pushed_release()
        {
            var decision = Subject.GetRssDecision(_reports, true).Single();

            decision.Rejections.Should().ContainSingle(r => r.Reason == DownloadRejectionReason.UnknownMovie);
            decision.RemoteMovie.Movie.Should().BeNull();
        }

        [Test]
        public void should_keep_unknown_movie_rejection_without_candidates()
        {
            _remoteMovie.ReviewCandidates.Clear();

            var decision = Subject.GetRssDecision(_reports).Single();

            decision.Rejections.Should().ContainSingle(r => r.Reason == DownloadRejectionReason.UnknownMovie);
            _spec.Verify(s => s.IsSatisfiedBy(It.IsAny<RemoteMovie>(), It.IsAny<SearchCriteriaBase>()), Times.Never());
        }
    }
}
