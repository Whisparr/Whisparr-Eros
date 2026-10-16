using System.IO;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Backup;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.Backup
{
    [TestFixture]
    public class BackupServiceFixture : CoreTest<BackupService>
    {
        private readonly string _appData = @"C:\Whisparr".AsOsAgnostic();
        private readonly string _temp = @"C:\Temp".AsOsAgnostic();

        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<IAppFolderInfo>().SetupGet(s => s.AppDataFolder).Returns(_appData);
            Mocker.GetMock<IAppFolderInfo>().SetupGet(s => s.TempFolder).Returns(_temp);
        }

        [TestCase("whisparr3.db")]
        [TestCase("whisparr.db")]
        [TestCase("nzbdrone.db")]
        public void should_restore_database_from_backup_zip(string databaseFileName)
        {
            var extracted = Path.Combine(_temp, "whisparr_backup_restore", databaseFileName);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetFiles(Path.Combine(_temp, "whisparr_backup_restore"), false))
                  .Returns(new[] { extracted });

            Subject.Restore("backup.zip");

            Mocker.GetMock<IDiskProvider>()
                  .Verify(s => s.MoveFile(extracted, Path.Combine(_appData, "whisparr3.restore"), true), Times.Once());
        }

        [Test]
        public void should_delete_current_database_journal_when_creating_backup()
        {
            Mocker.GetMock<IDiskProvider>().Setup(s => s.FolderWritable(It.IsAny<string>())).Returns(true);
            Mocker.GetMock<IMainDatabase>().SetupGet(s => s.DatabaseType).Returns(DatabaseType.SQLite);
            Mocker.GetMock<IConfigService>().SetupGet(s => s.BackupFolder).Returns("Backups");

            Subject.Backup(BackupType.Manual);

            Mocker.GetMock<IDiskProvider>()
                  .Verify(s => s.DeleteFile(Path.Combine(_temp, "whisparr_backup", "whisparr3.db-journal")), Times.Once());
        }
    }
}
