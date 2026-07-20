using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.HealthCheck.Checks;
using NzbDrone.Core.Localization;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.HealthCheck.Checks
{
    [TestFixture]
    public class MountCheckFixture : CoreTest<MountCheck>
    {
        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<ILocalizationService>()
                  .Setup(s => s.GetLocalizedString(It.IsAny<string>()))
                  .Returns("Mount is read only: ");

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetMount(It.IsAny<string>()))
                  .Returns((IMount)null);
        }

        private void GivenMoviePaths(params string[] paths)
        {
            Mocker.GetMock<IMovieService>()
                  .Setup(s => s.AllMoviePaths())
                  .Returns(paths.Select((path, index) => new { index, path })
                                .ToDictionary(x => x.index, x => x.path));
        }

        private void GivenMount(string name, string rootDirectory, MountOptions mountOptions, params string[] paths)
        {
            var mount = new Mock<IMount>();

            mount.SetupGet(m => m.RootDirectory).Returns(rootDirectory);
            mount.SetupGet(m => m.Name).Returns(name);
            mount.SetupGet(m => m.MountOptions).Returns(mountOptions);

            foreach (var path in paths)
            {
                Mocker.GetMock<IDiskProvider>()
                      .Setup(s => s.GetMount(path))
                      .Returns(mount.Object);
            }
        }

        private static MountOptions ReadOnly()
        {
            return new MountOptions(new Dictionary<string, string> { { "ro", string.Empty } });
        }

        private static MountOptions Writable()
        {
            return new MountOptions(new Dictionary<string, string>());
        }

        [Test]
        public void should_not_return_error_when_no_movies()
        {
            GivenMoviePaths();

            Subject.Check().ShouldBeOk();
        }

        [Test]
        public void should_not_return_error_when_mount_cannot_be_resolved()
        {
            GivenMoviePaths(@"C:\Movies\movie".AsOsAgnostic());

            Subject.Check().ShouldBeOk();
        }

        [Test]
        public void should_not_return_error_when_mount_options_are_unavailable()
        {
            // DriveInfoMount is constructed without mount options, so MountOptions is always null on Windows.
            var path = @"C:\Movies\movie".AsOsAgnostic();

            GivenMoviePaths(path);
            GivenMount("Movies", @"C:\Movies".AsOsAgnostic(), null, path);

            Subject.Check().ShouldBeOk();
        }

        [Test]
        public void should_not_return_error_when_mount_is_writable()
        {
            var path = @"C:\Movies\movie".AsOsAgnostic();

            GivenMoviePaths(path);
            GivenMount("Movies", @"C:\Movies".AsOsAgnostic(), Writable(), path);

            Subject.Check().ShouldBeOk();
        }

        [Test]
        public void should_return_error_when_mount_is_read_only()
        {
            var path = @"C:\Movies\movie".AsOsAgnostic();

            GivenMoviePaths(path);
            GivenMount("Movies", @"C:\Movies".AsOsAgnostic(), ReadOnly(), path);

            var result = Subject.Check();

            result.ShouldBeError(wikiFragment: "#movie-mount-ro");
            result.Message.Should().Contain("Movies");
            result.Message.Should().Contain(path);
        }

        [Test]
        public void should_only_report_each_mount_once()
        {
            var paths = new[] { @"C:\Movies\first", @"C:\Movies\second", @"C:\Movies\third" }
                .Select(p => p.AsOsAgnostic())
                .ToArray();

            GivenMoviePaths(paths);
            GivenMount("ReadOnlyMount", @"C:\Movies".AsOsAgnostic(), ReadOnly(), paths);

            var result = Subject.Check();

            result.ShouldBeError();
            Regex.Matches(result.Message, "ReadOnlyMount").Count.Should().Be(1);
        }

        [Test]
        public void should_report_the_first_path_for_a_mount()
        {
            var paths = new[] { @"C:\Movies\first", @"C:\Movies\second", @"C:\Movies\third" }
                .Select(p => p.AsOsAgnostic())
                .ToArray();

            GivenMoviePaths(paths);
            GivenMount("ReadOnlyMount", @"C:\Movies".AsOsAgnostic(), ReadOnly(), paths);

            var result = Subject.Check();

            result.Message.Should().Contain(paths[0]);
            result.Message.Should().NotContain(paths[1]);
            result.Message.Should().NotContain(paths[2]);
        }

        [Test]
        public void should_report_each_read_only_mount()
        {
            var first = @"C:\First\movie".AsOsAgnostic();
            var second = @"C:\Second\movie".AsOsAgnostic();

            GivenMoviePaths(first, second);
            GivenMount("FirstMount", @"C:\First".AsOsAgnostic(), ReadOnly(), first);
            GivenMount("SecondMount", @"C:\Second".AsOsAgnostic(), ReadOnly(), second);

            var result = Subject.Check();

            result.ShouldBeError();
            result.Message.Should().Contain(first);
            result.Message.Should().Contain(second);
        }

        [Test]
        public void should_only_report_read_only_mounts()
        {
            var readOnly = @"C:\First\movie".AsOsAgnostic();
            var writable = @"C:\Second\movie".AsOsAgnostic();

            GivenMoviePaths(readOnly, writable);
            GivenMount("FirstMount", @"C:\First".AsOsAgnostic(), ReadOnly(), readOnly);
            GivenMount("SecondMount", @"C:\Second".AsOsAgnostic(), Writable(), writable);

            var result = Subject.Check();

            result.ShouldBeError();
            result.Message.Should().Contain(readOnly);
            result.Message.Should().NotContain(writable);
        }
    }
}
