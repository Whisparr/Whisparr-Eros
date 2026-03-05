using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies.Performers.Commands;
using NzbDrone.Core.Movies.Performers.Events;

namespace NzbDrone.Core.Movies.Performers
{
    public class PerformerAddedHandler : IHandle<PerformerAddedEvent>, IHandle<PerformersAddedEvent>
    {
        private readonly IManageCommandQueue _commandQueueManager;

        public PerformerAddedHandler(IManageCommandQueue commandQueueManager)
        {
            _commandQueueManager = commandQueueManager;
        }

        public void Handle(PerformerAddedEvent message)
        {
            if (message.Performer.Monitored || message.Performer.MoviesMonitored)
            {
                _commandQueueManager.Push(new RefreshPerformersCommand(new List<int> { message.Performer.Id }));
            }
        }

        public void Handle(PerformersAddedEvent message)
        {
            // Skip refresh for unmonitored performers (e.g. added as side-effect of movie refresh).
            // Their metadata is already fetched by AddPerformerService, and SyncPerformerItems
            // would bail out immediately for unmonitored performers anyway.
            var performersToRefresh = message.Performers
                .Where(s => s.Monitored || s.MoviesMonitored)
                .ToList();

            if (performersToRefresh.Any())
            {
                _commandQueueManager.PushMany(performersToRefresh.Select(s => new RefreshPerformersCommand(new List<int> { s.Id })).ToList());
            }
        }
    }
}
