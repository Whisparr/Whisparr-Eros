using System;
using System.Linq;
using NLog;
using NzbDrone.Common.Http;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Parser;

namespace NzbDrone.Core.ImportLists.StashDB
{
    public abstract class StashDBImportBase<TSettings> : HttpImportListBase<TSettings>
    where TSettings : StashDBSettingsBase<TSettings>, new()
    {
        public StashDBImportBase(IHttpClient httpClient,
                                    IImportListStatusService importListStatusService,
                                    IConfigService configService,
                                    IParsingService parsingService,
                                    Logger logger)
            : base(httpClient, importListStatusService, configService, parsingService, logger)
        {
        }

        public override int PageSize => 100;
        public override bool Enabled => true;
        public override bool EnableAuto => false;
        public override ImportListType ListType => ImportListType.StashDB;
        public override TimeSpan MinRefreshInterval => TimeSpan.FromHours(1);

        // The fetch loop stops at MaxNumResultsPerQuery regardless of the configured limit,
        // so clamp here rather than rejecting larger limits in the settings validator. Stored
        // definitions are revalidated on every sync, so a validation rule would silently drop
        // existing lists out of ImportListFactory.Active() instead of just capping them.
        protected int EffectiveLimit => Math.Min(Settings.Limit, MaxNumResultsPerQuery);

        public override ImportListFetchResult Fetch()
        {
            var result = base.Fetch();

            result.Movies = result.Movies.Take(EffectiveLimit).ToList();

            return result;
        }

        public override IParseImportListResponse GetParser()
        {
            return new StashDBParser();
        }
    }
}
