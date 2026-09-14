using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.History;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.IndexerSearch;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Indexers;

namespace NzbDrone.Api.Test.v3.Indexers
{
    [TestFixture]
    public class ReleaseControllerFixture : TestBase<ReleaseController>
    {
        private const int MovieId = 7;
        private static readonly DateTime GrabDate = new (2026, 9, 13, 18, 30, 0, DateTimeKind.Utc);

        private List<MovieHistory> _history;
        private List<DownloadDecision> _decisions;

        [SetUp]
        public void Setup()
        {
            _history = new List<MovieHistory>();
            _decisions = new List<DownloadDecision>();

            Mocker.GetMock<IQualityProfileService>()
                .Setup(s => s.GetDefaultProfile(It.IsAny<string>(), It.IsAny<Quality>(), It.IsAny<Quality[]>()))
                .Returns(new QualityProfile
                {
                    Items = new List<QualityProfileQualityItem>
                    {
                        new () { Quality = Quality.WEBDL1080p, Allowed = true }
                    }
                });

            Mocker.GetMock<ICacheManager>()
                .Setup(s => s.GetCache<RemoteMovie>(It.IsAny<Type>(), It.IsAny<string>()))
                .Returns(new Mock<ICached<RemoteMovie>>().Object);

            Mocker.GetMock<ISearchForReleases>()
                .Setup(s => s.MovieSearch(MovieId, true, true))
                .ReturnsAsync(() => _decisions);

            Mocker.GetMock<IPrioritizeDownloadDecision>()
                .Setup(s => s.PrioritizeDecisionsForMovies(It.IsAny<List<DownloadDecision>>()))
                .Returns<List<DownloadDecision>>(d => d);

            Mocker.GetMock<IHistoryService>()
                .Setup(s => s.FindByMovieId(MovieId))
                .Returns(() => _history);
        }

        private void GivenUsenetRelease(string guid, string infoUrl = null)
        {
            var release = new ReleaseInfo
            {
                Guid = guid,
                Title = "Studio.26.09.13.Performer.Scene.1080p.WEB-DL",
                Indexer = "Indexer",
                InfoUrl = infoUrl,
                Size = 1000,
                PublishDate = new DateTime(2026, 9, 13, 12, 0, 0, DateTimeKind.Utc),
                DownloadProtocol = DownloadProtocol.Usenet
            };

            GivenDecision(release);
        }

        private void GivenTorrentRelease(string guid, string infoHash)
        {
            var release = new TorrentInfo
            {
                Guid = guid,
                Title = "Studio.26.09.13.Performer.Scene.1080p.WEB-DL",
                Indexer = "Indexer",
                InfoHash = infoHash,
                Size = 1000,
                PublishDate = new DateTime(2026, 9, 13, 12, 0, 0, DateTimeKind.Utc),
                DownloadProtocol = DownloadProtocol.Torrent
            };

            GivenDecision(release);
        }

        private void GivenDecision(ReleaseInfo release)
        {
            _decisions.Add(new DownloadDecision(new RemoteMovie
            {
                Release = release,
                ParsedMovieInfo = new ParsedMovieInfo
                {
                    Quality = new QualityModel(Quality.WEBDL1080p),
                    MovieTitles = new List<string> { "Scene" }
                },
                CustomFormats = new List<CustomFormat>(),
                Languages = new List<Language>()
            }));
        }

        private void GivenHistory(MovieHistoryEventType eventType, DateTime date, string downloadId, Dictionary<string, string> data)
        {
            var history = new MovieHistory
            {
                MovieId = MovieId,
                EventType = eventType,
                Date = date,
                DownloadId = downloadId,
                SourceTitle = "Studio.26.09.13.Performer.Scene.1080p.WEB-DL",
                Data = data
            };

            _history.Add(history);
        }

        private async Task<ReleaseResource> GetOnlyRelease()
        {
            var releases = await Subject.GetReleases(MovieId);

            return releases.Single();
        }

        [Test]
        public async Task should_mark_release_grabbed_when_history_guid_matches()
        {
            GivenUsenetRelease("guid-1");
            GivenHistory(MovieHistoryEventType.Grabbed, GrabDate, "dl-1", new Dictionary<string, string> { { "guid", "guid-1" } });

            var release = await GetOnlyRelease();

            release.History.Should().NotBeNull();
            release.History.Grabbed.Should().Be(GrabDate);
            release.History.Failed.Should().BeNull();
        }

        [Test]
        public async Task should_fall_back_to_info_url_when_guid_changed()
        {
            GivenUsenetRelease("guid-new", "https://indexer.example/details/123");
            GivenHistory(MovieHistoryEventType.Grabbed, GrabDate, "dl-1", new Dictionary<string, string>
            {
                { "guid", "guid-old" },
                { "nzbInfoUrl", "https://indexer.example/details/123" }
            });

            var release = await GetOnlyRelease();

            release.History.Should().NotBeNull();
            release.History.Grabbed.Should().Be(GrabDate);
        }

        [Test]
        public async Task should_not_match_on_an_empty_info_url()
        {
            GivenUsenetRelease("guid-new", string.Empty);
            GivenHistory(MovieHistoryEventType.Grabbed, GrabDate, "dl-1", new Dictionary<string, string>
            {
                { "guid", "guid-old" },
                { "nzbInfoUrl", string.Empty },
                { "indexer", "Indexer" }
            });

            var release = await GetOnlyRelease();

            release.History.Should().BeNull();
        }

        [Test]
        public async Task should_mark_release_failed_when_its_download_failed()
        {
            GivenUsenetRelease("guid-1");
            GivenHistory(MovieHistoryEventType.Grabbed, GrabDate, "dl-1", new Dictionary<string, string> { { "guid", "guid-1" } });
            GivenHistory(MovieHistoryEventType.DownloadFailed, GrabDate.AddHours(1), "dl-1", new Dictionary<string, string>());

            var release = await GetOnlyRelease();

            release.History.Grabbed.Should().Be(GrabDate);
            release.History.Failed.Should().Be(GrabDate.AddHours(1));
        }

        [Test]
        public async Task should_not_take_a_failure_from_another_download()
        {
            GivenUsenetRelease("guid-1");
            GivenHistory(MovieHistoryEventType.Grabbed, GrabDate, "dl-1", new Dictionary<string, string> { { "guid", "guid-1" } });
            GivenHistory(MovieHistoryEventType.DownloadFailed, GrabDate.AddHours(1), "dl-2", new Dictionary<string, string>());

            var release = await GetOnlyRelease();

            release.History.Failed.Should().BeNull();
        }

        [Test]
        public async Task should_leave_history_empty_when_nothing_was_grabbed()
        {
            GivenUsenetRelease("guid-1");
            GivenHistory(MovieHistoryEventType.DownloadFolderImported, GrabDate, "dl-1", new Dictionary<string, string> { { "guid", "guid-1" } });

            var release = await GetOnlyRelease();

            release.History.Should().BeNull();
        }

        [Test]
        public async Task should_match_torrent_without_hash_by_title_protocol_and_indexer()
        {
            GivenTorrentRelease("guid-new", null);
            GivenHistory(MovieHistoryEventType.Grabbed, GrabDate, "dl-1", new Dictionary<string, string>
            {
                { "guid", "guid-old" },
                { "indexer", "Indexer" },
                { "protocol", ((int)DownloadProtocol.Torrent).ToString() }
            });

            var release = await GetOnlyRelease();

            release.History.Should().NotBeNull();
            release.History.Grabbed.Should().Be(GrabDate);
        }

        [Test]
        public async Task should_not_match_torrent_without_hash_from_another_indexer()
        {
            GivenTorrentRelease("guid-new", null);
            GivenHistory(MovieHistoryEventType.Grabbed, GrabDate, "dl-1", new Dictionary<string, string>
            {
                { "guid", "guid-old" },
                { "indexer", "Other Indexer" },
                { "protocol", ((int)DownloadProtocol.Torrent).ToString() }
            });

            var release = await GetOnlyRelease();

            release.History.Should().BeNull();
        }

        [Test]
        public async Task should_not_attach_history_to_rss_releases()
        {
            Mocker.GetMock<IFetchAndParseRss>()
                .Setup(s => s.Fetch())
                .ReturnsAsync(new List<ReleaseInfo>());

            Mocker.GetMock<IMakeDownloadDecision>()
                .Setup(s => s.GetRssDecision(It.IsAny<List<ReleaseInfo>>(), It.IsAny<bool>()))
                .Returns(() => _decisions);

            GivenUsenetRelease("guid-1");

            var releases = await Subject.GetReleases(null);

            releases.Should().ContainSingle().Which.History.Should().BeNull();
            Mocker.GetMock<IHistoryService>().Verify(s => s.FindByMovieId(It.IsAny<int>()), Times.Never());
        }
    }
}
