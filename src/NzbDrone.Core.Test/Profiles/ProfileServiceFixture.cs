using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.ImportLists;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Lifecycle;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Test.CustomFormats;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Profiles
{
    [TestFixture]

    public class ProfileServiceFixture : CoreTest<QualityProfileService>
    {
        [Test]
        public void init_should_add_default_profiles()
        {
            Mocker.GetMock<ICustomFormatService>()
                .Setup(s => s.All())
                .Returns(new List<CustomFormat>());

            Subject.Handle(new ApplicationStartedEvent());

            Mocker.GetMock<IQualityProfileRepository>()
                .Verify(v => v.Insert(It.IsAny<QualityProfile>()), Times.Exactly(7));
        }

        [Test]

        // This confirms that new profiles are added only if no other profiles exists.
        // We don't want to keep adding them back if a user deleted them on purpose.
        public void Init_should_skip_if_any_profiles_already_exist()
        {
            Mocker.GetMock<IQualityProfileRepository>()
                  .Setup(s => s.All())
                  .Returns(Builder<QualityProfile>.CreateListOfSize(2).Build().ToList());

            Subject.Handle(new ApplicationStartedEvent());

            Mocker.GetMock<IQualityProfileRepository>()
                .Verify(v => v.Insert(It.IsAny<QualityProfile>()), Times.Never());
        }

        [Test]
        public void should_not_be_able_to_delete_profile_if_assigned_to_movie()
        {
            GivenProfileInUseBy(movieCount: 1);

            Assert.Throws<QualityProfileInUseException>(() => Subject.Delete(2));

            Mocker.GetMock<IQualityProfileRepository>().Verify(c => c.Delete(It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_not_be_able_to_delete_profile_if_assigned_to_performer()
        {
            GivenProfileInUseBy(performerCount: 1);

            Assert.Throws<QualityProfileInUseException>(() => Subject.Delete(2));

            Mocker.GetMock<IQualityProfileRepository>().Verify(c => c.Delete(It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_not_be_able_to_delete_profile_if_assigned_to_studio()
        {
            GivenProfileInUseBy(studioCount: 1);

            Assert.Throws<QualityProfileInUseException>(() => Subject.Delete(2));

            Mocker.GetMock<IQualityProfileRepository>().Verify(c => c.Delete(It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_not_be_able_to_delete_profile_if_assigned_to_list()
        {
            GivenProfileInUseBy(importListCount: 1);

            Assert.Throws<QualityProfileInUseException>(() => Subject.Delete(2));

            Mocker.GetMock<IQualityProfileRepository>().Verify(c => c.Delete(It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_not_be_able_to_delete_profile_if_it_is_the_fallback()
        {
            GivenProfileInUseBy(fallback: true);

            Assert.Throws<QualityProfileInUseException>(() => Subject.Delete(2));

            Mocker.GetMock<IQualityProfileRepository>().Verify(c => c.Delete(It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_delete_profile_if_not_in_use()
        {
            GivenProfileInUseBy();

            Subject.Delete(2);

            Mocker.GetMock<IQualityProfileRepository>().Verify(c => c.Delete(2), Times.Once());
        }

        [Test]
        public void get_in_use_should_return_the_counts_the_delete_guard_checks()
        {
            GivenProfileInUseBy(movieCount: 3, performerCount: 2, studioCount: 1, importListCount: 2, fallback: true);

            var inUse = Subject.GetInUse(2);

            inUse.MovieCount.Should().Be(3);
            inUse.PerformerCount.Should().Be(2);
            inUse.StudioCount.Should().Be(1);
            inUse.ImportListCount.Should().Be(2);
            inUse.IsFallback.Should().BeTrue();
            inUse.IsInUse.Should().BeTrue();
        }

        [Test]
        public void get_in_use_should_not_be_in_use_when_nothing_holds_the_profile()
        {
            GivenProfileInUseBy();

            var inUse = Subject.GetInUse(2);

            inUse.IsInUse.Should().BeFalse();
        }

        [Test]
        public void get_in_use_should_count_only_the_lists_using_the_profile()
        {
            GivenProfileInUseBy();

            var importLists = Builder<ImportListDefinition>.CreateListOfSize(3)
                .All()
                .With(c => c.QualityProfileId = 1)
                .Random(1)
                .With(c => c.QualityProfileId = 2)
                .Build().ToList();

            Mocker.GetMock<IImportListFactory>().Setup(c => c.All()).Returns(importLists);

            Subject.GetInUse(2).ImportListCount.Should().Be(1);
        }

        [Test]
        public void get_in_use_should_not_load_the_library_to_answer()
        {
            GivenProfileInUseBy(movieCount: 1);

            Subject.GetInUse(2);

            Mocker.GetMock<IMovieService>().Verify(c => c.GetAllMovies(), Times.Never());
            Mocker.GetMock<IPerformerService>().Verify(c => c.GetAllPerformers(), Times.Never());
            Mocker.GetMock<IStudioService>().Verify(c => c.GetAllStudios(), Times.Never());
        }

        [Test]
        public void get_acceptable_languages_should_return_profile_language()
        {
            var profile = Builder<QualityProfile>.CreateNew().With(c => c.Language = Language.German).Build();

            Mocker.GetMock<IQualityProfileRepository>()
                  .Setup(s => s.Get(It.IsAny<int>()))
                  .Returns(profile);

            var languages = Subject.GetAcceptableLanguages(profile.Id);

            languages.Count.Should().Be(1);
            languages.Should().Contain(Language.German);
        }

        [Test]
        public void get_acceptable_languages_should_return_custom_format_positive_languages()
        {
            var profile = Builder<QualityProfile>.CreateNew()
                .With(c => c.Language = Language.German)
                .Build();

            var customFormat1 = new CustomFormat("My Format 1", new LanguageSpecification { Value = (int)Language.English }) { Id = 1 };
            var customFormat2 = new CustomFormat("My Format 2", new LanguageSpecification { Value = (int)Language.French }) { Id = 2 };

            CustomFormatsTestHelpers.GivenCustomFormats(customFormat1, customFormat2);

            profile.FormatItems = CustomFormatsTestHelpers.GetSampleFormatItems(customFormat2.Name);

            Mocker.GetMock<IQualityProfileRepository>()
                  .Setup(s => s.Get(It.IsAny<int>()))
                  .Returns(profile);

            var languages = Subject.GetAcceptableLanguages(profile.Id);

            languages.Count.Should().Be(2);
            languages.Should().Contain(Language.German);
            languages.Should().Contain(Language.French);
        }

        private void GivenProfileInUseBy(int movieCount = 0, int performerCount = 0, int studioCount = 0, int importListCount = 0, bool fallback = false)
        {
            Mocker.GetMock<IMovieService>().Setup(c => c.CountByQualityProfile(2)).Returns(movieCount);
            Mocker.GetMock<IPerformerService>().Setup(c => c.CountByQualityProfile(2)).Returns(performerCount);
            Mocker.GetMock<IStudioService>().Setup(c => c.CountByQualityProfile(2)).Returns(studioCount);

            Mocker.GetMock<IImportListFactory>()
                .Setup(c => c.All())
                .Returns(Builder<ImportListDefinition>.CreateListOfSize(importListCount + 1)
                    .All()
                    .With(c => c.QualityProfileId = 2)
                    .TheLast(1)
                    .With(c => c.QualityProfileId = 1)
                    .Build().ToList());

            Mocker.GetMock<IQualityProfileRepository>()
                .Setup(c => c.Get(2))
                .Returns(Builder<QualityProfile>.CreateNew().With(c => c.Fallback = fallback).Build());
        }
    }
}
