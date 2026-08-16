using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using NzbDrone.Common.Cache;
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
        private static readonly TimeSpan TitleLookupTtl = TimeSpan.FromSeconds(30);

        private readonly ICachedDictionary<List<Studio>> _studiosByNormalizedTitle;

        public StudioRepository(IMainDatabase database, IEventAggregator eventAggregator, ICacheManager cacheManager)
            : base(database, eventAggregator)
        {
            _studiosByNormalizedTitle = cacheManager.GetCacheDictionary(GetType(), "byNormalizedTitle", BuildNormalizedTitleLookup, TitleLookupTtl);
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

            var matches = _studiosByNormalizedTitle.Find(title);

            return matches == null ? new List<Studio>() : matches.ToList();
        }

        private static void IndexTitle(Dictionary<string, List<Studio>> lookup, string title, Studio studio)
        {
            if (title.IsNullOrWhiteSpace())
            {
                return;
            }

            if (!lookup.TryGetValue(title, out var studios))
            {
                studios = new List<Studio>();
                lookup[title] = studios;
            }

            if (!studios.Any(s => s.Id == studio.Id))
            {
                studios.Add(studio);
            }
        }

        private IDictionary<string, List<Studio>> BuildNormalizedTitleLookup()
        {
            var lookup = new Dictionary<string, List<Studio>>();

            foreach (var studio in All())
            {
                IndexTitle(lookup, studio.CleanTitle, studio);
                IndexTitle(lookup, studio.CleanSearchTitle, studio);

                if (studio.Aliases == null)
                {
                    continue;
                }

                foreach (var alias in studio.Aliases)
                {
                    IndexTitle(lookup, alias.CleanStudioTitle()?.ToLower(), studio);
                }
            }

            return lookup;
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
