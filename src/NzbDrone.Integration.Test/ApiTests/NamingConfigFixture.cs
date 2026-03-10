using FluentAssertions;
using NUnit.Framework;

namespace NzbDrone.Integration.Test.ApiTests
{
    [TestFixture]
    public class NamingConfigFixture : IntegrationTest
    {
        [Test]
        public void should_be_able_to_get()
        {
            NamingConfig.GetSingle().Should().NotBeNull();
        }

        [Test]
        public void should_be_able_to_get_by_id()
        {
            var config = NamingConfig.GetSingle();
            NamingConfig.Get(config.Id).Should().NotBeNull();
            NamingConfig.Get(config.Id).Id.Should().Be(config.Id);
        }

        [Test]
        public void should_be_able_to_update()
        {
            var config = NamingConfig.GetSingle();
            config.RenameMovies = false;
            config.StandardMovieFormat = "{Movie Title} {Release Year}";

            var result = NamingConfig.Put(config);
            result.RenameMovies.Should().BeFalse();
            result.StandardMovieFormat.Should().Be(config.StandardMovieFormat);
        }

        [Test]
        public void should_get_bad_request_if_standard_format_is_empty()
        {
            var config = NamingConfig.GetSingle();
            config.RenameMovies = true;
            config.StandardMovieFormat = "";

            NamingConfig.InvalidPut(config);
        }

        [Test]
        public void should_get_bad_request_if_standard_format_doesnt_contain_title()
        {
            var config = NamingConfig.GetSingle();
            config.RenameMovies = true;
            config.StandardMovieFormat = "{quality}";

            NamingConfig.InvalidPut(config);
        }

        [Test]
        public void should_not_require_format_when_rename_episodes_is_false()
        {
            var config = NamingConfig.GetSingle();
            config.RenameMovies = false;
            config.StandardMovieFormat = "";

            NamingConfig.InvalidPut(config);
        }

        [Test]
        public void should_require_format_when_rename_episodes_is_true()
        {
            var config = NamingConfig.GetSingle();
            config.RenameMovies = true;
            config.StandardMovieFormat = "";

            NamingConfig.InvalidPut(config);
        }

        [Test]
        public void should_get_bad_request_if_movie_folder_format_does_not_contain_movie_title()
        {
            var config = NamingConfig.GetSingle();
            config.RenameMovies = true;
            config.MovieFolderFormat = "This and That";

            NamingConfig.InvalidPut(config);
        }
    }
}
