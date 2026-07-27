using System;
using System.Linq;
using DryIoc;
using FluentAssertions;
using Moq;
using Newtonsoft.Json;
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
        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<IWhisparrCloudRequestBuilder>()
                .SetupGet(v => v.StashDB)
                .Returns(new HttpRequestBuilder("https://stashdb.org/graphql").CreateFactory());

            var scenes = Enumerable.Range(1, 100)
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
                        Count = 500,
                        Scenes = scenes
                    }
                }
            });

            Mocker.GetMock<IHttpClient>()
                .Setup(v => v.Execute(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(request => new HttpResponse(request, new HttpHeader(), response));
        }

        [TestCase(typeof(StashDBFavoriteImport), 1, 1)]
        [TestCase(typeof(StashDBPerformerImport), 1, 1)]
        [TestCase(typeof(StashDBStudioImport), 1, 1)]
        [TestCase(typeof(StashDBTagsImport), 1, 1)]
        [TestCase(typeof(StashDBFavoriteImport), 100, 1)]
        [TestCase(typeof(StashDBFavoriteImport), 101, 2)]
        public void should_fetch_only_enough_pages_and_respect_limit(Type importType, int limit, int expectedPageCount)
        {
            var import = (IImportList)Mocker.Container.Resolve(importType);
            var definition = (ImportListDefinition)import.DefaultDefinitions.Single();
            definition.Settings.GetType().GetProperty(nameof(StashDBFavoriteSettings.ApiKey)).SetValue(definition.Settings, "api-key");
            definition.Settings.GetType().GetProperty(nameof(StashDBFavoriteSettings.Limit)).SetValue(definition.Settings, limit);
            import.Definition = definition;

            var result = import.Fetch();

            result.AnyFailure.Should().BeFalse();
            result.Movies.Should().HaveCount(limit);
            Mocker.GetMock<IHttpClient>()
                .Verify(v => v.Execute(It.IsAny<HttpRequest>()), Times.Exactly(expectedPageCount + 1));
        }
    }
}
