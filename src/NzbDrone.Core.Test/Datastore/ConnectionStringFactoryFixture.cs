using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Exceptions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Datastore;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.Datastore
{
    [TestFixture]
    public class ConnectionStringFactoryFixture : TestBase
    {
        private Mock<IAppFolderInfo> _appFolderInfo;
        private Mock<IConfigFileProvider> _config;

        [SetUp]
        public void Setup()
        {
            _appFolderInfo = new Mock<IAppFolderInfo>();
            _appFolderInfo.Setup(v => v.AppDataFolder).Returns("app-data");

            _config = new Mock<IConfigFileProvider>();
            _config.Setup(v => v.PostgresHost).Returns(string.Empty);
            _config.Setup(v => v.PostgresUser).Returns("user");
            _config.Setup(v => v.PostgresPassword).Returns("password");
            _config.Setup(v => v.PostgresPort).Returns(5432);
            _config.Setup(v => v.PostgresMainDb).Returns("whisparr-main");
            _config.Setup(v => v.PostgresLogDb).Returns("whisparr-log");
            _config.Setup(v => v.PostgresMainDbConnectionString).Returns(string.Empty);
            _config.Setup(v => v.PostgresLogDbConnectionString).Returns(string.Empty);
            _config.Setup(v => v.LogDbEnabled).Returns(true);
        }

        private ConnectionStringFactory NewFactory()
        {
            return new ConnectionStringFactory(_appFolderInfo.Object, _config.Object);
        }

        [Test]
        public void should_use_sqlite_when_no_postgres_settings_are_set()
        {
            var factory = NewFactory();

            factory.MainDbConnection.ConnectionString.Should().Contain("whisparr3.db");
            factory.LogDbConnection.ConnectionString.Should().Contain("logs.db");
        }

        [Test]
        public void should_use_postgres_variables_when_host_is_set()
        {
            _config.Setup(v => v.PostgresHost).Returns("localhost");

            var factory = NewFactory();

            factory.MainDbConnection.DatabaseType.Should().Be(DatabaseType.PostgreSQL);
            factory.LogDbConnection.DatabaseType.Should().Be(DatabaseType.PostgreSQL);
            factory.MainDbConnection.ConnectionString.Should().Contain("Database=whisparr-main").And.Contain("Host=localhost").And.Contain("Username=user");
        }

        [Test]
        public void should_use_connection_strings_when_both_are_set()
        {
            _config.Setup(v => v.PostgresMainDbConnectionString).Returns("Host=db;Database=main-cs");
            _config.Setup(v => v.PostgresLogDbConnectionString).Returns("Host=db;Database=log-cs");

            var factory = NewFactory();

            factory.MainDbConnection.DatabaseType.Should().Be(DatabaseType.PostgreSQL);
            factory.LogDbConnection.DatabaseType.Should().Be(DatabaseType.PostgreSQL);
            factory.MainDbConnection.ConnectionString.Should().Contain("main-cs").And.Contain("Enlist=False");
        }

        [Test]
        public void should_throw_when_main_connection_string_is_set_but_log_is_not_and_log_db_is_enabled()
        {
            _config.Setup(v => v.PostgresMainDbConnectionString).Returns("Host=db;Database=main-cs");

            var act = () => NewFactory();

            act.Should().Throw<WhisparrStartupException>().WithMessage("*LogDbConnectionString is not*");
        }

        [Test]
        public void should_throw_when_log_connection_string_is_set_but_main_is_not_and_log_db_is_enabled()
        {
            _config.Setup(v => v.PostgresLogDbConnectionString).Returns("Host=db;Database=log-cs");

            var act = () => NewFactory();

            act.Should().Throw<WhisparrStartupException>().WithMessage("*MainDbConnectionString is not*");
        }

        [Test]
        public void should_throw_when_connection_strings_and_host_are_both_set()
        {
            _config.Setup(v => v.PostgresHost).Returns("localhost");
            _config.Setup(v => v.PostgresMainDbConnectionString).Returns("Host=db;Database=main-cs");
            _config.Setup(v => v.PostgresLogDbConnectionString).Returns("Host=db;Database=log-cs");

            var act = () => NewFactory();

            act.Should().Throw<WhisparrStartupException>().WithMessage("*but not both*");
        }

        [Test]
        public void should_allow_main_connection_string_only_when_log_db_is_disabled()
        {
            _config.Setup(v => v.LogDbEnabled).Returns(false);
            _config.Setup(v => v.PostgresMainDbConnectionString).Returns("Host=db;Database=main-cs");

            var factory = NewFactory();

            factory.MainDbConnection.ConnectionString.Should().Contain("main-cs");
        }
    }
}
