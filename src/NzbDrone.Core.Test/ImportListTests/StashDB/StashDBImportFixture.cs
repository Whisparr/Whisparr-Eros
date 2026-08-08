using System;
using System.Collections.Generic;
using System.Linq;
using DryIoc;
using FluentAssertions;
using Moq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using NzbDrone.Common.Cloud;
using NzbDrone.Common.Http;
using NzbDrone.Core.ImportLists;
using NzbDrone.Core.ImportLists.StashDB;
using NzbDrone.Core.ImportLists.StashDB.Favorite;
using NzbDrone.Core.ImportLists.StashDB.Performer;
using NzbDrone.Core.ImportLists.StashDB.Studio;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.ImportListTests.StashDB
{
    [TestFixture]
    public class StashDBImportFixture : CoreTest
    {
        private const int PageSize = 100;
        private const int MaxResultsPerQuery = 1000;

        private List<int> _requestedPages;
        private int _reportedCount;

        [SetUp]
        public void Setup()
        {
            _requestedPages = new List<int>();

            Mocker.GetMock<IWhisparrCloudRequestBuilder>()
                .SetupGet(v => v.StashDB)
                .Returns(new HttpRequestBuilder("https://stashdb.org/graphql").CreateFactory());

            Mocker.GetMock<IHttpClient>()
                .Setup(v => v.Execute(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(CreateResponse);
        }

        [TestCase(typeof(StashDBFavoriteImport), 500, 1, new[] { 1, 1 })]
        [TestCase(typeof(StashDBFavoriteImport), 500, 100, new[] { 1, 1 })]
        [TestCase(typeof(StashDBFavoriteImport), 500, 101, new[] { 1, 1, 2 })]
        [TestCase(typeof(StashDBPerformerImport), 500, 101, new[] { 1, 1, 2 })]
        [TestCase(typeof(StashDBStudioImport), 500, 101, new[] { 1, 1, 2 })]
        [TestCase(typeof(StashDBTagsImport), 500, 101, new[] { 1, 1, 2 })]
        [TestCase(typeof(StashDBFavoriteImport), 200, 1000, new[] { 1, 1, 2 })]
        [TestCase(typeof(StashDBPerformerImport), 200, 1000, new[] { 1, 1, 2 })]
        [TestCase(typeof(StashDBStudioImport), 200, 1000, new[] { 1, 1, 2 })]
        [TestCase(typeof(StashDBTagsImport), 200, 1000, new[] { 1, 1, 2 })]
        [TestCase(typeof(StashDBFavoriteImport), 2000, 1500, new[] { 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 })]
        [TestCase(typeof(StashDBTagsImport), 2000, 50000, new[] { 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 })]
        public void should_fetch_only_enough_pages_and_respect_limit(Type importType, int reportedCount, int limit, int[] expectedPages)
        {
            _reportedCount = reportedCount;

            var import = (IImportList)Mocker.Container.Resolve(importType);
            var definition = (ImportListDefinition)import.DefaultDefinitions.Single();
            ConfigureSettings(definition.Settings, limit);
            import.Definition = definition;

            var result = import.Fetch();
            var expectedCount = Math.Min(Math.Min(reportedCount, limit), MaxResultsPerQuery);
            var expectedStashIds = Enumerable.Range(1, expectedCount).Select(index => $"scene-{index}");

            result.AnyFailure.Should().BeFalse();
            result.Movies.Should().HaveCount(expectedCount);
            result.Movies.Select(movie => movie.StashId).Should().Equal(expectedStashIds);
            result.Movies.Select(movie => movie.StashId).Should().OnlyHaveUniqueItems();
            _requestedPages.Should().Equal(expectedPages);
        }

        private HttpResponse CreateResponse(HttpRequest request)
        {
            var page = GetPage(request);
            _requestedPages.Add(page);

            var firstScene = ((page - 1) * PageSize) + 1;
            var sceneCount = Math.Min(PageSize, Math.Max(0, _reportedCount - firstScene + 1));
            var scenes = Enumerable.Range(firstScene, sceneCount)
                .Select(index => new Scene
                {
                    Id = $"scene-{index}",
                    Title = $"Scene {index}"
                })
                .ToList();

            var response = JsonConvert.SerializeObject(new QueryScenesResult
            {
                Data = new QuerySceneData
                {
                    QueryScenes = new QueryScene
                    {
                        Count = _reportedCount,
                        Scenes = scenes
                    }
                }
            });

            return new HttpResponse(request, new HttpHeader(), response);
        }

        private static int GetPage(HttpRequest request)
        {
            var variables = request.Url.Query
                .Split('&')
                .Select(parameter => parameter.Split(new[] { '=' }, 2))
                .Where(parts => Uri.UnescapeDataString(parts[0]) == "variables")
                .Select(parts => Uri.UnescapeDataString(parts[1]))
                .Single();

            return JObject.Parse(variables)["input"]["page"].Value<int>();
        }

        private static void ConfigureSettings(object settings, int limit)
        {
            switch (settings)
            {
                case StashDBFavoriteSettings favoriteSettings:
                    SetCommonSettings(favoriteSettings, limit);
                    break;
                case StashDBPerformerSettings performerSettings:
                    SetCommonSettings(performerSettings, limit);
                    performerSettings.Performers = "performer-id";
                    break;
                case StashDBStudioSettings studioSettings:
                    SetCommonSettings(studioSettings, limit);
                    studioSettings.Studios = "studio-id";
                    break;
                case StashDBTagsSettings tagsSettings:
                    SetCommonSettings(tagsSettings, limit);
                    break;
                default:
                    throw new ArgumentException($"Unsupported StashDB settings type: {settings.GetType().Name}", nameof(settings));
            }
        }

        private static void SetCommonSettings<TSettings>(StashDBSettingsBase<TSettings> settings, int limit)
            where TSettings : StashDBSettingsBase<TSettings>
        {
            settings.ApiKey = "api-key";
            settings.Limit = limit;
        }
    }
}
