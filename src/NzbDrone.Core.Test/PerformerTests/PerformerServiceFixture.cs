using System.Collections.Generic;
using FizzWare.NBuilder;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Performers.Events;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.PerformerTests
{
    [TestFixture]
    public class PerformerServiceFixture : CoreTest
    {
        private PerformerService _subject;

        [SetUp]
        public void Setup()
        {
            // Update doesn't touch the concrete movie, statistics or file services, which
            // can't be auto-mocked, so they're left out.
            _subject = new PerformerService(
                Mocker.GetMock<IPerformerRepository>().Object,
                Mocker.GetMock<ICacheManager>().Object,
                Mocker.GetMock<IEventAggregator>().Object,
                null,
                null,
                null,
                Mocker.GetMock<IImportListExclusionService>().Object);
        }

        [Test]
        public void should_publish_one_updated_event_per_update()
        {
            var performer = Builder<Performer>.CreateNew().Build();

            Mocker.GetMock<IPerformerRepository>()
                .Setup(s => s.Update(performer))
                .Returns(performer);

            _subject.Update(performer);

            // RefreshPerformerService relies on this being the only PerformerUpdatedEvent
            Mocker.GetMock<IEventAggregator>()
                .Verify(s => s.PublishEvent(It.Is<PerformerUpdatedEvent>(e => e.Performer == performer)), Times.Once());
        }

        [Test]
        public void should_look_up_each_visible_performer_name_once()
        {
            Mocker.GetMock<IPerformerRepository>()
                .Setup(s => s.VisiblePerformerNames(It.IsAny<List<string>>()))
                .Returns(new List<Performer>());

            _subject.VisiblePerformerNames(new List<string> { "a", "b", "a" });

            Mocker.GetMock<IPerformerRepository>()
                .Verify(v => v.VisiblePerformerNames(It.Is<List<string>>(l => l.Count == 2 && l.Contains("a") && l.Contains("b"))), Times.Once());
        }
    }
}
