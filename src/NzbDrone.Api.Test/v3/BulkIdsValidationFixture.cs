using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Test.Common;
using NzbDrone.Test.Common.AutoMoq;
using Whisparr.Api.V3.Blocklist;
using Whisparr.Api.V3.CustomFormats;
using Whisparr.Api.V3.ImportLists;
using Whisparr.Api.V3.Indexers;
using Whisparr.Api.V3.MovieFiles;
using Whisparr.Api.V3.Movies;
using Whisparr.Api.V3.Performers;
using Whisparr.Api.V3.Queue;
using Whisparr.Api.V3.Studios;
using Whisparr.Http.REST;

namespace NzbDrone.Api.Test.v3
{
    // Every bulk endpoint must answer a missing or empty id list with a 400. Anything
    // other than Whisparr.Http.REST.BadRequestException (an NRE, ArgumentNullException,
    // or NzbDrone.Core's BadRequestException) falls through WhisparrErrorPipeline as a 500.
    [TestFixture]
    public class BulkIdsValidationFixture : TestBase
    {
        private static readonly (string Endpoint, Action<AutoMoqer, List<int>> Call)[] Endpoints =
        {
            ("PUT /indexer/bulk", (m, ids) => m.Resolve<IndexerController>().UpdateProvider(new IndexerBulkResource { Ids = ids })),
            ("DELETE /indexer/bulk", (m, ids) => m.Resolve<IndexerController>().DeleteProviders(new IndexerBulkResource { Ids = ids })),
            ("PUT /customformat/bulk", (m, ids) => m.Resolve<CustomFormatController>().Update(new CustomFormatBulkResource { Ids = ToSet(ids) })),
            ("DELETE /customformat/bulk", (m, ids) => m.Resolve<CustomFormatController>().DeleteFormats(new CustomFormatBulkResource { Ids = ToSet(ids) })),
            ("DELETE /blocklist/bulk", (m, ids) => m.Resolve<BlocklistController>().Remove(new BlocklistBulkResource { Ids = ids })),
            ("DELETE /exclusions/bulk", (m, ids) => m.Resolve<ImportListExclusionController>().DeleteImportListExclusions(new ImportListExclusionBulkResource { Ids = ToSet(ids) })),
            ("DELETE /queue/bulk", (m, ids) => m.Resolve<QueueController>().RemoveMany(new QueueBulkResource { Ids = ids })),
            ("POST /queue/grab/bulk", (m, ids) => m.Resolve<QueueActionController>().Grab(new QueueBulkResource { Ids = ids }).GetAwaiter().GetResult()),
            ("DELETE /moviefile/bulk", (m, ids) => m.Resolve<MovieFileController>().DeleteMovieFiles(new MovieFileListResource { MovieFileIds = ids })),
            ("PUT /movie/editor", (m, ids) => m.Resolve<MovieEditorController>().SaveAll(new MovieEditorResource { MovieIds = ids })),
            ("DELETE /movie/editor", (m, ids) => m.Resolve<MovieEditorController>().DeleteMovies(new MovieEditorResource { MovieIds = ids })),
            ("PUT /performer/editor", (m, ids) => m.Resolve<PerformerEditorController>().SaveAll(new PerformerEditorResource { PerformerIds = ids })),
            ("DELETE /performer/editor", (m, ids) => m.Resolve<PerformerEditorController>().DeletePerformers(new PerformerEditorResource { PerformerIds = ids })),
            ("PUT /studio/editor", (m, ids) => m.Resolve<StudioEditorController>().SaveAll(new StudioEditorResource { StudioIds = ids })),
        };

        [TestCaseSource(nameof(Cases))]
        public void should_reject_missing_ids_as_bad_request(Action<AutoMoqer, List<int>> call, List<int> ids)
        {
            var act = () => call(Mocker, ids);

            act.Should().Throw<BadRequestException>().Which.Content.Should().BeOfType<string>().Which.Should().EndWith("must be provided");
        }

        private static IEnumerable<TestCaseData> Cases()
        {
            foreach (var (endpoint, call) in Endpoints)
            {
                yield return new TestCaseData(call, null).SetName($"{endpoint} rejects null ids");
                yield return new TestCaseData(call, new List<int>()).SetName($"{endpoint} rejects empty ids");
            }
        }

        private static HashSet<int> ToSet(List<int> ids) => ids?.ToHashSet();
    }
}
