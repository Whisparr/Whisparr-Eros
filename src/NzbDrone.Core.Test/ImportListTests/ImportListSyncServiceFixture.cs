using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.ImportLists;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.ImportLists.ImportListMovies;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.ImportList
{
      [TestFixture]
      public class ImportListSyncServiceFixture : CoreTest<ImportListSyncService>
      {
            private ImportListFetchResult _importListFetch;
            private List<ImportListMovie> _list1Movies;
            private List<ImportListMovie> _list2Movies;

            private List<Movie> _existingMovies;
            private List<IImportList> _importLists;
            private ImportListSyncCommand _commandAll;
            private ImportListSyncCommand _commandSingle;

            [SetUp]
            public void Setup()
            {
                  _importLists = new List<IImportList>();

                  _list1Movies = Builder<ImportListMovie>.CreateListOfSize(5)
                      .Build().ToList();

                  _existingMovies = Builder<Movie>.CreateListOfSize(3)
                      .TheFirst(1)
                      .With(s => s.ForeignId = "ForeignId6")
                      .With(s => s.ImdbId = "6")
                      .TheNext(1)
                      .With(s => s.ForeignId = "ForeignId7")
                      .With(s => s.ImdbId = "7")
                      .TheNext(1)
                      .With(s => s.ForeignId = "ForeignId8")
                      .With(s => s.ImdbId = "8")
                      .Build().ToList();

                  _list2Movies = Builder<ImportListMovie>.CreateListOfSize(3)
                      .TheFirst(1)
                      .With(s => s.ForeignId = "ForeignId6")
                      .With(s => s.ImdbId = "6")
                      .TheNext(1)
                      .With(s => s.ForeignId = "ForeignId7")
                      .With(s => s.ImdbId = "7")
                      .TheNext(1)
                      .With(s => s.ForeignId = "ForeignId8")
                      .With(s => s.ImdbId = "8")
                      .Build().ToList();

                  _importListFetch = new ImportListFetchResult
                  {
                        Movies = _list1Movies,
                        AnyFailure = false,
                        SyncedLists = 1
                  };

                  _commandAll = new ImportListSyncCommand
                  {
                  };

                  _commandSingle = new ImportListSyncCommand
                  {
                        DefinitionId = 1
                  };

                  Mocker.GetMock<IImportListFactory>()
                        .Setup(v => v.Enabled(It.IsAny<bool>()))
                        .Returns(_importLists);

                  Mocker.GetMock<IImportListExclusionService>()
                        .Setup(v => v.GetAllExclusions())
                        .Returns(new List<ImportListExclusion>());

                  Mocker.GetMock<IMovieService>()
                        .Setup(v => v.MovieExists(It.IsAny<Movie>()))
                        .Returns(false);

                  Mocker.GetMock<IMovieService>()
                        .Setup(v => v.AllMovieForeignIds())
                        .Returns(new List<string>());

                  Mocker.GetMock<IFetchAndParseImportList>()
                        .Setup(v => v.Fetch())
                        .Returns(_importListFetch);
            }

            private void GivenListFailure()
            {
                  _importListFetch.AnyFailure = true;
            }

            private void GivenNoListSync()
            {
                  _importListFetch.SyncedLists = 0;
            }

            private void GivenCleanLevel(string cleanLevel)
            {
                  Mocker.GetMock<IConfigService>()
                        .SetupGet(v => v.ListSyncLevel)
                        .Returns(cleanLevel);
            }

            private void GivenList(int id, bool enabledAuto, HashSet<int> tags = null, bool tagExisting = false)
            {
                  var importListDefinition = new ImportListDefinition
                  {
                        Id = id,
                        EnableAuto = enabledAuto,
                        TagExisting = tagExisting,
                        Tags = tags ?? new HashSet<int>()
                  };

                  Mocker.GetMock<IImportListFactory>()
                        .Setup(v => v.Get(id))
                        .Returns(importListDefinition);

                  CreateListResult(id, enabledAuto);
            }

            private void GivenExistingMovie(string foreignId, HashSet<int> tags, string studioForeignId = null, params string[] performerForeignIds)
            {
                  var movie = new Movie
                  {
                        Id = 1,
                        ForeignId = foreignId,
                        Title = foreignId,
                        Tags = tags
                  };

                  movie.MovieMetadata.Value.StudioForeignId = studioForeignId;
                  movie.MovieMetadata.Value.PerformerForeignIds = performerForeignIds.ToList();

                  Mocker.GetMock<IMovieService>()
                        .Setup(v => v.AllMovieForeignIds())
                        .Returns(new List<string> { foreignId });

                  Mocker.GetMock<IMovieService>()
                        .Setup(v => v.FindByForeignIds(It.Is<List<string>>(ids => ids.Contains(foreignId))))
                        .Returns(new List<Movie> { movie });
            }

            private Mock<IImportList> CreateListResult(int id, bool enabledAuto)
            {
                  var importListDefinition = new ImportListDefinition { Id = id, EnableAuto = enabledAuto };

                  var mockImportList = new Mock<IImportList>();
                  mockImportList.SetupGet(s => s.Definition).Returns(importListDefinition);
                  mockImportList.SetupGet(s => s.Enabled).Returns(true);
                  mockImportList.SetupGet(s => s.EnableAuto).Returns(enabledAuto);

                  _importLists.Add(mockImportList.Object);

                  return mockImportList;
            }

            [Test]
            public void should_not_clean_library_if_config_value_disable()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  GivenList(1, true);
                  GivenCleanLevel("disabled");

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.GetAllMovies(), Times.Never());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(new List<Movie>(), true), Times.Never());
            }

            [Test]
            public void should_not_clean_library_or_process_movies_if_no_synced_lists()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  GivenList(1, true);
                  GivenCleanLevel("logOnly");
                  GivenNoListSync();

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.GetAllMovies(), Times.Never());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(new List<Movie>(), true), Times.Never());

                  Mocker.GetMock<IImportListExclusionService>()
                        .Verify(v => v.GetAllExclusions(), Times.Never);
            }

            [Test]
            public void should_log_only_on_clean_library_if_config_value_logonly()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  GivenList(1, true);
                  GivenCleanLevel("logOnly");

                  Mocker.GetMock<IMovieService>()
                        .Setup(v => v.GetAllMovies())
                        .Returns(_existingMovies);

                  Mocker.GetMock<IImportListMovieService>()
                      .Setup(v => v.GetAllListMovies())
                      .Returns(_list1Movies);

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.GetAllMovies(), Times.Once());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.DeleteMovie(It.IsAny<int>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Never());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(new List<Movie>(), true), Times.Once());
            }

            [Test]
            public void should_unmonitor_on_clean_library_if_config_value_keepAndUnmonitor()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  GivenList(1, true);
                  GivenCleanLevel("keepAndUnmonitor");

                  Mocker.GetMock<IMovieService>()
                        .Setup(v => v.GetAllMovies())
                        .Returns(_existingMovies);

                  Mocker.GetMock<IImportListMovieService>()
                      .Setup(v => v.GetAllListMovies())
                      .Returns(_list1Movies);

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.GetAllMovies(), Times.Once());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.DeleteMovie(It.IsAny<int>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Never());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(It.Is<List<Movie>>(s => s.Count == 3 && s.All(m => !m.Monitored)), true), Times.Once());
            }

            [Test]
            public void should_not_clean_on_clean_library_if_tmdb_match()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies[0].ForeignId = "ForeignId6";

                  GivenList(1, true);
                  GivenCleanLevel("keepAndUnmonitor");

                  Mocker.GetMock<IMovieService>()
                        .Setup(v => v.GetAllMovies())
                        .Returns(_existingMovies);

                  Mocker.GetMock<IImportListMovieService>()
                      .Setup(v => v.GetAllListMovies())
                      .Returns(_list1Movies);

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(It.Is<List<Movie>>(s => s.Count == 2 && s.All(m => !m.Monitored)), true), Times.Once());
            }

            [Test]
            public void should_delete_movies_not_files_on_clean_library_if_config_value_logonly()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  GivenList(1, true);
                  GivenCleanLevel("removeAndKeep");

                  Mocker.GetMock<IMovieService>()
                        .Setup(v => v.GetAllMovies())
                        .Returns(_existingMovies);

                  Mocker.GetMock<IImportListMovieService>()
                      .Setup(v => v.GetAllListMovies())
                      .Returns(_list1Movies);

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.GetAllMovies(), Times.Once());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.DeleteMovie(It.IsAny<int>(), false, It.IsAny<bool>()), Times.Exactly(3));

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.DeleteMovie(It.IsAny<int>(), true, It.IsAny<bool>()), Times.Never());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(new List<Movie>(), true), Times.Once());
            }

            [Test]
            public void should_delete_movies_and_files_on_clean_library_if_config_value_logonly()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  GivenList(1, true);
                  GivenCleanLevel("removeAndDelete");

                  Mocker.GetMock<IMovieService>()
                        .Setup(v => v.GetAllMovies())
                        .Returns(_existingMovies);

                  Mocker.GetMock<IImportListMovieService>()
                      .Setup(v => v.GetAllListMovies())
                      .Returns(_list1Movies);

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.GetAllMovies(), Times.Once());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.DeleteMovie(It.IsAny<int>(), false, It.IsAny<bool>()), Times.Never());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.DeleteMovie(It.IsAny<int>(), true, It.IsAny<bool>()), Times.Exactly(3));

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(new List<Movie>(), true), Times.Once());
            }

            [Test]
            public void should_not_clean_if_list_failures()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  GivenListFailure();

                  GivenList(1, true);
                  GivenCleanLevel("disabled");

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(new List<Movie>(), true), Times.Never());
            }

            [Test]
            public void should_add_new_movies_from_single_list_to_library()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  GivenList(1, true);
                  GivenCleanLevel("disabled");

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IAddMovieService>()
                        .Verify(v => v.AddMovies(It.Is<List<Movie>>(s => s.Count == 5), true), Times.Once());
            }

            [Test]
            public void should_add_new_movies_from_multiple_list_to_library()
            {
                  _list2Movies.ForEach(m => m.ListId = 2);
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies.AddRange(_list2Movies);

                  GivenList(1, true);
                  GivenList(2, true);

                  GivenCleanLevel("disabled");

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IAddMovieService>()
                        .Verify(v => v.AddMovies(It.Is<List<Movie>>(s => s.Count == 8), true), Times.Once());
            }

            [Test]
            public void should_add_new_movies_from_enabled_lists_to_library()
            {
                  _list2Movies.ForEach(m => m.ListId = 2);
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies.AddRange(_list2Movies);

                  GivenList(1, true);
                  GivenList(2, false);

                  GivenCleanLevel("disabled");

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IAddMovieService>()
                        .Verify(v => v.AddMovies(It.Is<List<Movie>>(s => s.Count == 5), true), Times.Once());
            }

            [Test]
            public void should_not_add_duplicate_movies_from_separate_lists()
            {
                  _list2Movies.ForEach(m => m.ListId = 2);
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies.AddRange(_list2Movies);
                  _importListFetch.Movies[0].ForeignId = "ForeignId4";

                  GivenList(1, true);
                  GivenList(2, true);

                  GivenCleanLevel("disabled");

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IAddMovieService>()
                        .Verify(v => v.AddMovies(It.Is<List<Movie>>(s => s.Count == 7), true), Times.Once());
            }

            [Test]
            public void should_not_add_movie_from_on_exclusion_list()
            {
                  _list2Movies.ForEach(m => m.ListId = 2);
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies.AddRange(_list2Movies);

                  GivenList(1, true);
                  GivenList(2, true);

                  GivenCleanLevel("disabled");

                  Mocker.GetMock<IImportListExclusionService>()
                        .Setup(v => v.GetAllExclusions())
                        .Returns(new List<ImportListExclusion> { new ImportListExclusion { ForeignId = _existingMovies[0].ForeignId } });

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IAddMovieService>()
                        .Verify(v => v.AddMovies(It.Is<List<Movie>>(s => s.Count == 7 && s.All(m => m.ForeignId != _existingMovies[0].ForeignId)), true), Times.Once());
            }

            [Test]
            public void should_not_add_movie_that_exists_in_library()
            {
                  _list2Movies.ForEach(m => m.ListId = 2);
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies.AddRange(_list2Movies);

                  GivenList(1, true);
                  GivenList(2, true);

                  GivenCleanLevel("disabled");

                  Mocker.GetMock<IMovieService>()
                       .Setup(v => v.AllMovieForeignIds())
                       .Returns(new List<string> { _existingMovies[0].ForeignId });

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IAddMovieService>()
                        .Verify(v => v.AddMovies(It.Is<List<Movie>>(s => s.Count == 7 && s.All(m => m.ForeignId != _existingMovies[0].ForeignId)), true), Times.Once());
            }

            [Test]
            public void should_not_tag_existing_movie_when_tag_existing_is_disabled()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies[0].ForeignId = "ForeignId6";

                  GivenList(1, true, new HashSet<int> { 3 });
                  GivenCleanLevel("disabled");
                  GivenExistingMovie("ForeignId6", new HashSet<int>());

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.FindByForeignIds(It.IsAny<List<string>>()), Times.Never());

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(It.IsAny<List<Movie>>(), It.IsAny<bool>()), Times.Never());
            }

            [Test]
            public void should_not_tag_existing_movie_when_list_has_no_tags()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies[0].ForeignId = "ForeignId6";

                  GivenList(1, true, new HashSet<int>(), true);
                  GivenCleanLevel("disabled");
                  GivenExistingMovie("ForeignId6", new HashSet<int>());

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.FindByForeignIds(It.IsAny<List<string>>()), Times.Never());
            }

            [Test]
            public void should_tag_existing_movie_when_tag_existing_is_enabled()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies[0].ForeignId = "ForeignId6";

                  GivenList(1, true, new HashSet<int> { 3 }, true);
                  GivenCleanLevel("disabled");
                  GivenExistingMovie("ForeignId6", new HashSet<int> { 1 });

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(It.Is<List<Movie>>(m => m.Count == 1 && m[0].Tags.SetEquals(new[] { 1, 3 })), true), Times.Once());
            }

            [Test]
            public void should_not_update_existing_movie_that_already_has_the_tags()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies[0].ForeignId = "ForeignId6";

                  GivenList(1, true, new HashSet<int> { 3 }, true);
                  GivenCleanLevel("disabled");
                  GivenExistingMovie("ForeignId6", new HashSet<int> { 3 });

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(It.IsAny<List<Movie>>(), It.IsAny<bool>()), Times.Never());
            }

            [Test]
            public void should_tag_the_studio_and_performers_of_an_existing_movie()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies[0].ForeignId = "ForeignId6";

                  GivenList(1, true, new HashSet<int> { 3 }, true);
                  GivenCleanLevel("disabled");
                  GivenExistingMovie("ForeignId6", new HashSet<int>(), "Studio1", "Performer1", "Performer2");

                  Mocker.GetMock<IStudioService>()
                        .Setup(v => v.FindByForeignIds(It.IsAny<List<string>>()))
                        .Returns(new List<Studio> { new Studio { Id = 1, ForeignId = "Studio1", Tags = new HashSet<int>() } });

                  Mocker.GetMock<IPerformerService>()
                        .Setup(v => v.FindByForeignIds(It.IsAny<List<string>>()))
                        .Returns(new List<Performer>
                        {
                              new Performer { Id = 1, ForeignId = "Performer1", Tags = new HashSet<int>() },
                              new Performer { Id = 2, ForeignId = "Performer2", Tags = new HashSet<int> { 3 } }
                        });

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IStudioService>()
                        .Verify(v => v.Update(It.Is<List<Studio>>(s => s.Count == 1 && s[0].Tags.SetEquals(new[] { 3 }))), Times.Once());

                  // Performer2 already carried the tag, so only Performer1 is written back.
                  Mocker.GetMock<IPerformerService>()
                        .Verify(v => v.Update(It.Is<List<Performer>>(p => p.Count == 1 && p[0].ForeignId == "Performer1")), Times.Once());
            }

            [Test]
            public void should_not_look_up_studios_or_performers_when_the_existing_movie_has_none()
            {
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies[0].ForeignId = "ForeignId6";

                  GivenList(1, true, new HashSet<int> { 3 }, true);
                  GivenCleanLevel("disabled");
                  GivenExistingMovie("ForeignId6", new HashSet<int>());

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IStudioService>()
                        .Verify(v => v.FindByForeignIds(It.IsAny<List<string>>()), Times.Never());

                  Mocker.GetMock<IPerformerService>()
                        .Verify(v => v.FindByForeignIds(It.IsAny<List<string>>()), Times.Never());
            }

            [Test]
            public void should_merge_tags_from_every_list_that_matches_an_existing_movie()
            {
                  _list2Movies.ForEach(m => m.ListId = 2);
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies[0].ForeignId = "ForeignId6";
                  _importListFetch.Movies.AddRange(_list2Movies);

                  // ForeignId6 is on both lists: list 2 already carries it out of the box.
                  GivenList(1, true, new HashSet<int> { 3 }, true);
                  GivenList(2, true, new HashSet<int> { 4 }, true);
                  GivenCleanLevel("disabled");
                  GivenExistingMovie("ForeignId6", new HashSet<int>());

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IMovieService>()
                        .Verify(v => v.UpdateMovie(It.Is<List<Movie>>(m => m.Count == 1 && m[0].Tags.SetEquals(new[] { 3, 4 })), true), Times.Once());
            }

            [Test]
            public void should_merge_tags_from_every_list_that_wants_a_new_movie()
            {
                  _list2Movies.ForEach(m => m.ListId = 2);
                  _list2Movies[0].ForeignId = "ForeignId4";
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies.AddRange(_list2Movies);

                  GivenList(1, true, new HashSet<int> { 3 });
                  GivenList(2, true, new HashSet<int> { 4 });
                  GivenCleanLevel("disabled");

                  Subject.Execute(_commandAll);

                  Mocker.GetMock<IAddMovieService>()
                        .Verify(v => v.AddMovies(It.Is<List<Movie>>(s => s.Single(m => m.ForeignId == "ForeignId4").Tags.SetEquals(new[] { 3, 4 })), true), Times.Once());
            }

            [Test]
            public void should_not_mutate_the_import_list_definition_tags()
            {
                  var listTags = new HashSet<int> { 3 };

                  _list2Movies.ForEach(m => m.ListId = 2);
                  _list2Movies[0].ForeignId = "ForeignId4";
                  _importListFetch.Movies.ForEach(m => m.ListId = 1);
                  _importListFetch.Movies.AddRange(_list2Movies);

                  GivenList(1, true, listTags);
                  GivenList(2, true, new HashSet<int> { 4 });
                  GivenCleanLevel("disabled");

                  Subject.Execute(_commandAll);

                  listTags.Should().BeEquivalentTo(new[] { 3 });
            }
      }
}
