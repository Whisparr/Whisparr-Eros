using System;
using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using FluentValidation.Results;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Tags;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MovieTests
{
    [TestFixture]
    public class AddMoviePerformerAfterDateFixture : CoreTest<AddMovieService>
    {
        private MovieMetadata _fakeMovie;

        [SetUp]
        public void Setup()
        {
            _fakeMovie = Builder<MovieMetadata>
                .CreateNew()
                .With(m => m.ItemType = ItemType.Scene)
                .With(m => m.Studio = null)
                .With(m => m.TagIds = new List<string>())
                .With(m => m.ReleaseDateUtc = new DateTime(2015, 6, 1))
                .With(m => m.PerformerForeignIds = new List<string> { "performer-1", "performer-2" })
                .Build();

            Mocker.GetMock<IProvideMovieInfo>()
                  .Setup(s => s.GetMovieInfo(It.IsAny<int>()))
                  .Returns(new Tuple<MovieMetadata, Studio, List<Performer>, List<Credit>>(_fakeMovie, new Studio(), new List<Performer>(), new List<Credit>()));

            Mocker.GetMock<IBuildFileNames>()
                  .Setup(s => s.GetMovieFolder(It.IsAny<Movie>(), null))
                  .Returns<Movie, NamingConfig>((c, n) => c.Title);

            Mocker.GetMock<IAddMovieValidator>()
                  .Setup(s => s.Validate(It.IsAny<Movie>()))
                  .Returns(new ValidationResult());

            Mocker.GetMock<IImportListExclusionService>()
                  .Setup(s => s.GetAllByType(ImportExclusionType.Performer))
                  .Returns(new List<ImportListExclusion>());
        }

        private static Movie GivenNewMovie()
        {
            return new Movie { ForeignId = "1", TmdbId = 1, RootFolderPath = @"C:\Test\Movies" };
        }

        private void GivenPerformers(params Performer[] performers)
        {
            Mocker.GetMock<IPerformerService>()
                  .Setup(s => s.FindByForeignIds(It.IsAny<List<string>>()))
                  .Returns(new List<Performer>(performers));
        }

        private void GivenExcludeTag(string label)
        {
            Mocker.GetMock<IConfigService>()
                  .SetupGet(s => s.WhisparrAlwaysExcludePerformersAfterTag)
                  .Returns(label);

            Mocker.GetMock<ITagRepository>()
                  .Setup(s => s.FindByLabel(label))
                  .Returns(new Tag { Id = 7, Label = label });
        }

        [Test]
        public void should_exclude_when_any_credited_performer_has_a_later_after_date()
        {
            // A scene has one studio but any number of performers, so a single
            // performer's date is enough to hold it back.
            GivenPerformers(
                new Performer { Id = 1, ForeignId = "performer-1", Name = "Performer 1", AfterDate = new DateTime(2020, 1, 1) },
                new Performer { Id = 2, ForeignId = "performer-2", Name = "Performer 2" });

            Assert.Throws<ExcludedException>(() => Subject.AddMovie(GivenNewMovie()));

            Mocker.GetMock<IImportListExclusionService>()
                  .Verify(s => s.AddExclusion(It.Is<ImportListExclusion>(e => e.Reason == ImportExclusionReason.PerformerAfterDate)), Times.Once());
        }

        [Test]
        public void should_add_when_the_release_is_on_or_after_every_after_date()
        {
            GivenPerformers(
                new Performer { Id = 1, ForeignId = "performer-1", Name = "Performer 1", AfterDate = new DateTime(2015, 6, 1) },
                new Performer { Id = 2, ForeignId = "performer-2", Name = "Performer 2", AfterDate = new DateTime(2010, 1, 1) });

            Subject.AddMovie(GivenNewMovie()).Should().NotBeNull();

            Mocker.GetMock<IImportListExclusionService>()
                  .Verify(s => s.AddExclusion(It.IsAny<ImportListExclusion>()), Times.Never());
        }

        [Test]
        public void should_add_when_no_credited_performer_has_an_after_date()
        {
            GivenPerformers(
                new Performer { Id = 1, ForeignId = "performer-1", Name = "Performer 1" },
                new Performer { Id = 2, ForeignId = "performer-2", Name = "Performer 2" });

            Subject.AddMovie(GivenNewMovie()).Should().NotBeNull();

            Mocker.GetMock<IImportListExclusionService>()
                  .Verify(s => s.AddExclusion(It.IsAny<ImportListExclusion>()), Times.Never());
        }

        [Test]
        public void should_add_when_the_release_date_is_unknown()
        {
            _fakeMovie.ReleaseDateUtc = null;

            GivenPerformers(new Performer { Id = 1, ForeignId = "performer-1", Name = "Performer 1", AfterDate = new DateTime(2020, 1, 1) });

            Subject.AddMovie(GivenNewMovie()).Should().NotBeNull();

            Mocker.GetMock<IImportListExclusionService>()
                  .Verify(s => s.AddExclusion(It.IsAny<ImportListExclusion>()), Times.Never());
        }

        [Test]
        public void should_tag_and_unmonitor_instead_of_excluding_when_the_tag_is_configured()
        {
            GivenExcludeTag("performer-after-date");
            GivenPerformers(new Performer { Id = 1, ForeignId = "performer-1", Name = "Performer 1", AfterDate = new DateTime(2020, 1, 1) });

            var movie = Subject.AddMovie(GivenNewMovie());

            movie.Monitored.Should().BeFalse();
            movie.Tags.Should().Contain(7);

            Mocker.GetMock<IImportListExclusionService>()
                  .Verify(s => s.AddExclusion(It.IsAny<ImportListExclusion>()), Times.Never());
        }

        [Test]
        public void should_not_check_after_dates_when_a_performer_is_already_excluded()
        {
            // An outright performer exclusion is the stronger signal and reports its own
            // reason, so the after date never gets a look in.
            Mocker.GetMock<IImportListExclusionService>()
                  .Setup(s => s.GetAllByType(ImportExclusionType.Performer))
                  .Returns(new List<ImportListExclusion> { new ImportListExclusion { ForeignId = "performer-1" } });

            GivenPerformers(new Performer { Id = 1, ForeignId = "performer-1", Name = "Performer 1", AfterDate = new DateTime(2020, 1, 1) });

            Assert.Throws<ExcludedException>(() => Subject.AddMovie(GivenNewMovie()));

            Mocker.GetMock<IImportListExclusionService>()
                  .Verify(s => s.AddExclusion(It.Is<ImportListExclusion>(e => e.Reason == ImportExclusionReason.PerformerExclusion)), Times.Once());

            Mocker.GetMock<IPerformerService>()
                  .Verify(s => s.FindByForeignIds(It.IsAny<List<string>>()), Times.Never());
        }
    }
}
