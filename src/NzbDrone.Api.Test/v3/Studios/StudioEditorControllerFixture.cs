using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.RootFolders;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Studios;

namespace NzbDrone.Api.Test.v3.Studios
{
    [Parallelizable(ParallelScope.Self)]
    public class StudioEditorControllerFixture : TestBase<StudioEditorController>
    {
        private static readonly string RootFolder = @"C:\Movies".AsOsAgnostic();

        private List<Studio> _studios;

        [SetUp]
        public void Setup()
        {
            _studios = new List<Studio>
            {
                new Studio { Id = 1, ForeignId = "studio-1", Title = "Studio 1", QualityProfileId = 1, RootFolderPath = RootFolder },
                new Studio { Id = 2, ForeignId = "studio-2", Title = "Studio 2", QualityProfileId = 1, RootFolderPath = RootFolder }
            };

            Mocker.GetMock<IQualityProfileService>()
                .Setup(s => s.Exists(1))
                .Returns(true);

            Mocker.GetMock<IRootFolderService>()
                .Setup(s => s.All())
                .Returns(new List<RootFolder> { new RootFolder { Path = RootFolder } });

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.GetStudios(It.IsAny<IEnumerable<int>>()))
                .Returns(_studios);

            Mocker.GetMock<IStudioService>()
                .Setup(s => s.Update(It.IsAny<List<Studio>>()))
                .Returns<List<Studio>>(s => s);
        }

        private static StudioEditorResource GivenResource()
        {
            return new StudioEditorResource { StudioIds = new List<int> { 1, 2 } };
        }

        private void GivenExistingAfterDates()
        {
            _studios[0].AfterDate = new DateTime(2020, 1, 1);
            _studios[1].AfterDate = new DateTime(2021, 2, 2);
        }

        [Test]
        public void should_set_the_after_date_on_every_studio()
        {
            var resource = GivenResource();
            resource.AfterDate = "2024-06-01";

            Subject.SaveAll(resource);

            _studios.Should().OnlyContain(s => s.AfterDate == new DateTime(2024, 6, 1));
        }

        [Test]
        public void should_clear_the_after_date_when_given_an_empty_string()
        {
            GivenExistingAfterDates();

            var resource = GivenResource();
            resource.AfterDate = string.Empty;

            Subject.SaveAll(resource);

            _studios.Should().OnlyContain(s => s.AfterDate == null);
        }

        [Test]
        public void should_leave_each_after_date_alone_when_it_is_not_in_the_request()
        {
            GivenExistingAfterDates();

            Subject.SaveAll(GivenResource());

            _studios[0].AfterDate.Should().Be(new DateTime(2020, 1, 1));
            _studios[1].AfterDate.Should().Be(new DateTime(2021, 2, 2));
        }

        [Test]
        public void should_reject_an_after_date_that_cannot_be_parsed()
        {
            GivenExistingAfterDates();

            var resource = GivenResource();
            resource.AfterDate = "not-a-date";

            // Rejecting outright matters more than usual here: falling through would clear
            // the date on every selected studio instead of setting the one the user typed.
            Assert.Throws<ValidationException>(() => Subject.SaveAll(resource));

            _studios[0].AfterDate.Should().Be(new DateTime(2020, 1, 1));
            Mocker.GetMock<IStudioService>().Verify(s => s.Update(It.IsAny<List<Studio>>()), Times.Never());
        }

        [Test]
        public void should_apply_movies_monitored()
        {
            var resource = GivenResource();
            resource.MoviesMonitored = true;

            Subject.SaveAll(resource);

            _studios.Should().OnlyContain(s => s.MoviesMonitored);
        }

        [Test]
        public void should_return_the_edited_studios_as_resources()
        {
            var resource = GivenResource();
            resource.MoviesMonitored = true;

            var response = (AcceptedResult)Subject.SaveAll(resource);

            // The client replaces its cached studios with this body, so it has to be
            // mapped resources rather than the raw models.
            var resources = response.Value.Should().BeOfType<List<StudioResource>>().Subject;
            resources.Select(s => s.Id).Should().BeEquivalentTo(new[] { 1, 2 });
            resources.Should().OnlyContain(s => s.MoviesMonitored);
        }
    }
}
