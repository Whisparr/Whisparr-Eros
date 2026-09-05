using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Lifecycle;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MediaCoverTests
{
    [TestFixture]
    public class MediaCoverServiceFixture : CoreTest<MediaCoverService>
    {
        private const string RemoteUrl = "https://stashdb.org/images/e9be2754-f9de-4db7-8cac-a64afd2a5126";

        private Movie _movie;

        [SetUp]
        public void Setup()
        {
            Mocker.SetConstant<IAppFolderInfo>(new AppFolderInfo(Mocker.Resolve<IStartupContext>()));

            _movie = Builder<Movie>.CreateNew()
                .With(v => v.Id = 2)
                .With(v => v.MovieMetadata.Value.Images = new List<MediaCover.MediaCover> { new MediaCover.MediaCover(MediaCoverTypes.Poster, "") })
                .Build();

            Mocker.GetMock<IMovieService>().Setup(m => m.GetMovie(It.Is<int>(id => id == _movie.Id))).Returns(_movie);
        }

        [TearDown]
        public void TearDown()
        {
            (Subject as IHandle<ApplicationShutdownRequested>)?.Handle(new ApplicationShutdownRequested());
        }

        // The remote URL's hash, truncated the same way MediaCoverService truncates it.
        private static string ExpectedHash => RemoteUrl.SHA256Hash()[..20];

        private static Movie GivenMovie(int id, string remoteUrl = RemoteUrl)
        {
            return Builder<Movie>.CreateNew()
                .With(v => v.Id = id)
                .With(v => v.MovieMetadata.Value.Images = new List<MediaCover.MediaCover>
                {
                    new (MediaCoverTypes.Poster, remoteUrl)
                })
                .Build();
        }

        private static List<MediaCover.MediaCover> GivenCovers(string remoteUrl = RemoteUrl)
        {
            return new List<MediaCover.MediaCover>
            {
                new () { CoverType = MediaCoverTypes.Banner, RemoteUrl = remoteUrl }
            };
        }

        [Test]
        public void should_convert_cover_urls_to_local()
        {
            var covers = GivenCovers();

            Subject.ConvertToLocalUrls(12, covers);

            covers.Single().Url.Should().Be($"/MediaCover/movie/12/banner.jpg?h={ExpectedHash}");
        }

        [Test]
        public void should_convert_performer_cover_urls_to_local()
        {
            var covers = GivenCovers();

            Subject.ConvertToLocalPerformerUrls(12, covers);

            covers.Single().Url.Should().Be($"/MediaCover/performer/12/banner.jpg?h={ExpectedHash}");
        }

        [Test]
        public void should_convert_studio_cover_urls_to_local()
        {
            var covers = GivenCovers();

            Subject.ConvertToLocalStudioUrls(12, covers);

            covers.Single().Url.Should().Be($"/MediaCover/studio/12/banner.jpg?h={ExpectedHash}");
        }

        [Test]
        public void should_convert_media_urls_to_local_without_a_hash_when_there_is_no_remote_url()
        {
            var covers = GivenCovers(null);

            Subject.ConvertToLocalUrls(12, covers);

            covers.Single().Url.Should().Be("/MediaCover/movie/12/banner.jpg");
        }

        [Test]
        public void should_not_touch_disk_to_build_movie_cover_urls()
        {
            Subject.ConvertToLocalUrls(12, GivenCovers());

            Mocker.GetMock<IDiskProvider>().Verify(v => v.GetFileInfo(It.IsAny<string>()), Times.Never());
            Mocker.GetMock<IDiskProvider>().Verify(v => v.FileGetLastWrite(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_not_create_the_studio_folder_while_building_urls()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FolderExists(It.IsAny<string>()))
                  .Returns(false);

            Subject.ConvertToLocalStudioUrls(12, GivenCovers());

            Mocker.GetMock<IDiskProvider>().Verify(v => v.CreateFolder(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_give_two_covers_of_the_same_type_distinct_urls()
        {
            var covers = new List<MediaCover.MediaCover>
            {
                new () { CoverType = MediaCoverTypes.Screenshot, RemoteUrl = "https://stashdb.org/images/bac219ec-204e-4d7c-8909-5f258d7ed218" },
                new () { CoverType = MediaCoverTypes.Screenshot, RemoteUrl = "https://stashdb.org/images/6b073398-6ffc-4690-8bfd-ae160ecc214e" }
            };

            Subject.ConvertToLocalUrls(12, covers);

            covers[0].Url.Should().NotBe(covers[1].Url);
        }

        [Test]
        public void should_change_the_url_when_the_remote_url_changes()
        {
            var before = GivenCovers();
            var after = GivenCovers("https://stashdb.org/images/6b073398-6ffc-4690-8bfd-ae160ecc214e");

            Subject.ConvertToLocalUrls(12, before);
            Subject.ConvertToLocalUrls(12, after);

            after.Single().Url.Should().NotBe(before.Single().Url);
        }

        [Test]
        public void should_queue_movie_updates_without_blocking_event_intake()
        {
            var coverStarted = new ManualResetEventSlim();
            var releaseCover = new ManualResetEventSlim();
            var handler = Subject as IHandle<MovieUpdatedEvent>;
            var lifecycle = Subject as IHandle<ApplicationStartedEvent>;

            handler.Should().NotBeNull();
            lifecycle.Should().NotBeNull();

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback(() =>
                  {
                      coverStarted.Set();
                      releaseCover.Wait();
                  })
                  .Returns(true);

            lifecycle.Handle(new ApplicationStartedEvent());

            var intake = Task.Run(() => handler.Handle(new MovieUpdatedEvent(_movie)));

            try
            {
                coverStarted.Wait(1000).Should().BeTrue();
                intake.Wait(1000).Should().BeTrue();
            }
            finally
            {
                releaseCover.Set();
            }
        }

        [Test]
        public void should_coalesce_pending_movie_updates_and_process_the_latest_movie()
        {
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            var workersStarted = new CountdownEvent(workerCount);
            var completed = new CountdownEvent(workerCount + 1);
            var releaseCovers = new ManualResetEventSlim();
            var processedUrls = new List<string>();
            var startedCalls = 0;
            var handler = (IHandle<MovieUpdatedEvent>)Subject;

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback<string, string>((remoteUrl, _) =>
                  {
                      lock (processedUrls)
                      {
                          processedUrls.Add(remoteUrl);
                      }

                      if (Interlocked.Increment(ref startedCalls) <= workerCount)
                      {
                          workersStarted.Signal();
                          releaseCovers.Wait();
                      }
                  })
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);

            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback(() => completed.Signal());

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < workerCount; i++)
            {
                handler.Handle(new MovieUpdatedEvent(GivenMovie(1000 + i, $"https://example.com/block-{i}")));
            }

            workersStarted.Wait(5000).Should().BeTrue();

            handler.Handle(new MovieUpdatedEvent(GivenMovie(2000, "https://example.com/old")));
            handler.Handle(new MovieUpdatedEvent(GivenMovie(2000, "https://example.com/latest")));
            releaseCovers.Set();

            completed.Wait(15000).Should().BeTrue();

            lock (processedUrls)
            {
                processedUrls.Should().ContainSingle(v => v == "https://example.com/latest");
                processedUrls.Should().NotContain(v => v == "https://example.com/old");
            }
        }

        [Test]
        public void should_preserve_handler_entry_order_when_full_queue_waiters_resume_in_reverse()
        {
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            var workersStarted = new CountdownEvent(workerCount);
            var releaseInitialWorkers = new ManualResetEventSlim();
            var releaseSecondWave = new ManualResetEventSlim();
            var oldWaiterAcquiredSlot = new ManualResetEventSlim();
            var releaseOldWaiter = new ManualResetEventSlim();
            var newestCompleted = new ManualResetEventSlim();
            var completedUrl = string.Empty;

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback<string, string>((remoteUrl, _) =>
                  {
                      if (remoteUrl.StartsWith("https://example.com/initial-block-"))
                      {
                          workersStarted.Signal();
                          releaseInitialWorkers.Wait();
                      }
                      else if (remoteUrl.StartsWith("https://example.com/second-block-"))
                      {
                          releaseSecondWave.Wait();
                      }
                  })
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);
            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback<MediaCoversUpdatedEvent>(message =>
                  {
                      if (message.Movie.Id == 9000)
                      {
                          completedUrl = message.Movie.MovieMetadata.Value.Images.Single().RemoteUrl;
                          newestCompleted.Set();
                      }
                  });

            Subject.MovieCoverQueueTest.SlotAcquired = (movie, _) =>
            {
                if (movie.MovieMetadata.Value.Images.Single().RemoteUrl == "https://example.com/old-waiter")
                {
                    oldWaiterAcquiredSlot.Set();
                    releaseOldWaiter.Wait();
                }
            };

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < workerCount; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(1000 + i, $"https://example.com/initial-block-{i}")));
            }

            workersStarted.Wait(5000).Should().BeTrue();

            for (var i = 0; i < MediaCoverService.MovieCoverQueueCapacity; i++)
            {
                var url = i < workerCount ? $"https://example.com/second-block-{i}" : $"https://example.com/queued-{i}";
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(2000 + i, url)));
            }

            var older = Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(9000, "https://example.com/old-waiter"))));
            SpinWait.SpinUntil(() => Subject.MovieCoverQueueTest.BlockedProducerCount == 1, 5000).Should().BeTrue();
            var newer = Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(9000, "https://example.com/new-waiter"))));
            SpinWait.SpinUntil(() => Subject.MovieCoverQueueTest.BlockedProducerCount == 2, 5000).Should().BeTrue();

            releaseInitialWorkers.Set();
            oldWaiterAcquiredSlot.Wait(5000).Should().BeTrue();
            releaseSecondWave.Set();
            newer.Wait(5000).Should().BeTrue();
            releaseOldWaiter.Set();
            older.Wait(5000).Should().BeTrue();

            newestCompleted.Wait(15000).Should().BeTrue();
            completedUrl.Should().Be("https://example.com/new-waiter");
        }

        [Test]
        public void should_skip_an_older_producer_after_the_latest_update_has_been_dequeued()
        {
            const int movieId = 12000;
            var oldProducerAcquiredSlot = new ManualResetEventSlim();
            var releaseOldProducer = new ManualResetEventSlim();
            var latestCompleted = new ManualResetEventSlim();
            var completions = new ConcurrentQueue<string>();

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);
            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback<MediaCoversUpdatedEvent>(message =>
                  {
                      if (message.Movie.Id == movieId)
                      {
                          var remoteUrl = message.Movie.MovieMetadata.Value.Images.Single().RemoteUrl;
                          completions.Enqueue(remoteUrl);

                          if (remoteUrl == "https://example.com/latest")
                          {
                              latestCompleted.Set();
                          }
                      }
                  });

            Subject.MovieCoverQueueTest.SlotAcquired = (movie, _) =>
            {
                if (movie.Id == movieId && movie.MovieMetadata.Value.Images.Single().RemoteUrl == "https://example.com/old")
                {
                    oldProducerAcquiredSlot.Set();
                    releaseOldProducer.Wait();
                }
            };

            Subject.Handle(new ApplicationStartedEvent());
            var oldProducer = Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(movieId, "https://example.com/old"))));
            oldProducerAcquiredSlot.Wait(5000).Should().BeTrue();

            Subject.Handle(new MovieUpdatedEvent(GivenMovie(movieId, "https://example.com/latest")));
            latestCompleted.Wait(5000).Should().BeTrue();

            releaseOldProducer.Set();
            oldProducer.Wait(5000).Should().BeTrue();
            Thread.Sleep(200);

            completions.Should().Equal("https://example.com/latest");
        }

        [Test]
        public void should_drop_a_queued_movie_cover_when_the_movie_is_deleted()
        {
            const int deletedMovieId = 12200;
            const int survivorMovieId = 12201;
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            var workersStarted = new CountdownEvent(workerCount);
            var releaseWorkers = new ManualResetEventSlim();
            var survivorCompleted = new ManualResetEventSlim();
            var deletedMovieProcessed = new ManualResetEventSlim();
            var deletedMovie = GivenMovie(deletedMovieId, "https://example.com/deleted");

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback<string, string>((remoteUrl, _) =>
                  {
                      if (remoteUrl.StartsWith("https://example.com/delete-block-"))
                      {
                          workersStarted.Signal();
                          releaseWorkers.Wait();
                      }
                      else if (remoteUrl == "https://example.com/deleted")
                      {
                          deletedMovieProcessed.Set();
                      }
                  })
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(v => v.FileExists(It.IsAny<string>())).Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(v => v.GetFileSize(It.IsAny<string>())).Returns(1000);
            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback<MediaCoversUpdatedEvent>(message =>
                  {
                      if (message.Movie.Id == survivorMovieId)
                      {
                          survivorCompleted.Set();
                      }
                  });

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < workerCount; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(12100 + i, $"https://example.com/delete-block-{i}")));
            }

            workersStarted.Wait(5000).Should().BeTrue();
            Subject.Handle(new MovieUpdatedEvent(deletedMovie));
            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(1);

            Subject.HandleAsync(new MoviesDeletedEvent(new List<Movie> { deletedMovie }, false, false));
            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(0);
            Subject.MovieCoverQueueTest.HasHighWaterSequence(deletedMovieId).Should().BeFalse();

            releaseWorkers.Set();
            Subject.Handle(new MovieUpdatedEvent(GivenMovie(survivorMovieId, "https://example.com/survivor")));

            survivorCompleted.Wait(5000).Should().BeTrue();
            deletedMovieProcessed.IsSet.Should().BeFalse();
        }

        [Test]
        public void should_restore_queue_capacity_after_multiple_queued_movies_are_deleted()
        {
            const int deletedMovieId = 12500;
            const int replacementMovieId = 12600;
            const int deletedMovieCount = 3;
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            var workersStarted = new CountdownEvent(workerCount);
            var releaseWorkers = new ManualResetEventSlim();

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback<string, string>((remoteUrl, _) =>
                  {
                      if (remoteUrl.StartsWith("https://example.com/capacity-block-"))
                      {
                          workersStarted.Signal();
                          releaseWorkers.Wait();
                      }
                  })
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(v => v.FileExists(It.IsAny<string>())).Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(v => v.GetFileSize(It.IsAny<string>())).Returns(1000);

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < workerCount; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(12000 + i, $"https://example.com/capacity-block-{i}")));
            }

            workersStarted.Wait(5000).Should().BeTrue();

            try
            {
                for (var i = 0; i < MediaCoverService.MovieCoverQueueCapacity; i++)
                {
                    Subject.Handle(new MovieUpdatedEvent(GivenMovie(deletedMovieId + i)));
                }

                Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(MediaCoverService.MovieCoverQueueCapacity);
                var deletedMovies = Enumerable.Range(0, deletedMovieCount).Select(i => GivenMovie(deletedMovieId + i)).ToList();
                Subject.HandleAsync(new MoviesDeletedEvent(deletedMovies, false, false));
                Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(MediaCoverService.MovieCoverQueueCapacity - deletedMovieCount);

                var replacements = Enumerable.Range(0, deletedMovieCount)
                                             .Select(i => Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(replacementMovieId + i)))))
                                             .ToArray();

                Task.WaitAll(replacements, 5000).Should().BeTrue();
                Subject.MovieCoverQueueTest.BlockedProducerCount.Should().Be(0);
                Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(MediaCoverService.MovieCoverQueueCapacity);
            }
            finally
            {
                releaseWorkers.Set();
            }
        }

        [Test]
        public void should_reject_a_pre_deletion_producer_after_it_acquires_capacity()
        {
            const int deletedMovieId = 12300;
            const int survivorMovieId = 12301;
            var producerAcquiredSlot = new ManualResetEventSlim();
            var releaseProducer = new ManualResetEventSlim();
            var survivorCompleted = new ManualResetEventSlim();
            var deletedMovieProcessed = new ManualResetEventSlim();
            var deletedMovie = GivenMovie(deletedMovieId, "https://example.com/deleted-in-flight");

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback<string, string>((remoteUrl, _) =>
                  {
                      if (remoteUrl.StartsWith("https://example.com/deleted-in-flight"))
                      {
                          deletedMovieProcessed.Set();
                      }
                  })
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(v => v.FileExists(It.IsAny<string>())).Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(v => v.GetFileSize(It.IsAny<string>())).Returns(1000);
            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback<MediaCoversUpdatedEvent>(message =>
                  {
                      if (message.Movie.Id == survivorMovieId)
                      {
                          survivorCompleted.Set();
                      }
                  });
            Subject.MovieCoverQueueTest.SlotAcquired = (movie, _) =>
            {
                if (movie.Id == deletedMovieId)
                {
                    producerAcquiredSlot.Set();
                    releaseProducer.Wait();
                }
            };

            Subject.Handle(new ApplicationStartedEvent());
            var producer = Task.Run(() => Subject.Handle(new MovieUpdatedEvent(deletedMovie)));
            producerAcquiredSlot.Wait(5000).Should().BeTrue();

            Subject.HandleAsync(new MoviesDeletedEvent(new List<Movie> { deletedMovie }, false, false));
            Subject.Handle(new MovieUpdatedEvent(GivenMovie(deletedMovieId, "https://example.com/deleted-in-flight-after-delete")));
            releaseProducer.Set();
            producer.Wait(5000).Should().BeTrue();

            Subject.Handle(new MovieUpdatedEvent(GivenMovie(survivorMovieId, "https://example.com/survivor-after-delete")));

            survivorCompleted.Wait(5000).Should().BeTrue();
            deletedMovieProcessed.IsSet.Should().BeFalse();
            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(0);
            Subject.MovieCoverQueueTest.HasHighWaterSequence(deletedMovieId).Should().BeFalse();
        }

        [Test]
        public void should_remove_covers_recreated_by_active_work_after_movie_deletion()
        {
            const int deletedMovieId = 12400;
            var coverStarted = new ManualResetEventSlim();
            var releaseCover = new ManualResetEventSlim();
            var coverCompleted = new ManualResetEventSlim();
            var folderPresent = 1;
            var deleteCalls = 0;
            var deletedMovie = GivenMovie(deletedMovieId, "https://example.com/deleted-active");

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback(() =>
                  {
                      coverStarted.Set();
                      releaseCover.Wait();
                      Volatile.Write(ref folderPresent, 1);
                  })
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FolderExists(It.IsAny<string>()))
                  .Returns(() => Volatile.Read(ref folderPresent) == 1);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.DeleteFolder(It.IsAny<string>(), true))
                  .Callback(() =>
                  {
                      Volatile.Write(ref folderPresent, 0);
                      Interlocked.Increment(ref deleteCalls);
                  });
            Mocker.GetMock<IDiskProvider>().Setup(v => v.FileExists(It.IsAny<string>())).Returns(true);
            Mocker.GetMock<IDiskProvider>().Setup(v => v.GetFileSize(It.IsAny<string>())).Returns(1000);
            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback(coverCompleted.Set);

            Subject.Handle(new ApplicationStartedEvent());
            Subject.Handle(new MovieUpdatedEvent(deletedMovie));
            coverStarted.Wait(5000).Should().BeTrue();

            Subject.HandleAsync(new MoviesDeletedEvent(new List<Movie> { deletedMovie }, false, false));
            Volatile.Read(ref folderPresent).Should().Be(0);
            releaseCover.Set();

            coverCompleted.Wait(5000).Should().BeTrue();
            SpinWait.SpinUntil(() => Volatile.Read(ref deleteCalls) >= 2, 5000).Should().BeTrue();
            Volatile.Read(ref folderPresent).Should().Be(0);
            SpinWait.SpinUntil(() => !Subject.MovieCoverQueueTest.HasHighWaterSequence(deletedMovieId), 5000).Should().BeTrue();
        }

        [Test]
        public void should_isolate_slot_hook_failures_without_losing_the_movie_cover_update()
        {
            var completed = new ManualResetEventSlim();

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);
            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback(completed.Set);
            Subject.MovieCoverQueueTest.SlotAcquired = (_, _) => throw new InvalidOperationException("synthetic slot hook failure");

            Subject.Handle(new ApplicationStartedEvent());

            var intake = () => Subject.Handle(new MovieUpdatedEvent(GivenMovie(12100)));
            intake.Should().NotThrow();
            completed.Wait(5000).Should().BeTrue();
            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(0);
        }

        [Test]
        public void should_bound_and_complete_a_large_duplicate_heavy_update_stream()
        {
            const int uniquePendingMovies = 100;
            const int updateCount = 10000;
            const int firstPendingMovieId = 2000;
            var updateRounds = updateCount / uniquePendingMovies;
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            var workersStarted = new CountdownEvent(workerCount);
            var completed = new CountdownEvent(workerCount + uniquePendingMovies);
            var releaseCovers = new ManualResetEventSlim();
            var completionCounts = new ConcurrentDictionary<int, int>();
            var completedUrls = new ConcurrentDictionary<int, string>();
            var expectedUrls = new Dictionary<int, string>();
            var startedCalls = 0;
            var handler = (IHandle<MovieUpdatedEvent>)Subject;

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback(() =>
                  {
                      if (Interlocked.Increment(ref startedCalls) <= workerCount)
                      {
                          workersStarted.Signal();
                          releaseCovers.Wait();
                      }
                  })
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);

            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback<MediaCoversUpdatedEvent>(message =>
                  {
                      completionCounts.AddOrUpdate(message.Movie.Id, 1, (_, count) => count + 1);
                      completedUrls[message.Movie.Id] = message.Movie.MovieMetadata.Value.Images.Single().RemoteUrl;
                      completed.Signal();
                  });

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < workerCount; i++)
            {
                handler.Handle(new MovieUpdatedEvent(GivenMovie(1000 + i)));
            }

            workersStarted.Wait(5000).Should().BeTrue();

            for (var round = 0; round < updateRounds; round++)
            {
                for (var movieOffset = 0; movieOffset < uniquePendingMovies; movieOffset++)
                {
                    var movieId = firstPendingMovieId + movieOffset;
                    var remoteUrl = $"https://example.com/movie-{movieId}/version-{round}";
                    expectedUrls[movieId] = remoteUrl;
                    handler.Handle(new MovieUpdatedEvent(GivenMovie(movieId, remoteUrl)));
                }

                Subject.MovieCoverQueueTest.PendingUniqueCount.Should().BeLessThanOrEqualTo(MediaCoverService.MovieCoverQueueCapacity);
            }

            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(uniquePendingMovies);
            releaseCovers.Set();
            completed.Wait(15000).Should().BeTrue();

            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(0);
            var pendingCompletionCounts = completionCounts.Where(v => v.Key >= firstPendingMovieId).ToDictionary(v => v.Key, v => v.Value);
            pendingCompletionCounts.Should().HaveCount(uniquePendingMovies);
            pendingCompletionCounts.Should().OnlyContain(v => v.Value == 1);

            foreach (var expected in expectedUrls)
            {
                completedUrls.Should().ContainKey(expected.Key).WhoseValue.Should().Be(expected.Value);
            }
        }

        [Test]
        public void should_apply_backpressure_when_the_movie_cover_queue_is_full()
        {
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            var totalUpdates = workerCount + MediaCoverService.MovieCoverQueueCapacity + 1;
            var workersStarted = new CountdownEvent(workerCount);
            var completed = new CountdownEvent(totalUpdates);
            var releaseCovers = new ManualResetEventSlim();
            var startedCalls = 0;
            var activeWorkers = 0;
            var maximumActiveWorkers = 0;
            var handler = (IHandle<MovieUpdatedEvent>)Subject;

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback(() =>
                  {
                      var active = Interlocked.Increment(ref activeWorkers);
                      var observedMaximum = maximumActiveWorkers;

                      while (active > observedMaximum)
                      {
                          var previous = Interlocked.CompareExchange(ref maximumActiveWorkers, active, observedMaximum);
                          if (previous == observedMaximum)
                          {
                              break;
                          }

                          observedMaximum = previous;
                      }

                      if (Interlocked.Increment(ref startedCalls) <= workerCount)
                      {
                          workersStarted.Signal();
                      }

                      releaseCovers.Wait();
                      Interlocked.Decrement(ref activeWorkers);
                  })
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);

            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback(() => completed.Signal());

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < workerCount; i++)
            {
                handler.Handle(new MovieUpdatedEvent(GivenMovie(1000 + i)));
            }

            workersStarted.Wait(5000).Should().BeTrue();

            for (var i = 0; i < MediaCoverService.MovieCoverQueueCapacity; i++)
            {
                handler.Handle(new MovieUpdatedEvent(GivenMovie(2000 + i)));
                Subject.MovieCoverQueueTest.PendingUniqueCount.Should().BeLessThanOrEqualTo(MediaCoverService.MovieCoverQueueCapacity);
            }

            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(MediaCoverService.MovieCoverQueueCapacity);
            var overflowIntake = Task.Run(() => handler.Handle(new MovieUpdatedEvent(GivenMovie(3000))));

            try
            {
                overflowIntake.Wait(200).Should().BeFalse();
            }
            finally
            {
                releaseCovers.Set();
            }

            overflowIntake.Wait(5000).Should().BeTrue();
            completed.Wait(15000).Should().BeTrue();
            maximumActiveWorkers.Should().BeLessThanOrEqualTo(workerCount);
        }

        [Test]
        public void should_release_multiple_overflow_producers_and_recover_capacity_during_normal_processing()
        {
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            var firstWorkersStarted = new CountdownEvent(workerCount);
            var releaseFirstWorkers = new ManualResetEventSlim();
            var firstWaveCompleted = new CountdownEvent(workerCount + MediaCoverService.MovieCoverQueueCapacity + 2);
            var recoveryWorkersStarted = new CountdownEvent(workerCount);
            var releaseRecoveryWorkers = new ManualResetEventSlim();
            var recoveryWaveCompleted = new CountdownEvent(workerCount + MediaCoverService.MovieCoverQueueCapacity);
            var completionCounts = new ConcurrentDictionary<int, int>();
            var completedUrls = new ConcurrentDictionary<int, string>();

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback<string, string>((remoteUrl, _) =>
                  {
                      if (remoteUrl.StartsWith("https://example.com/overflow-block-"))
                      {
                          firstWorkersStarted.Signal();
                          releaseFirstWorkers.Wait();
                      }
                      else if (remoteUrl.StartsWith("https://example.com/recovery-block-"))
                      {
                          recoveryWorkersStarted.Signal();
                          releaseRecoveryWorkers.Wait();
                      }
                  })
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);
            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback<MediaCoversUpdatedEvent>(message =>
                  {
                      completionCounts.AddOrUpdate(message.Movie.Id, 1, (_, count) => count + 1);
                      completedUrls[message.Movie.Id] = message.Movie.MovieMetadata.Value.Images.Single().RemoteUrl;

                      if (message.Movie.Id >= 10000 && message.Movie.Id < 13000)
                      {
                          firstWaveCompleted.Signal();
                      }
                      else if (message.Movie.Id >= 13000 && message.Movie.Id < 15000)
                      {
                          recoveryWaveCompleted.Signal();
                      }
                  });

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < workerCount; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(10000 + i, $"https://example.com/overflow-block-{i}")));
            }

            firstWorkersStarted.Wait(5000).Should().BeTrue();

            for (var i = 0; i < MediaCoverService.MovieCoverQueueCapacity; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(11000 + i, $"https://example.com/overflow-queued-{i}")));
                Subject.MovieCoverQueueTest.PendingUniqueCount.Should().BeLessThanOrEqualTo(MediaCoverService.MovieCoverQueueCapacity);
            }

            var overflow = new List<Task>
            {
                Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(12000, "https://example.com/overflow-duplicate-old"))))
            };
            SpinWait.SpinUntil(() => Subject.MovieCoverQueueTest.BlockedProducerCount == 1, 5000).Should().BeTrue();
            overflow.Add(Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(12001, "https://example.com/overflow-unique")))));
            SpinWait.SpinUntil(() => Subject.MovieCoverQueueTest.BlockedProducerCount == 2, 5000).Should().BeTrue();
            overflow.Add(Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(12000, "https://example.com/overflow-duplicate-latest")))));
            SpinWait.SpinUntil(() => Subject.MovieCoverQueueTest.BlockedProducerCount == 3, 5000).Should().BeTrue();

            overflow.Should().OnlyContain(task => !task.IsCompleted);
            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(MediaCoverService.MovieCoverQueueCapacity);

            releaseFirstWorkers.Set();
            Task.WaitAll(overflow.ToArray(), 5000).Should().BeTrue();
            firstWaveCompleted.Wait(15000).Should().BeTrue();

            Subject.MovieCoverQueueTest.BlockedProducerCount.Should().Be(0);
            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(0);
            completionCounts.Should().ContainKey(12000).WhoseValue.Should().Be(1);
            completionCounts.Should().ContainKey(12001).WhoseValue.Should().Be(1);
            completedUrls.Should().ContainKey(12000).WhoseValue.Should().Be("https://example.com/overflow-duplicate-latest");

            for (var i = 0; i < workerCount; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(13000 + i, $"https://example.com/recovery-block-{i}")));
            }

            recoveryWorkersStarted.Wait(5000).Should().BeTrue();

            for (var i = 0; i < MediaCoverService.MovieCoverQueueCapacity; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(14000 + i, $"https://example.com/recovery-queued-{i}")));
                Subject.MovieCoverQueueTest.PendingUniqueCount.Should().BeLessThanOrEqualTo(MediaCoverService.MovieCoverQueueCapacity);
            }

            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(MediaCoverService.MovieCoverQueueCapacity);
            releaseRecoveryWorkers.Set();
            recoveryWaveCompleted.Wait(15000).Should().BeTrue();
            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(0);

            Subject.Handle(new ApplicationShutdownRequested());
            Subject.MovieCoverQueueTest.WorkerPoolSize.Should().Be(0);
        }

        [Test]
        public void should_return_within_one_overall_deadline_when_a_movie_cover_worker_is_stuck()
        {
            var coverStarted = new ManualResetEventSlim();
            var releaseCover = new ManualResetEventSlim();
            Subject.MovieCoverQueueTest.ShutdownTimeout = TimeSpan.FromMilliseconds(200);

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback(() =>
                  {
                      coverStarted.Set();
                      releaseCover.Wait();
                  })
                  .Returns(true);

            Subject.Handle(new ApplicationStartedEvent());
            Subject.Handle(new MovieUpdatedEvent(GivenMovie(3900)));
            coverStarted.Wait(5000).Should().BeTrue();

            try
            {
                var stopwatch = Stopwatch.StartNew();
                Subject.Handle(new ApplicationShutdownRequested());
                stopwatch.Stop();

                stopwatch.Elapsed.Should().BeLessThan(TimeSpan.FromSeconds(1));
                Subject.MovieCoverQueueTest.WorkerCountAlive.Should().BeGreaterThan(0);
            }
            finally
            {
                releaseCover.Set();
            }

            SpinWait.SpinUntil(() => Subject.MovieCoverQueueTest.WorkerPoolSize == 0, 5000).Should().BeTrue();
            Subject.MovieCoverQueueTest.WorkerCountAlive.Should().Be(0);
        }

        [Test]
        public void should_start_the_movie_cover_worker_pool_only_once()
        {
            var workerCount = MediaCoverService.MovieCoverWorkerCount;

            Subject.Handle(new ApplicationStartedEvent());
            Subject.MovieCoverQueueTest.WorkerPoolSize.Should().Be(workerCount);

            Subject.Handle(new ApplicationShutdownRequested());
            Subject.MovieCoverQueueTest.WorkerPoolSize.Should().Be(0);

            Subject.Handle(new ApplicationStartedEvent());
            Subject.MovieCoverQueueTest.WorkerPoolSize.Should().Be(0);
            Subject.MovieCoverQueueTest.WorkerCountAlive.Should().Be(0);
        }

        [Test]
        public void should_reject_a_delayed_producer_after_shutdown()
        {
            var oldProducerAcquiredSlot = new ManualResetEventSlim();
            var releaseOldProducer = new ManualResetEventSlim();
            var staleMovieProcessed = new ManualResetEventSlim();

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);
            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback<MediaCoversUpdatedEvent>(message =>
                  {
                      if (message.Movie.Id == 3970)
                      {
                          staleMovieProcessed.Set();
                      }
                  });

            Subject.MovieCoverQueueTest.SlotAcquired = (movie, _) =>
            {
                if (movie.Id == 3970)
                {
                    oldProducerAcquiredSlot.Set();
                    releaseOldProducer.Wait();
                }
            };

            Subject.Handle(new ApplicationStartedEvent());
            var oldProducer = Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(3970, "https://example.com/stale-lifecycle"))));
            oldProducerAcquiredSlot.Wait(5000).Should().BeTrue();

            Subject.Handle(new ApplicationShutdownRequested());
            releaseOldProducer.Set();
            oldProducer.Wait(5000).Should().BeTrue();

            staleMovieProcessed.Wait(1000).Should().BeFalse();
            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(0);
            Subject.MovieCoverQueueTest.WorkerPoolSize.Should().Be(0);
            Subject.MovieCoverQueueTest.WorkerCountAlive.Should().Be(0);
        }

        [Test]
        public void should_not_start_a_second_worker_pool_while_shutdown_is_in_progress_or_after_timeout()
        {
            var coverStarted = new ManualResetEventSlim();
            var releaseCover = new ManualResetEventSlim();
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            Subject.MovieCoverQueueTest.ShutdownTimeout = TimeSpan.FromMilliseconds(200);

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback(() =>
                  {
                      coverStarted.Set();
                      releaseCover.Wait();
                  })
                  .Returns(true);

            Subject.Handle(new ApplicationStartedEvent());
            Subject.Handle(new MovieUpdatedEvent(GivenMovie(3950)));
            coverStarted.Wait(5000).Should().BeTrue();

            var shutdown = Task.Run(() => Subject.Handle(new ApplicationShutdownRequested()));
            SpinWait.SpinUntil(() => Subject.MovieCoverQueueTest.Stopping, 5000).Should().BeTrue();
            Subject.Handle(new ApplicationStartedEvent());
            shutdown.Wait(5000).Should().BeTrue();
            Subject.Handle(new ApplicationStartedEvent());

            Subject.MovieCoverQueueTest.WorkerPoolSize.Should().Be(workerCount);
            releaseCover.Set();
            SpinWait.SpinUntil(() => Subject.MovieCoverQueueTest.WorkerPoolSize == 0, 5000).Should().BeTrue();
            Subject.MovieCoverQueueTest.WorkerCountAlive.Should().Be(0);
        }

        [Test]
        public void should_release_all_blocked_overflow_producers_when_shutdown_starts()
        {
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            var workersStarted = new CountdownEvent(workerCount);
            var releaseWorkers = new ManualResetEventSlim();
            Subject.MovieCoverQueueTest.ShutdownTimeout = TimeSpan.FromMilliseconds(200);

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback(() =>
                  {
                      workersStarted.Signal();
                      releaseWorkers.Wait();
                  })
                  .Returns(true);

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < workerCount; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(7000 + i)));
            }

            workersStarted.Wait(5000).Should().BeTrue();

            for (var i = 0; i < MediaCoverService.MovieCoverQueueCapacity; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(7100 + i)));
            }

            var blocked = new[]
            {
                Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(8000, "https://example.com/old-duplicate")))),
                Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(8001)))),
                Task.Run(() => Subject.Handle(new MovieUpdatedEvent(GivenMovie(8000, "https://example.com/new-duplicate"))))
            };

            SpinWait.SpinUntil(() => Subject.MovieCoverQueueTest.BlockedProducerCount == blocked.Length, 5000).Should().BeTrue();

            try
            {
                Subject.Handle(new ApplicationShutdownRequested());
                Task.WaitAll(blocked, 1000).Should().BeTrue();
                Subject.MovieCoverQueueTest.BlockedProducerCount.Should().Be(0);
            }
            finally
            {
                releaseWorkers.Set();
            }
        }

        [Test]
        public void should_abandon_queued_movie_covers_when_shutdown_starts()
        {
            var workerCount = MediaCoverService.MovieCoverWorkerCount;
            var workersStarted = new CountdownEvent(workerCount);
            var activeCompleted = new CountdownEvent(workerCount);
            var releaseWorkers = new ManualResetEventSlim();
            var completedIds = new ConcurrentDictionary<int, int>();
            Subject.MovieCoverQueueTest.ShutdownTimeout = TimeSpan.FromMilliseconds(200);

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback<string, string>((remoteUrl, _) =>
                  {
                      if (remoteUrl.StartsWith("https://example.com/active-"))
                      {
                          workersStarted.Signal();
                          releaseWorkers.Wait();
                      }
                  })
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);
            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback<MediaCoversUpdatedEvent>(message =>
                  {
                      completedIds.AddOrUpdate(message.Movie.Id, 1, (_, count) => count + 1);

                      if (message.Movie.Id >= 4000 && message.Movie.Id < 4000 + workerCount)
                      {
                          activeCompleted.Signal();
                      }
                  });

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < workerCount; i++)
            {
                Subject.Handle(new MovieUpdatedEvent(GivenMovie(4000 + i, $"https://example.com/active-{i}")));
            }

            workersStarted.Wait(5000).Should().BeTrue();
            Subject.Handle(new MovieUpdatedEvent(GivenMovie(4999, "https://example.com/queued")));

            var stopwatch = Stopwatch.StartNew();
            Subject.Handle(new ApplicationShutdownRequested());
            stopwatch.Stop();

            stopwatch.Elapsed.Should().BeLessThan(TimeSpan.FromSeconds(1));
            Subject.MovieCoverQueueTest.PendingUniqueCount.Should().Be(0);

            releaseWorkers.Set();
            activeCompleted.Wait(5000).Should().BeTrue();
            Thread.Sleep(200);

            completedIds.Should().NotContainKey(4999);
        }

        [Test]
        public void should_continue_processing_after_one_movie_completion_event_fails()
        {
            var blockingWorkers = Math.Max(0, MediaCoverService.MovieCoverWorkerCount - 1);
            var blockersStarted = new CountdownEvent(blockingWorkers);
            var releaseBlockers = new ManualResetEventSlim();
            var secondMovieCompleted = new ManualResetEventSlim();
            var completionCounts = new ConcurrentDictionary<int, int>();
            var handler = (IHandle<MovieUpdatedEvent>)Subject;

            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Callback<string, string>((remoteUrl, _) =>
                  {
                      if (remoteUrl.StartsWith("https://example.com/block-"))
                      {
                          blockersStarted.Signal();
                          releaseBlockers.Wait();
                      }
                  })
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);

            Mocker.GetMock<IEventAggregator>()
                  .Setup(v => v.PublishEvent(It.IsAny<MediaCoversUpdatedEvent>()))
                  .Callback<MediaCoversUpdatedEvent>(message =>
                  {
                      completionCounts.AddOrUpdate(message.Movie.Id, 1, (_, count) => count + 1);

                      if (message.Movie.Id == 5000)
                      {
                          throw new InvalidOperationException("synthetic completion failure");
                      }

                      if (message.Movie.Id == 5001)
                      {
                          secondMovieCompleted.Set();
                      }
                  });

            Subject.Handle(new ApplicationStartedEvent());

            for (var i = 0; i < blockingWorkers; i++)
            {
                handler.Handle(new MovieUpdatedEvent(GivenMovie(6000 + i, $"https://example.com/block-{i}")));
            }

            blockersStarted.Wait(5000).Should().BeTrue();

            try
            {
                handler.Handle(new MovieUpdatedEvent(GivenMovie(5000)));
                handler.Handle(new MovieUpdatedEvent(GivenMovie(5001)));

                secondMovieCompleted.Wait(5000).Should().BeTrue();
                completionCounts.Should().ContainKey(5000).WhoseValue.Should().Be(1);
                completionCounts.Should().ContainKey(5001).WhoseValue.Should().Be(1);
            }
            finally
            {
                releaseBlockers.Set();
            }
        }

        [Test]
        public void should_resize_covers_if_main_downloaded()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(false);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Exactly(2));
        }

        [Test]
        public void should_resize_covers_if_missing()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(false);

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Exactly(2));
        }

        [Test]
        public void should_not_resize_covers_if_exists()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(1000);

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Never());
        }

        [Test]
        public void should_resize_covers_if_existing_is_empty()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.GetFileSize(It.IsAny<string>()))
                  .Returns(0);

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Exactly(2));
        }

        [Test]
        public void should_log_error_if_resize_failed()
        {
            Mocker.GetMock<ICoverExistsSpecification>()
                  .Setup(v => v.AlreadyExists(It.IsAny<string>(), It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(v => v.FileExists(It.IsAny<string>()))
                  .Returns(false);

            Mocker.GetMock<IImageResizer>()
                  .Setup(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                  .Throws<ApplicationException>();

            Subject.HandleAsync(new MovieUpdatedEvent(_movie));

            Mocker.GetMock<IImageResizer>()
                  .Verify(v => v.Resize(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Exactly(2));
        }
    }
}
