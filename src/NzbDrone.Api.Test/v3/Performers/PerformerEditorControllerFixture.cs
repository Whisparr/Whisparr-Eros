using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.RootFolders;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Performers;

namespace NzbDrone.Api.Test.v3.Performers
{
    [Parallelizable(ParallelScope.Self)]
    public class PerformerEditorControllerFixture : TestBase<PerformerEditorController>
    {
        private static readonly string RootFolder = @"C:\Movies".AsOsAgnostic();

        private List<Performer> _performers;

        [SetUp]
        public void Setup()
        {
            _performers = new List<Performer>
            {
                new Performer { Id = 1, ForeignId = "performer-1", Name = "Performer 1", QualityProfileId = 1, RootFolderPath = RootFolder },
                new Performer { Id = 2, ForeignId = "performer-2", Name = "Performer 2", QualityProfileId = 1, RootFolderPath = RootFolder }
            };

            Mocker.GetMock<IQualityProfileService>()
                .Setup(s => s.Exists(1))
                .Returns(true);

            Mocker.GetMock<IRootFolderService>()
                .Setup(s => s.All())
                .Returns(new List<RootFolder> { new RootFolder { Path = RootFolder } });

            Mocker.GetMock<IPerformerService>()
                .Setup(s => s.GetPerformers(It.IsAny<IEnumerable<int>>()))
                .Returns(_performers);

            Mocker.GetMock<IPerformerService>()
                .Setup(s => s.Update(It.IsAny<List<Performer>>()))
                .Returns<List<Performer>>(p => p);
        }

        private static PerformerEditorResource GivenResource()
        {
            return new PerformerEditorResource { PerformerIds = new List<int> { 1, 2 } };
        }

        private void GivenExistingAfterDates()
        {
            _performers[0].AfterDate = new DateTime(2020, 1, 1);
            _performers[1].AfterDate = new DateTime(2021, 2, 2);
        }

        [Test]
        public void should_set_the_after_date_on_every_performer()
        {
            var resource = GivenResource();
            resource.AfterDate = "2024-06-01";

            Subject.SaveAll(resource);

            _performers.Should().OnlyContain(p => p.AfterDate == new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc));
            _performers.Should().OnlyContain(p => p.AfterDate.Value.Kind == DateTimeKind.Utc);
        }

        [Test]
        public void should_clear_the_after_date_when_given_an_empty_string()
        {
            GivenExistingAfterDates();

            var resource = GivenResource();
            resource.AfterDate = string.Empty;

            Subject.SaveAll(resource);

            _performers.Should().OnlyContain(p => p.AfterDate == null);
        }

        [Test]
        public void should_leave_each_after_date_alone_when_it_is_not_in_the_request()
        {
            GivenExistingAfterDates();

            Subject.SaveAll(GivenResource());

            _performers[0].AfterDate.Should().Be(new DateTime(2020, 1, 1));
            _performers[1].AfterDate.Should().Be(new DateTime(2021, 2, 2));
        }

        [Test]
        public void should_reject_an_after_date_that_cannot_be_parsed()
        {
            GivenExistingAfterDates();

            var resource = GivenResource();
            resource.AfterDate = "not-a-date";

            // Rejecting outright matters more than usual here: falling through would clear
            // the date on every selected performer instead of setting the one the user typed.
            Assert.Throws<ValidationException>(() => Subject.SaveAll(resource));

            _performers[0].AfterDate.Should().Be(new DateTime(2020, 1, 1));
            Mocker.GetMock<IPerformerService>().Verify(s => s.Update(It.IsAny<List<Performer>>()), Times.Never());
        }

        [Test]
        public void should_return_the_edited_performers_as_resources()
        {
            var resource = GivenResource();
            resource.AfterDate = "2024-06-01";

            var response = (AcceptedResult)Subject.SaveAll(resource);

            // The client replaces its cached performers with this body, so it has to be
            // mapped resources rather than the raw models.
            var resources = response.Value.Should().BeOfType<List<PerformerResource>>().Subject;
            resources.Select(p => p.Id).Should().BeEquivalentTo(new[] { 1, 2 });
            resources.Should().OnlyContain(p => p.AfterDate == "2024-06-01");
        }
    }
}
