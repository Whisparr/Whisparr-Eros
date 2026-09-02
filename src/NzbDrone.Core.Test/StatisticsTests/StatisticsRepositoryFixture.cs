using System;
using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Credits;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Statistics;
using NzbDrone.Core.Tags;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.StatisticsTests;

[TestFixture]
public class StatisticsRepositoryFixture : DbTest<StatisticsRepository, Movie>
{
    private int _sequence = 1;

    private Movie GivenMovie(bool monitored = true,
                             MovieStatusType status = MovieStatusType.Released,
                             ItemType itemType = ItemType.Movie,
                             int qualityProfileId = 1,
                             string path = null,
                             HashSet<int> tags = null,
                             DateTime? releaseDateUtc = null,
                             string studioForeignId = null,
                             int movieFileId = 0)
    {
        var n = _sequence++;

        var metadata = Db.Insert(Builder<MovieMetadata>.CreateNew()
            .With(m => m.Id = 0)
            .With(m => m.ForeignId = $"foreign-{n}")
            .With(m => m.Title = $"Title {n}")
            .With(m => m.Status = status)
            .With(m => m.ItemType = itemType)
            .With(m => m.Year = 2020)
            .With(m => m.ReleaseDateUtc = releaseDateUtc ?? DateTime.UtcNow.AddDays(-1))
            .With(m => m.StudioForeignId = studioForeignId)
            .BuildNew());

        var movie = Builder<Movie>.CreateNew()
            .With(m => m.Id = 0)
            .With(m => m.MovieMetadataId = metadata.Id)
            .With(m => m.Monitored = monitored)
            .With(m => m.QualityProfileId = qualityProfileId)
            .With(m => m.Path = (path ?? $"/movies/Title {n}").AsOsAgnostic())
            .With(m => m.Tags = tags ?? new HashSet<int>())
            .With(m => m.MovieFileId = movieFileId)
            .BuildNew();

        movie.Id = Db.Insert(movie).Id;
        movie.MovieMetadataId = metadata.Id;

        return movie;
    }

    // The per-file queries join MovieFiles on MovieId, while the movie-level counts read
    // Movies.MovieFileId, so a downloaded movie needs both sides linked.
    private MovieFile GivenMovieFile(Movie movie, Quality quality, long size = 1000)
    {
        var movieFile = Db.Insert(Builder<MovieFile>.CreateNew()
            .With(f => f.Id = 0)
            .With(f => f.MovieId = movie.Id)
            .With(f => f.Quality = new QualityModel(quality))
            .With(f => f.Size = size)
            .With(f => f.Languages = new List<Language> { Language.English })
            .BuildNew());

        movie.MovieFileId = movieFile.Id;
        Mocker.Resolve<MovieRepository>().Update(movie);

        return movieFile;
    }

    private QualityProfile GivenProfile(string name)
    {
        var profile = new QualityProfile
        {
            Name = name,
            Cutoff = Quality.Bluray1080p.Id,
            Items = Qualities.QualityFixture.GetDefaultQualities()
        };

        return Mocker.Resolve<QualityProfileRepository>().Insert(profile);
    }

    private Tag GivenTag(string label)
    {
        return Mocker.Resolve<TagRepository>().Insert(new Tag { Label = label });
    }

    private Studio GivenStudio(string foreignId, string title)
    {
        return Db.Insert(Builder<Studio>.CreateNew()
            .With(s => s.Id = 0)
            .With(s => s.ForeignId = foreignId)
            .With(s => s.Title = title)
            .With(s => s.Tags = new HashSet<int>())
            .With(s => s.Aliases = new List<string>())
            .BuildNew());
    }

    private Performer GivenPerformer(string foreignId, string name)
    {
        return Db.Insert(Builder<Performer>.CreateNew()
            .With(p => p.Id = 0)
            .With(p => p.ForeignId = foreignId)
            .With(p => p.Name = name)
            .With(p => p.Tags = new HashSet<int>())
            .With(p => p.Aliases = new List<string>())
            .With(p => p.Tattoos = new List<string>())
            .With(p => p.Piercings = new List<string>())
            .With(p => p.Images = new List<MediaCover.MediaCover>())
            .BuildNew());
    }

    private void GivenCredit(Movie movie, string performerForeignId)
    {
        Db.Insert(Builder<Credit>.CreateNew()
            .With(c => c.Id = 0)
            .With(c => c.MovieMetadataId = movie.MovieMetadataId)
            .With(c => c.PerformerForeignId = performerForeignId)
            .With(c => c.PersonName = performerForeignId)
            .BuildNew());
    }

    [Test]
    public void should_count_movies_and_monitored_movies()
    {
        GivenMovie();
        GivenMovie();
        GivenMovie(monitored: false);

        var stats = Subject.GetLibraryStatistics();

        stats.MovieCount.Should().Be(3);
        stats.MonitoredMovieCount.Should().Be(2);
    }

    [Test]
    public void should_count_movies_by_status()
    {
        GivenMovie(status: MovieStatusType.Released);
        GivenMovie(status: MovieStatusType.Released);
        GivenMovie(status: MovieStatusType.Announced);
        GivenMovie(status: MovieStatusType.InCinemas);
        GivenMovie(status: MovieStatusType.TBA);
        GivenMovie(status: MovieStatusType.Deleted);

        var stats = Subject.GetLibraryStatistics();

        stats.ReleasedMovieCount.Should().Be(2);
        stats.AnnouncedMovieCount.Should().Be(1);
        stats.InCinemasMovieCount.Should().Be(1);
        stats.TbaMovieCount.Should().Be(1);
        stats.DeletedMovieCount.Should().Be(1);
    }

    [Test]
    public void should_count_movies_by_item_type()
    {
        GivenMovie(itemType: ItemType.Movie);
        GivenMovie(itemType: ItemType.Scene);
        GivenMovie(itemType: ItemType.Scene);

        var stats = Subject.GetLibraryStatistics();

        stats.MovieItemCount.Should().Be(1);
        stats.SceneItemCount.Should().Be(2);
    }

    [Test]
    public void should_count_downloaded_missing_and_unreleased_movies()
    {
        var downloaded = GivenMovie();
        GivenMovieFile(downloaded, Quality.HDTV720p);

        // Monitored, released, no file yet
        GivenMovie(releaseDateUtc: DateTime.UtcNow.AddDays(-5));

        // Not yet released, so not missing
        GivenMovie(releaseDateUtc: DateTime.UtcNow.AddDays(5));

        // Unmonitored, so not missing either
        GivenMovie(monitored: false, releaseDateUtc: DateTime.UtcNow.AddDays(-5));

        var stats = Subject.GetLibraryStatistics();

        stats.DownloadedMovieCount.Should().Be(1);
        stats.MissingMovieCount.Should().Be(1);
        stats.UnreleasedMovieCount.Should().Be(1);
    }

    [Test]
    public void should_sum_file_count_and_size_on_disk()
    {
        GivenMovieFile(GivenMovie(), Quality.HDTV720p, size: 1500);
        GivenMovieFile(GivenMovie(), Quality.Bluray1080p, size: 2500);

        var stats = Subject.GetLibraryStatistics();

        stats.MovieFileCount.Should().Be(2);
        stats.SizeOnDisk.Should().Be(4000);
    }

    [Test]
    public void should_group_files_by_quality()
    {
        GivenMovieFile(GivenMovie(), Quality.HDTV720p, size: 100);
        GivenMovieFile(GivenMovie(), Quality.HDTV720p, size: 200);
        GivenMovieFile(GivenMovie(), Quality.Bluray1080p, size: 900);

        var stats = Subject.GetLibraryStatistics();

        var hdtv = stats.QualityStatistics.Single(q => q.Quality.Id == Quality.HDTV720p.Id);
        hdtv.MovieFileCount.Should().Be(2);
        hdtv.SizeOnDisk.Should().Be(300);

        var bluray = stats.QualityStatistics.Single(q => q.Quality.Id == Quality.Bluray1080p.Id);
        bluray.MovieFileCount.Should().Be(1);
        bluray.SizeOnDisk.Should().Be(900);
    }

    [Test]
    public void should_group_by_quality_profile_and_keep_empty_profiles()
    {
        var used = GivenProfile("Used");
        var unused = GivenProfile("Unused");

        GivenMovieFile(GivenMovie(qualityProfileId: used.Id), Quality.HDTV720p, size: 700);
        GivenMovie(qualityProfileId: used.Id);

        var stats = Subject.GetLibraryStatistics();

        var usedStats = stats.QualityProfileStatistics.Single(p => p.QualityProfileId == used.Id);
        usedStats.MovieCount.Should().Be(2);
        usedStats.MovieFileCount.Should().Be(1);
        usedStats.SizeOnDisk.Should().Be(700);

        var unusedStats = stats.QualityProfileStatistics.Single(p => p.QualityProfileId == unused.Id);
        unusedStats.MovieCount.Should().Be(0);
        unusedStats.MovieFileCount.Should().Be(0);
    }

    [Test]
    public void should_group_by_tag_and_keep_empty_tags()
    {
        var used = GivenTag("used");
        var unused = GivenTag("unused");

        GivenMovieFile(GivenMovie(tags: new HashSet<int> { used.Id }), Quality.HDTV720p, size: 400);
        GivenMovie(tags: new HashSet<int> { used.Id });
        GivenMovie();

        var stats = Subject.GetLibraryStatistics();

        var usedStats = stats.TagStatistics.Single(t => t.TagId == used.Id);
        usedStats.Label.Should().Be("used");
        usedStats.MovieCount.Should().Be(2);
        usedStats.MovieFileCount.Should().Be(1);
        usedStats.SizeOnDisk.Should().Be(400);

        stats.TagStatistics.Single(t => t.TagId == unused.Id).MovieCount.Should().Be(0);
    }

    [Test]
    public void should_group_by_studio()
    {
        GivenStudio("studio-a", "Studio A");
        GivenStudio("studio-b", "Studio B");

        GivenMovieFile(GivenMovie(studioForeignId: "studio-a"), Quality.HDTV720p, size: 600);
        GivenMovie(studioForeignId: "studio-a");

        var stats = Subject.GetLibraryStatistics();

        var a = stats.StudioStatistics.Single(s => s.StudioForeignId == "studio-a");
        a.Title.Should().Be("Studio A");
        a.MovieCount.Should().Be(2);
        a.MovieFileCount.Should().Be(1);
        a.SizeOnDisk.Should().Be(600);

        // Unlike tags and quality profiles, studios with no movies are dropped rather
        // than returned as empty rows: the breakdown is capped server-side and only
        // the contributing entries are worth sending.
        stats.StudioStatistics.Should().NotContain(s => s.StudioForeignId == "studio-b");
    }

    [Test]
    public void should_group_by_performer()
    {
        GivenPerformer("performer-a", "Performer A");
        GivenPerformer("performer-b", "Performer B");

        var first = GivenMovie();
        GivenMovieFile(first, Quality.HDTV720p, size: 800);
        GivenCredit(first, "performer-a");

        var second = GivenMovie();
        GivenCredit(second, "performer-a");

        var stats = Subject.GetLibraryStatistics();

        var a = stats.PerformerStatistics.Single(p => p.PerformerForeignId == "performer-a");
        a.Name.Should().Be("Performer A");
        a.MovieCount.Should().Be(2);
        a.MovieFileCount.Should().Be(1);
        a.SizeOnDisk.Should().Be(800);

        stats.PerformerStatistics.Should().NotContain(p => p.PerformerForeignId == "performer-b");
    }

    // The cap keeps the biggest contributors, so the ordering has to be by movie count
    // rather than by name.
    [Test]
    public void should_order_studios_by_movie_count()
    {
        GivenStudio("small", "Small Studio");
        GivenStudio("big", "Big Studio");

        GivenMovie(studioForeignId: "small");
        GivenMovie(studioForeignId: "big");
        GivenMovie(studioForeignId: "big");

        var stats = Subject.GetLibraryStatistics();

        stats.StudioStatistics.Select(s => s.StudioForeignId).Should()
             .ContainInOrder("big", "small");
    }

    [Test]
    public void should_filter_by_monitored()
    {
        GivenMovie();
        GivenMovie(monitored: false);

        var stats = Subject.GetLibraryStatistics(new StatisticsFilter { Monitored = true });

        stats.MovieCount.Should().Be(1);
    }

    [Test]
    public void should_filter_by_item_type()
    {
        GivenMovie(itemType: ItemType.Movie);
        GivenMovie(itemType: ItemType.Scene);
        GivenMovie(itemType: ItemType.Scene);

        var stats = Subject.GetLibraryStatistics(new StatisticsFilter
        {
            ItemTypes = new List<ItemType> { ItemType.Scene }
        });

        stats.MovieCount.Should().Be(2);
        stats.SceneItemCount.Should().Be(2);
    }

    [Test]
    public void should_negate_item_type_filter()
    {
        GivenMovie(itemType: ItemType.Movie);
        GivenMovie(itemType: ItemType.Scene);

        var stats = Subject.GetLibraryStatistics(new StatisticsFilter
        {
            ItemTypes = new List<ItemType> { ItemType.Scene },
            ItemTypesNot = true
        });

        stats.MovieCount.Should().Be(1);
        stats.MovieItemCount.Should().Be(1);
    }

    [Test]
    public void should_filter_by_tag()
    {
        var tag = GivenTag("wanted");
        GivenMovie(tags: new HashSet<int> { tag.Id });
        GivenMovie();

        var stats = Subject.GetLibraryStatistics(new StatisticsFilter
        {
            TagIds = new List<int> { tag.Id }
        });

        stats.MovieCount.Should().Be(1);
    }

    [Test]
    public void should_filter_by_quality_profile()
    {
        var profile = GivenProfile("Filtered");
        var other = GivenProfile("Other");
        GivenMovie(qualityProfileId: profile.Id);
        GivenMovie(qualityProfileId: other.Id);

        var stats = Subject.GetLibraryStatistics(new StatisticsFilter
        {
            QualityProfileIds = new List<int> { profile.Id }
        });

        stats.MovieCount.Should().Be(1);
    }

    // A root folder prefix must not match a sibling folder that merely starts with the
    // same characters, which is why the filter appends a separator.
    [Test]
    public void should_filter_by_root_folder_without_matching_sibling_prefixes()
    {
        GivenMovie(path: "/movies/One");
        GivenMovie(path: "/movies2/Two");

        var stats = Subject.GetLibraryStatistics(new StatisticsFilter
        {
            RootFolderPaths = new List<string> { "/movies".AsOsAgnostic() }
        });

        stats.MovieCount.Should().Be(1);
    }

    [Test]
    public void should_scope_file_totals_to_the_filter()
    {
        var tag = GivenTag("counted");

        GivenMovieFile(GivenMovie(tags: new HashSet<int> { tag.Id }), Quality.HDTV720p, size: 300);
        GivenMovieFile(GivenMovie(), Quality.HDTV720p, size: 900);

        var stats = Subject.GetLibraryStatistics(new StatisticsFilter
        {
            TagIds = new List<int> { tag.Id }
        });

        stats.MovieFileCount.Should().Be(1);
        stats.SizeOnDisk.Should().Be(300);
    }
}
