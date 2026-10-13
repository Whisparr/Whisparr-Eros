using FizzWare.NBuilder;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Movies.Studios.Events;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.StudioTests
{
    [TestFixture]
    public class StudioServiceFixture : CoreTest<StudioService>
    {
        [Test]
        public void should_publish_one_updated_event_per_update()
        {
            var studio = Builder<Studio>.CreateNew().Build();

            Mocker.GetMock<IStudioRepository>()
                .Setup(s => s.Update(studio))
                .Returns(studio);

            Subject.Update(studio);

            // RefreshStudioService relies on this being the only StudioUpdatedEvent
            Mocker.GetMock<IEventAggregator>()
                .Verify(s => s.PublishEvent(It.Is<StudioUpdatedEvent>(e => e.Studio == studio)), Times.Once());
        }
    }
}
