using System.Collections.Generic;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Api.V3.Credits;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Movies.Performers;

namespace NzbDrone.Api.Test.v3.Credits
{
    [Parallelizable(ParallelScope.All)]
    public class CreditResourceFixture
    {
        [Test]
        public void should_mark_a_hidden_performer_and_leave_out_their_images()
        {
            var resource = GivenCredit(PerformerVisibility.Hidden).ToResource(MovieMetadataType.TPDB);

            resource.PerformerHidden.Should().BeTrue();
            resource.Images.Should().BeEmpty();
        }

        [Test]
        public void should_keep_the_images_of_a_visible_performer()
        {
            var resource = GivenCredit(PerformerVisibility.Visible).ToResource(MovieMetadataType.TPDB);

            resource.PerformerHidden.Should().BeFalse();
            resource.Images.Should().HaveCount(1);
        }

        private static Credit GivenCredit(PerformerVisibility visibility)
        {
            return new Credit
            {
                Id = 1,
                PersonName = "Some Performer",
                PerformerForeignId = "performer-foreign-id",
                Images = new List<MediaCover> { new(MediaCoverTypes.Headshot, "https://example.com/headshot.jpg") },
                Performer = new CreditPerformer { Id = 2, ForeignId = "performer-foreign-id", Visibility = visibility }
            };
        }
    }
}
