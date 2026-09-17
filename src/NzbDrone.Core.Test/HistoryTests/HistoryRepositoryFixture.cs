using System;
using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.History;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.HistoryTests
{
    [TestFixture]
    public class HistoryRepositoryFixture : DbTest<HistoryRepository, MovieHistory>
    {
        [Test]
        public void should_read_write_dictionary()
        {
            var history = Builder<MovieHistory>.CreateNew()
                .With(c => c.Quality = new QualityModel())
                .With(c => c.Languages = new List<Language>())
                .BuildNew();

            history.Data.Add("key1", "value1");
            history.Data.Add("key2", "value2");

            Subject.Insert(history);

            StoredModel.Data.Should().HaveCount(2);
        }

        [Test]
        public void should_get_download_history()
        {
            var historyBluray = Builder<MovieHistory>.CreateNew()
                .With(c => c.Quality = new QualityModel(Quality.Bluray1080p))
                .With(c => c.Languages = new List<Language> { Language.English })
                .With(c => c.MovieId = 12)
                .With(c => c.EventType = MovieHistoryEventType.Grabbed)
                .BuildNew();

            var historyDvd = Builder<MovieHistory>.CreateNew()
                .With(c => c.Quality = new QualityModel(Quality.DVD))
                .With(c => c.Languages = new List<Language> { Language.English })
                .With(c => c.MovieId = 12)
                .With(c => c.EventType = MovieHistoryEventType.Grabbed)
             .BuildNew();

            Subject.Insert(historyBluray);
            Subject.Insert(historyDvd);

            var downloadHistory = Subject.FindDownloadHistory(12, new QualityModel(Quality.Bluray1080p));

            downloadHistory.Should().HaveCount(1);
        }

        [Test]
        public void should_find_all_history_for_a_movie_newest_first()
        {
            var history = Builder<MovieHistory>.CreateListOfSize(3)
                .All()
                .With(c => c.Id = 0)
                .With(c => c.Quality = new QualityModel())
                .With(c => c.Languages = new List<Language>())
                .TheFirst(1)
                .With(c => c.MovieId = 12)
                .With(c => c.EventType = MovieHistoryEventType.Grabbed)
                .With(c => c.Date = DateTime.UtcNow.AddDays(-2))
                .TheNext(1)
                .With(c => c.MovieId = 12)
                .With(c => c.EventType = MovieHistoryEventType.DownloadFailed)
                .With(c => c.Date = DateTime.UtcNow.AddDays(-1))
                .TheNext(1)
                .With(c => c.MovieId = 13)
                .BuildList();

            Subject.InsertMany(history);

            var found = Subject.FindByMovieId(12);

            found.Should().HaveCount(2);
            found.Select(h => h.EventType).Should().Equal(MovieHistoryEventType.DownloadFailed, MovieHistoryEventType.Grabbed);
        }
    }
}
