using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MetadataSource.SkyHook;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MetadataSource.SkyHook
{
    [TestFixture]
    public class SkyHookProxyInvalidSearchTermFixture : CoreTest<SkyHookProxy>
    {
        [TestCase("/movies/Some.Movie.2024.1080p.WEB-DL")]
        [TestCase("/tmp/Some.Movie.2024.mkv")]
        public void should_reject_search_terms_that_are_file_paths(string title)
        {
            var act = () => Subject.SearchForNewEntity(title);

            act.Should().Throw<InvalidSearchTermException>();
        }

        [TestCase("imdb:tt1375666")]
        [TestCase("imdbid: tt1375666")]
        public void should_reject_imdb_id_search_terms(string title)
        {
            var act = () => Subject.SearchForNewEntity(title, ItemType.Movie);

            act.Should().Throw<InvalidSearchTermException>();
        }

        [TestCase("tpdb:5267419")]
        [TestCase("tpdbid:d534a2e3-b77a-4aac-95f6-e5671faf7165")]
        public void should_reject_tpdb_ids_when_metadata_source_is_tmdb(string title)
        {
            GivenMovieMetadataSource(MovieMetadataType.TMDB);

            var act = () => Subject.SearchForNewEntity(title, ItemType.Movie);

            act.Should().Throw<InvalidSearchTermException>();
        }

        [TestCase("tmdb:699665")]
        [TestCase("tmdbid: 699665")]
        public void should_reject_tmdb_ids_when_metadata_source_is_tpdb(string title)
        {
            GivenMovieMetadataSource(MovieMetadataType.TPDB);

            var act = () => Subject.SearchForNewEntity(title, ItemType.Movie);

            act.Should().Throw<InvalidSearchTermException>();
        }

        [TestCase("tmdb:699665")]
        [TestCase("tpdbid:d534a2e3-b77a-4aac-95f6-e5671faf7165")]
        public void should_reject_movie_id_terms_in_scene_search(string title)
        {
            var act = () => Subject.SearchForNewEntity(title, ItemType.Scene);

            act.Should().Throw<InvalidSearchTermException>();
        }

        private void GivenMovieMetadataSource(MovieMetadataType source)
        {
            Mocker.GetMock<IConfigService>().SetupGet(c => c.WhisparrMovieMetadataSource).Returns(source);
        }
    }
}
