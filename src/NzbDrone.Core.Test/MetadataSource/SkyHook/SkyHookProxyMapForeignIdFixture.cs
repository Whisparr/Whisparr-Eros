using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.MetadataSource.SkyHook;
using NzbDrone.Core.MetadataSource.SkyHook.Resource;
using MovieMetadataSource = NzbDrone.Core.Movies.MetadataSource;

namespace NzbDrone.Core.Test.MetadataSource.SkyHook
{
    [TestFixture]
    public class SkyHookProxyMapForeignIdFixture
    {
        private static readonly ExternalIdResource ExternalIds = new()
        {
            StashId = "3f8a2c1e-5b7d-4e9a-8c6f-1d2e3f4a5b6c",
            TmdbId = 42019,
            TpdbId = "d534a2e3-b77a-4aac-95f6-e5671faf7165"
        };

        [Test]
        public void should_prefix_tpdb_movies_with_lowercase_tpdbid()
        {
            SkyHookProxy.MapForeignId(MovieMetadataSource.TpdbMovie, ExternalIds)
                .Should().Be("tpdbid:d534a2e3-b77a-4aac-95f6-e5671faf7165");
        }

        [Test]
        public void should_use_tmdb_id_for_tmdb_movies()
        {
            SkyHookProxy.MapForeignId(MovieMetadataSource.Tmdb, ExternalIds).Should().Be("42019");
        }

        [Test]
        public void should_use_stash_id_for_scenes()
        {
            SkyHookProxy.MapForeignId(MovieMetadataSource.Stash, ExternalIds).Should().Be("3f8a2c1e-5b7d-4e9a-8c6f-1d2e3f4a5b6c");
        }
    }
}
