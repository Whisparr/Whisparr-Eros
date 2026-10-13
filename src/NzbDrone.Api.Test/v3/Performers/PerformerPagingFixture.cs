using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Movies.Performers;
using Whisparr.Api.V3.Performers.Helpers;
using Whisparr.Http;

namespace NzbDrone.Api.Test.v3.Performers
{
    [Parallelizable(ParallelScope.All)]
    public class PerformerPagingFixture
    {
        [TestCase("hidden", PerformerVisibility.Hidden, true)]
        [TestCase("hidden", PerformerVisibility.Visible, false)]
        [TestCase("visible", PerformerVisibility.Visible, true)]
        public void should_filter_on_visibility(string value, PerformerVisibility visibility, bool matches)
        {
            var pageSpec = new PagingSpec<Performer>();
            var filters = new List<PerformerFilterResource>
            {
                new() { Key = "visibility", Type = "equal", Value = JsonDocument.Parse($"[\"{value}\"]").RootElement }
            };

            Paging.ApplyPerformerFiltersToPagingSpec(filters, pageSpec);

            pageSpec.FilterExpressions.Should().ContainSingle();
            pageSpec.FilterExpressions.Single().Compile()(new Performer { Visibility = visibility }).Should().Be(matches);
        }
    }
}
