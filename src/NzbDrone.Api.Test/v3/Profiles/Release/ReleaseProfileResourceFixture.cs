using System.Collections.Generic;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Profiles.Releases;
using Whisparr.Api.V3.Profiles.Release;

namespace NzbDrone.Api.Test.v3.Profiles.Release
{
    // ReleaseProfile moved from a single IndexerId to a list, but V3 still accepts the
    // old singular field. The two have to be told apart by whether IndexerIds was sent
    // at all -- a client clearing the list leaves a stale IndexerId next to it, and
    // treating "empty" as "absent" would silently re-pin the profile.
    [Parallelizable(ParallelScope.All)]
    public class ReleaseProfileResourceFixture
    {
        private static ReleaseProfileResource Resource() => new ReleaseProfileResource
        {
            Name = "Profile",
            Enabled = true,
            Required = new List<string> { "x264" },
            Ignored = new List<string>()
        };

        [Test]
        public void should_use_indexer_ids_when_supplied()
        {
            var resource = Resource();
            resource.IndexerIds = new List<int> { 3, 5 };

            resource.ToModel().IndexerIds.Should().BeEquivalentTo(new List<int> { 3, 5 });
        }

        [Test]
        public void should_keep_empty_indexer_ids_over_a_stale_indexer_id()
        {
            var resource = Resource();
            resource.IndexerId = 4;
            resource.IndexerIds = new List<int>();

            resource.ToModel().IndexerIds.Should().BeEmpty();
        }

        [Test]
        public void should_fall_back_to_indexer_id_when_indexer_ids_is_absent()
        {
            var resource = Resource();
            resource.IndexerId = 4;

            resource.ToModel().IndexerIds.Should().BeEquivalentTo(new List<int> { 4 });
        }

        [Test]
        public void should_map_indexer_id_of_zero_to_no_indexers()
        {
            var resource = Resource();
            resource.IndexerId = 0;

            resource.ToModel().IndexerIds.Should().BeEmpty();
        }

        [Test]
        public void should_deduplicate_indexer_ids()
        {
            var resource = Resource();
            resource.IndexerIds = new List<int> { 5, 4, 5 };

            resource.ToModel().IndexerIds.Should().BeEquivalentTo(new List<int> { 5, 4 });
        }

        [Test]
        public void should_return_first_indexer_id_for_older_clients()
        {
            var model = new ReleaseProfile
            {
                Id = 1,
                Name = "Profile",
                IndexerIds = new List<int> { 7, 9 }
            };

            var resource = model.ToResource();

            resource.IndexerId.Should().Be(7);
            resource.IndexerIds.Should().BeEquivalentTo(new List<int> { 7, 9 });
        }

        [Test]
        public void should_return_zero_indexer_id_when_profile_has_no_indexers()
        {
            var model = new ReleaseProfile
            {
                Id = 1,
                Name = "Profile"
            };

            var resource = model.ToResource();

            resource.IndexerId.Should().Be(0);
            resource.IndexerIds.Should().BeEmpty();
        }
    }
}
