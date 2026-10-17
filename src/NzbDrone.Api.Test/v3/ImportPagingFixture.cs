using System;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.RootFolders;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace NzbDrone.Api.Test.v3
{
    [TestFixture]
    public class ImportPagingFixture
    {
        [Test]
        public void should_use_bounded_defaults()
        {
            var spec = ImportPagingRequest.ToSpec<ImportFile>(new PagingRequestResource(), "relativePath");
            spec.Page.Should().Be(1);
            spec.PageSize.Should().Be(50);
            spec.SortDirection.Should().Be(SortDirection.Ascending);
            spec.SortKey.Should().Be("relativePath");
        }

        [TestCase(0, 50)]
        [TestCase(-1, 50)]
        [TestCase(1, 0)]
        [TestCase(1, 201)]
        [TestCase(int.MaxValue, 200)]
        public void should_reject_invalid_bounds(int page, int pageSize)
        {
            Action action = () => ImportPagingRequest.ToSpec<ImportFile>(new PagingRequestResource { Page = page, PageSize = pageSize }, "relativePath");
            action.Should().Throw<BadRequestException>();
        }

        [TestCase("relativePath; DROP TABLE ImportFiles")]
        [TestCase("quality")]
        public void should_reject_unknown_sort_keys(string key)
        {
            Action action = () => ImportPagingRequest.ToSpec<ImportFile>(new PagingRequestResource { SortKey = key }, "relativePath");
            action.Should().Throw<BadRequestException>();
        }

        [Test]
        public void should_reject_unknown_sort_directions()
        {
            var request = new PagingRequestResource { SortDirection = (SortDirection)99 };
            Action action = () => ImportPagingRequest.ToSpec<ImportFile>(request, "relativePath");
            action.Should().Throw<BadRequestException>();
        }

        [Test]
        public void should_honor_requested_order_and_page()
        {
            var request = new PagingRequestResource
            {
                Page = 4,
                PageSize = 200,
                SortKey = "name",
                SortDirection = SortDirection.Descending
            };
            var spec = ImportPagingRequest.ToSpec<ImportFile>(request, "relativePath", "name");
            spec.Page.Should().Be(4);
            spec.PageSize.Should().Be(200);
            spec.SortKey.Should().Be("name");
            spec.SortDirection.Should().Be(SortDirection.Descending);
            spec.DefaultSortKeys.Should().Equal("id");
        }
    }
}
