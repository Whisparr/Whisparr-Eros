using System.Collections.Generic;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.RootFolders;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Performers;

namespace NzbDrone.Api.Test.v3.Performers
{
    [Parallelizable(ParallelScope.Self)]
    public class PerformerEditorValidatorFixture : TestBase<PerformerEditorValidator>
    {
        private static readonly string RootFolder = @"C:\Movies".AsOsAgnostic();

        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<IQualityProfileService>()
                .Setup(s => s.Exists(1))
                .Returns(true);

            Mocker.GetMock<IRootFolderService>()
                .Setup(s => s.All())
                .Returns(new List<RootFolder> { new RootFolder { Path = RootFolder } });
        }

        private static Performer GivenPerformer(int qualityProfileId = 1, string rootFolderPath = null)
        {
            return new Performer
            {
                Id = 1,
                ForeignId = "performer-foreign-id",
                QualityProfileId = qualityProfileId,
                RootFolderPath = rootFolderPath
            };
        }

        [Test]
        public void should_accept_an_existing_quality_profile_and_root_folder()
        {
            Subject.Validate(GivenPerformer(rootFolderPath: RootFolder)).IsValid.Should().BeTrue();
        }

        [Test]
        public void should_reject_a_quality_profile_that_does_not_exist()
        {
            var result = Subject.Validate(GivenPerformer(9999, RootFolder));

            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "QualityProfileId" && e.ErrorCode == "QualityProfileExistsValidator");
        }

        [Test]
        public void should_reject_an_unset_quality_profile()
        {
            var result = Subject.Validate(GivenPerformer(0, RootFolder));

            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "QualityProfileId");
        }

        [Test]
        public void should_reject_a_root_folder_that_does_not_exist()
        {
            var result = Subject.Validate(GivenPerformer(rootFolderPath: @"C:\Nonexistent\Bogus".AsOsAgnostic()));

            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "RootFolderPath" && e.ErrorCode == "RootFolderExistsValidator");
        }

        [TestCase(null)]
        [TestCase("")]
        public void should_skip_the_root_folder_check_when_it_is_not_set(string rootFolderPath)
        {
            Subject.Validate(GivenPerformer(rootFolderPath: rootFolderPath)).IsValid.Should().BeTrue();
        }
    }
}
