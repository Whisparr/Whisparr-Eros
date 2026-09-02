using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Profiles.Releases;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Profiles.Releases
{
    [TestFixture]
    public class ReleaseProfileServiceFixture : CoreTest<ReleaseProfileService>
    {
        private void GivenProfiles(params ReleaseProfile[] profiles)
        {
            Mocker.GetMock<IReleaseProfileRepository>()
                  .Setup(s => s.All())
                  .Returns(profiles.ToList());
        }

        [Test]
        public void should_return_profile_with_no_indexers_for_any_indexer()
        {
            GivenProfiles(new ReleaseProfile
            {
                Id = 1,
                Enabled = true,
                IndexerIds = new List<int>(),
                Tags = new HashSet<int>()
            });

            Subject.EnabledForTags(new HashSet<int>(), 5).Should().HaveCount(1);
        }

        [Test]
        public void should_return_profile_when_indexer_is_one_of_several()
        {
            GivenProfiles(new ReleaseProfile
            {
                Id = 1,
                Enabled = true,
                IndexerIds = new List<int> { 3, 5, 7 },
                Tags = new HashSet<int>()
            });

            Subject.EnabledForTags(new HashSet<int>(), 5).Should().HaveCount(1);
        }

        [Test]
        public void should_not_return_profile_when_indexer_is_not_listed()
        {
            GivenProfiles(new ReleaseProfile
            {
                Id = 1,
                Enabled = true,
                IndexerIds = new List<int> { 3, 7 },
                Tags = new HashSet<int>()
            });

            Subject.EnabledForTags(new HashSet<int>(), 5).Should().BeEmpty();
        }

        [Test]
        public void should_not_return_disabled_profile_matching_indexer()
        {
            GivenProfiles(new ReleaseProfile
            {
                Id = 1,
                Enabled = false,
                IndexerIds = new List<int> { 5 },
                Tags = new HashSet<int>()
            });

            Subject.EnabledForTags(new HashSet<int>(), 5).Should().BeEmpty();
        }

        [Test]
        public void should_only_return_profiles_matching_the_indexer()
        {
            GivenProfiles(
                new ReleaseProfile { Id = 1, Enabled = true, IndexerIds = new List<int> { 5 }, Tags = new HashSet<int>() },
                new ReleaseProfile { Id = 2, Enabled = true, IndexerIds = new List<int> { 6 }, Tags = new HashSet<int>() },
                new ReleaseProfile { Id = 3, Enabled = true, IndexerIds = new List<int>(), Tags = new HashSet<int>() });

            var result = Subject.EnabledForTags(new HashSet<int>(), 5);

            result.Select(r => r.Id).Should().BeEquivalentTo(new[] { 1, 3 });
        }
    }
}
