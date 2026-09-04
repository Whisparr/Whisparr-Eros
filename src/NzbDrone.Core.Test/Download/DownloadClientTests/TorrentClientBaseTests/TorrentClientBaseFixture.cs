using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Core.Blocklisting;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.MediaFiles.TorrentInfo;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.Download.DownloadClientTests.TorrentClientBaseTests
{
    [TestFixture]
    public class TorrentClientBaseFixture : DownloadClientFixtureBase<TestTorrentClient>
    {
        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<ITorrentFileInfoReader>()
                  .Setup(s => s.GetHashFromTorrentFile(It.IsAny<byte[]>()))
                  .Returns("HASH");

            // The base fixture only stubs the default-token overload; RetryStrategy passes one through.
            Mocker.GetMock<IHttpClient>()
                  .Setup(s => s.GetAsync(It.IsAny<HttpRequest>(), It.IsAny<CancellationToken>()))
                  .Returns<HttpRequest, CancellationToken>((r, _) =>
                      Task.FromResult(new HttpResponse(r, new HttpHeader(), System.Array.Empty<byte>())));

            InitLogging();
        }

        private IIndexer CreateIndexerWithFailDownloads(params FailDownloads[] failDownloads)
        {
            var indexer = CreateIndexer();

            indexer.Definition = new IndexerDefinition
            {
                Settings = new TestTorrentIndexerSettings
                {
                    RejectTorrentFilesWithBlockedExtensionsWhileGrabbing = true,
                    FailDownloads = failDownloads.Cast<int>().ToList()
                }
            };

            return indexer;
        }

        private void GivenTorrentFiles(params string[] fileNames)
        {
            Mocker.GetMock<ITorrentFileInfoReader>()
                  .Setup(s => s.GetFileNamesFromTorrentFile(It.IsAny<byte[]>()))
                  .Returns(new List<string>(fileNames));
        }

        [Test]
        public void should_blocklist_and_throw_when_torrent_contains_dangerous_file()
        {
            var remoteMovie = CreateRemoteMovie();
            var indexer = CreateIndexerWithFailDownloads(FailDownloads.Executables, FailDownloads.PotentiallyDangerous);

            GivenTorrentFiles("Droned.1998.1080p.WEB-DL-DRONE.lnk");

            Assert.ThrowsAsync<ReleaseBlockedException>(async () => await Subject.Download(remoteMovie, indexer));

            Mocker.GetMock<IBlocklistService>()
                  .Verify(s => s.Block(remoteMovie, It.IsAny<string>()), Times.Once());

            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_blocklist_and_throw_when_torrent_contains_executable_when_preferring_torrent_files()
        {
            Subject.SetPreferTorrentFile(true);

            var remoteMovie = CreateRemoteMovie();
            var indexer = CreateIndexerWithFailDownloads(FailDownloads.Executables);

            GivenTorrentFiles("Droned.1998.1080p.WEB-DL-DRONE.exe");

            Assert.ThrowsAsync<ReleaseBlockedException>(async () => await Subject.Download(remoteMovie, indexer));

            Mocker.GetMock<IBlocklistService>()
                  .Verify(s => s.Block(remoteMovie, It.IsAny<string>()), Times.Once());

            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_include_every_rejection_group_in_the_blocklist_message()
        {
            var remoteMovie = CreateRemoteMovie();
            var indexer = CreateIndexerWithFailDownloads(FailDownloads.Executables, FailDownloads.PotentiallyDangerous);

            GivenTorrentFiles(
                "Droned.1998.1080p.WEB-DL-DRONE.mkv",
                "setup.exe",
                "payload.lnk");

            Assert.ThrowsAsync<ReleaseBlockedException>(async () => await Subject.Download(remoteMovie, indexer));

            Mocker.GetMock<IBlocklistService>()
                  .Verify(
                      s => s.Block(
                          remoteMovie,
                          It.Is<string>(msg =>
                              msg.Contains("potentially dangerous") &&
                              msg.Contains(".lnk") &&
                              msg.Contains("executables") &&
                              msg.Contains(".exe"))),
                      Times.Once());

            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_only_report_the_extension_groups_that_are_selected()
        {
            var remoteMovie = CreateRemoteMovie();
            var indexer = CreateIndexerWithFailDownloads(FailDownloads.Executables);

            GivenTorrentFiles("setup.exe", "payload.lnk");

            Assert.ThrowsAsync<ReleaseBlockedException>(async () => await Subject.Download(remoteMovie, indexer));

            Mocker.GetMock<IBlocklistService>()
                  .Verify(
                      s => s.Block(remoteMovie, It.Is<string>(msg => !msg.Contains(".lnk"))),
                      Times.Once());

            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_match_extensions_case_insensitively()
        {
            var remoteMovie = CreateRemoteMovie();
            var indexer = CreateIndexerWithFailDownloads(FailDownloads.Executables);

            GivenTorrentFiles("Droned.1998.1080p.WEB-DL-DRONE.EXE");

            Assert.ThrowsAsync<ReleaseBlockedException>(async () => await Subject.Download(remoteMovie, indexer));

            Mocker.GetMock<IBlocklistService>()
                  .Verify(s => s.Block(remoteMovie, It.IsAny<string>()), Times.Once());

            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public async Task should_not_blocklist_when_torrent_contains_only_safe_files()
        {
            var remoteMovie = CreateRemoteMovie();
            var indexer = CreateIndexerWithFailDownloads(FailDownloads.Executables, FailDownloads.PotentiallyDangerous);

            GivenTorrentFiles("Droned.1998.1080p.WEB-DL-DRONE.mkv", "Sample/sample.mkv");

            await Subject.Download(remoteMovie, indexer);

            Mocker.GetMock<IBlocklistService>()
                  .Verify(s => s.Block(It.IsAny<RemoteMovie>(), It.IsAny<string>()), Times.Never());
        }

        [Test]
        public async Task should_not_check_torrent_files_when_downloading_magnet_link()
        {
            var remoteMovie = CreateRemoteMovie();
            remoteMovie.Release.DownloadUrl = "magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a";

            await Subject.Download(remoteMovie, CreateIndexerWithFailDownloads(FailDownloads.Executables));

            Mocker.GetMock<ITorrentFileInfoReader>()
                  .Verify(s => s.GetFileNamesFromTorrentFile(It.IsAny<byte[]>()), Times.Never());
            Mocker.GetMock<IBlocklistService>()
                  .Verify(s => s.Block(It.IsAny<RemoteMovie>(), It.IsAny<string>()), Times.Never());
        }

        [Test]
        public async Task should_not_check_torrent_files_when_fail_downloads_is_empty()
        {
            var remoteMovie = CreateRemoteMovie();
            var indexer = CreateIndexerWithFailDownloads();

            await Subject.Download(remoteMovie, indexer);

            Mocker.GetMock<ITorrentFileInfoReader>()
                  .Verify(s => s.GetFileNamesFromTorrentFile(It.IsAny<byte[]>()), Times.Never());
        }

        [Test]
        public async Task should_not_check_torrent_files_when_reject_setting_is_disabled()
        {
            var remoteMovie = CreateRemoteMovie();
            var indexer = CreateIndexer();

            indexer.Definition = new IndexerDefinition
            {
                Settings = new TestTorrentIndexerSettings
                {
                    RejectTorrentFilesWithBlockedExtensionsWhileGrabbing = false,
                    FailDownloads = new List<int> { (int)FailDownloads.Executables }
                }
            };

            await Subject.Download(remoteMovie, indexer);

            Mocker.GetMock<ITorrentFileInfoReader>()
                  .Verify(s => s.GetFileNamesFromTorrentFile(It.IsAny<byte[]>()), Times.Never());
        }

        [Test]
        public async Task should_grab_the_release_when_the_torrent_file_list_cannot_be_parsed()
        {
            var remoteMovie = CreateRemoteMovie();
            var indexer = CreateIndexerWithFailDownloads(FailDownloads.Executables);

            Mocker.GetMock<ITorrentFileInfoReader>()
                  .Setup(s => s.GetFileNamesFromTorrentFile(It.IsAny<byte[]>()))
                  .Throws(new MonoTorrent.TorrentException("Invalid torrent"));

            await Subject.Download(remoteMovie, indexer);

            Mocker.GetMock<IBlocklistService>()
                  .Verify(s => s.Block(It.IsAny<RemoteMovie>(), It.IsAny<string>()), Times.Never());

            ExceptionVerification.ExpectedWarns(1);
        }
    }
}
