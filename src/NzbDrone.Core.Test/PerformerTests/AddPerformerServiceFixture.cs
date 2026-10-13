using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Performers.Commands;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.PerformerTests
{
    [TestFixture]
    public class AddPerformerServiceFixture : CoreTest<AddPerformerService>
    {
        private const string ForeignId = "performer-foreign-id";

        private Performer _existing;

        [SetUp]
        public void Setup()
        {
            _existing = new Performer
            {
                Id = 12,
                ForeignId = ForeignId,
                Name = "Co Star",
                Visibility = PerformerVisibility.Hidden,
                QualityProfileId = 1,
                RootFolderPath = "/old",
                Tags = new HashSet<int>()
            };

            Mocker.GetMock<IPerformerService>()
                  .Setup(s => s.Update(It.IsAny<Performer>()))
                  .Returns<Performer>(p => p);

            Mocker.GetMock<IProvideMovieInfo>()
                  .Setup(s => s.GetPerformerInfo(ForeignId))
                  .Returns(new Performer { ForeignId = ForeignId, Name = "Co Star" });
        }

        [Test]
        public void should_show_a_hidden_performer_instead_of_adding_a_duplicate()
        {
            GivenExisting();

            var result = Subject.AddPerformer(GivenNewPerformer(true));

            result.Id.Should().Be(12);
            result.Visibility.Should().Be(PerformerVisibility.Visible);
            result.Monitored.Should().BeTrue();
            result.QualityProfileId.Should().Be(3);
            result.RootFolderPath.Should().Be("/new");
            result.Tags.Should().BeEquivalentTo(new[] { 4 });

            Mocker.GetMock<IPerformerService>().Verify(v => v.Update(_existing), Times.Once());
            Mocker.GetMock<IPerformerService>().Verify(v => v.AddPerformer(It.IsAny<Performer>()), Times.Never());
            Mocker.GetMock<IProvideMovieInfo>().Verify(v => v.GetPerformerInfo(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_refresh_a_hidden_performer_shown_as_monitored()
        {
            GivenExisting();

            Subject.AddPerformer(GivenNewPerformer(true));

            Mocker.GetMock<IManageCommandQueue>()
                  .Verify(v => v.Push(It.Is<RefreshPerformersCommand>(c => c.PerformerIds.Contains(12)),
                                      It.IsAny<CommandPriority>(),
                                      It.IsAny<CommandTrigger>()),
                          Times.Once());
        }

        [Test]
        public void should_not_refresh_a_hidden_performer_shown_as_unmonitored()
        {
            GivenExisting();

            var result = Subject.AddPerformer(GivenNewPerformer(false));

            result.Visibility.Should().Be(PerformerVisibility.Visible);

            Mocker.GetMock<IManageCommandQueue>()
                  .Verify(v => v.Push(It.IsAny<RefreshPerformersCommand>(),
                                      It.IsAny<CommandPriority>(),
                                      It.IsAny<CommandTrigger>()),
                          Times.Never());
        }

        [Test]
        public void should_add_a_performer_that_is_not_in_the_library()
        {
            Subject.AddPerformer(GivenNewPerformer(true));

            Mocker.GetMock<IPerformerService>()
                  .Verify(v => v.AddPerformer(It.Is<Performer>(p => p.ForeignId == ForeignId &&
                                                                     p.Visibility == PerformerVisibility.Visible)),
                          Times.Once());
            Mocker.GetMock<IPerformerService>().Verify(v => v.Update(It.IsAny<Performer>()), Times.Never());
        }

        private static Performer GivenNewPerformer(bool monitored)
        {
            return new Performer
            {
                ForeignId = ForeignId,
                Monitored = monitored,
                QualityProfileId = 3,
                RootFolderPath = "/new",
                Tags = new HashSet<int> { 4 }
            };
        }

        private void GivenExisting()
        {
            Mocker.GetMock<IPerformerService>()
                  .Setup(s => s.FindByForeignId(ForeignId))
                  .Returns(_existing);
        }
    }
}
