using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.RootFolders;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.RootFolderTests
{
    [TestFixture]
    public class ImportFilePagingFixture : DbTest<ImportFileRepository, ImportFile>
    {
        [Test]
        public void should_page_and_filter_the_database_without_loading_other_root_folders()
        {
            Subject.InsertMany(Enumerable.Range(1, 103).Select(i => new ImportFile
            {
                RootFolderId = i <= 101 ? 1 : 2,
                Path = $"/fixture/{i:0000}.mkv",
                Name = "same.mkv",
                RelativePath = $"{i:0000}.mkv"
            }).ToList());
            var spec = new PagingSpec<ImportFile>
            {
                Page = 3, PageSize = 50, SortKey = "relativePath", SortDirection = SortDirection.Ascending,
                DefaultSortKeys = new List<string> { "id" }
            };
            spec.FilterExpressions.Add(file => file.RootFolderId == 1);
            var result = Subject.GetPaged(spec);
            result.TotalRecords.Should().Be(101);
            result.Records.Should().ContainSingle().Which.RelativePath.Should().Be("0101.mkv");
            spec.Page = 1;
            spec.SortDirection = SortDirection.Descending;
            result = Subject.GetPaged(spec);
            result.Records.Should().HaveCount(50);
            result.Records.First().RelativePath.Should().Be("0101.mkv");
            result.Records.Last().RelativePath.Should().Be("0052.mkv");
        }
    }
}
