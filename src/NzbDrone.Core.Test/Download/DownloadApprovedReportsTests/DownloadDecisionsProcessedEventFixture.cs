using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FizzWare.NBuilder;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.Download;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Download.DownloadApprovedReportsTests
{
    [TestFixture]
    public class DownloadDecisionsProcessedEventFixture : CoreTest<ProcessDownloadDecisions>
    {
        [SetUp]
        public void SetUp()
        {
            Mocker.GetMock<IPrioritizeDownloadDecision>()
                  .Setup(v => v.PrioritizeDecisionsForMovies(It.IsAny<List<DownloadDecision>>()))
                  .Returns<List<DownloadDecision>>(v => v);
        }

        private static RemoteMovie GetRemoteMovie(int movieId)
        {
            var movie = Builder<Movie>.CreateNew()
                                      .With(m => m.Id = movieId)
                                      .With(m => m.Tags = new HashSet<int>())
                                      .Build();

            movie.QualityProfile = new QualityProfile { Items = Qualities.QualityFixture.GetDefaultQualities() };

            return new RemoteMovie
            {
                ParsedMovieInfo = new ParsedMovieInfo
                {
                    Quality = new QualityModel(Quality.HDTV720p),
                    Year = 1998,
                    MovieTitles = new List<string> { "A Movie" },
                },
                Movie = movie,
                Release = new ReleaseInfo
                {
                    PublishDate = DateTime.UtcNow,
                    Title = "A.Movie.1998",
                    Size = 200,
                    DownloadProtocol = DownloadProtocol.Usenet
                }
            };
        }

        [Test]
        public async Task should_publish_the_processed_decisions()
        {
            var grabbed = new DownloadDecision(GetRemoteMovie(1));
            var rejected = new DownloadDecision(GetRemoteMovie(2), new DownloadRejection(DownloadRejectionReason.UnknownMovie, "Unknown Movie"));

            var result = await Subject.ProcessDecisions(new List<DownloadDecision> { grabbed, rejected });

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.Is<DownloadDecisionsProcessedEvent>(e => e.ProcessedDecisions == result &&
                                                                                          e.ProcessedDecisions.Grabbed.Contains(grabbed) &&
                                                                                          e.ProcessedDecisions.Rejected.Contains(rejected))),
                          Times.Once());
        }
    }
}
