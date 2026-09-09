using System.Collections.Generic;
using System.Linq;
using Dapper;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser;

namespace NzbDrone.Core.Movies.Studios
{
    public interface IStudioRepository : IBasicRepository<Studio>
    {
        Studio FindByForeignId(string foreignId);
        List<Studio> FindByForeignIds(List<string> foreignIds);
        Studio FindByTitle(string title);
        List<Studio> SearchStudios(string cleanTitle, string foreignId);
        List<Studio> FindAllByTitle(string title);
        List<string> AllStudioForeignIds();
        List<int> AllStudioIdsByLastInfoSync();
    }

    public class StudioRepository : BasicRepository<Studio>, IStudioRepository
    {
        public StudioRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public Studio FindByTitle(string title)
        {
            return FindAllByTitle(title).FirstOrDefault();
        }

        public List<Studio> SearchStudios(string cleanTitle, string foreignId)
        {
            return Query(x => x.CleanTitle.Contains(cleanTitle) || x.ForeignId == foreignId).ToList();
        }

        public List<Studio> FindAllByTitle(string title)
        {
            if (title.IsNullOrWhiteSpace())
            {
                return new List<Studio>();
            }

            // CleanSearchTitle is only ever written by the API's resource mapper, and stores
            // string.Empty when the studio has no search title. Studios created by the
            // metadata and scan paths leave it null. Comparing a blank title against either
            // would return every studio the user has saved through the UI, so blanks are
            // excluded rather than relied upon to be null.
            return All().Where(x => x.CleanTitle == title
                                 || (x.CleanSearchTitle.IsNotNullOrWhiteSpace() && x.CleanSearchTitle == title)
                                 || (x.Aliases != null && x.Aliases.Any(alias => alias.CleanStudioTitle()?.ToLower() == title))).ToList();
        }

        public Studio FindByForeignId(string foreignId)
        {
            return Query(x => x.ForeignId == foreignId).FirstOrDefault();
        }

        public List<Studio> FindByForeignIds(List<string> foreignIds)
        {
            return Query(x => foreignIds.Contains(x.ForeignId)).ToList();
        }

        public List<string> AllStudioForeignIds()
        {
            using (var conn = _database.OpenConnection())
            {
                return conn.Query<string>("SELECT \"ForeignId\" FROM \"Studios\"").ToList();
            }
        }

        public List<int> AllStudioIdsByLastInfoSync()
        {
            using (var conn = _database.OpenConnection())
            {
                return conn.Query<int>("SELECT \"Id\" FROM \"Studios\" ORDER BY \"LastInfoSync\" ASC").ToList();
            }
        }

        public override PagingSpec<Studio> GetPaged(PagingSpec<Studio> pagingSpec)
        {
            return base.GetPaged(pagingSpec);
        }
    }
}
