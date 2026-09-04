using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Qualities
{
    [TestFixture]
    public class QualityProfileRankServiceFixture : CoreTest<QualityProfileRankService>
    {
        private static QualityProfile BuildProfile(int id, params Quality[] items)
        {
            return new QualityProfile
            {
                Id = id,
                Items = items.Select(q => new QualityProfileQualityItem { Quality = q, Allowed = true }).ToList()
            };
        }

        [Test]
        public void should_score_single_item_profile_as_1()
        {
            var ranks = Subject.ComputeRanks(BuildProfile(7, Quality.SDTV)).ToList();

            ranks.Should().HaveCount(1);
            ranks[0].ProfileId.Should().Be(7);
            ranks[0].QualityId.Should().Be(Quality.SDTV.Id);
            ranks[0].Score.Should().Be(1.0);
        }

        [Test]
        public void should_score_first_item_as_0_and_last_as_1()
        {
            var ranks = Subject.ComputeRanks(BuildProfile(3, Quality.SDTV, Quality.HDTV720p, Quality.Bluray1080p))
                .ToDictionary(r => r.QualityId, r => r.Score);

            ranks[Quality.SDTV.Id].Should().Be(0.0);
            ranks[Quality.HDTV720p.Id].Should().Be(0.5);
            ranks[Quality.Bluray1080p.Id].Should().Be(1.0);
        }

        [Test]
        public void should_flatten_grouped_items_and_share_group_index()
        {
            var profile = new QualityProfile
            {
                Id = 4,
                Items = new List<QualityProfileQualityItem>
                {
                    new () { Quality = Quality.SDTV, Allowed = true },
                    new ()
                    {
                        Id = 1000,
                        Name = "HD",
                        Allowed = true,
                        Items = new List<QualityProfileQualityItem>
                        {
                            new () { Quality = Quality.HDTV720p, Allowed = true },
                            new () { Quality = Quality.WEBDL720p, Allowed = true }
                        }
                    },
                    new () { Quality = Quality.Bluray1080p, Allowed = true }
                }
            };

            var ranks = Subject.ComputeRanks(profile).ToDictionary(r => r.QualityId, r => r.Score);

            ranks[Quality.SDTV.Id].Should().Be(0.0);
            ranks[Quality.HDTV720p.Id].Should().Be(0.5);
            ranks[Quality.WEBDL720p.Id].Should().Be(0.5);
            ranks[Quality.Bluray1080p.Id].Should().Be(1.0);
        }

        [Test]
        public void should_emit_ranks_for_disallowed_items_too()
        {
            var profile = BuildProfile(9, Quality.SDTV, Quality.HDTV720p);
            profile.Items[0].Allowed = false;

            Subject.ComputeRanks(profile).Should().HaveCount(2);
        }

        [Test]
        public void seed_should_upsert_ranks_for_every_profile()
        {
            Subject.SeedAll(new List<QualityProfile>
            {
                BuildProfile(1, Quality.SDTV, Quality.HDTV720p),
                BuildProfile(2, Quality.Bluray1080p)
            });

            Mocker.GetMock<IQualityProfileRankRepository>()
                  .Verify(x => x.ReplaceForProfile(1, It.Is<IEnumerable<QualityProfileQualityRank>>(r => r.Count() == 2)), Times.Once);
            Mocker.GetMock<IQualityProfileRankRepository>()
                  .Verify(x => x.ReplaceForProfile(2, It.Is<IEnumerable<QualityProfileQualityRank>>(r => r.Count() == 1)), Times.Once);
        }

        [Test]
        public void should_not_reseed_a_profile_that_already_has_ranks()
        {
            Mocker.GetMock<IQualityProfileRankRepository>()
                  .Setup(x => x.All())
                  .Returns(new List<QualityProfileQualityRank>
                  {
                      new () { ProfileId = 1, QualityId = Quality.SDTV.Id, Score = 0.0 }
                  });

            Subject.SeedAll(new List<QualityProfile> { BuildProfile(1, Quality.SDTV, Quality.HDTV720p) });

            Mocker.GetMock<IQualityProfileRankRepository>()
                  .Verify(x => x.ReplaceForProfile(It.IsAny<int>(), It.IsAny<IEnumerable<QualityProfileQualityRank>>()), Times.Never);
        }

        [Test]
        public void should_fall_back_to_default_ranks_when_no_profile_is_given()
        {
            Subject.GetRank(null, Quality.Bluray1080p.Id)
                .Should().BeGreaterThan(Subject.GetRank(null, Quality.SDTV.Id));
        }

        [Test]
        public void should_rank_an_unknown_quality_below_everything()
        {
            Subject.GetRank(null, null).Should().Be(-1.0);
        }
    }
}
