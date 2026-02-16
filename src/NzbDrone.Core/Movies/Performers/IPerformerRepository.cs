using System.Collections.Generic;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Movies.Performers
{
    public interface IPerformerRepository : IBasicRepository<Performer>
    {
        Performer FindByForeignId(string foreignId);
        List<Performer> FindByForeignIds(List<string> foreignIds);
        List<Performer> SearchPerformers(string cleanName, string foreignId);
        List<string> AllPerformerForeignIds();
    }
}
