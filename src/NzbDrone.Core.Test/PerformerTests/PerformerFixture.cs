using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Movies.Performers;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.PerformerTests
{
    [TestFixture]
    public class PerformerFixture : CoreTest
    {
        [Test]
        public void should_default_new_performers_to_visible()
        {
            new Performer().Visibility.Should().Be(PerformerVisibility.Visible);
        }

        [Test]
        public void should_unmonitor_a_performer_when_hiding_them()
        {
            var performer = GivenPerformer(PerformerVisibility.Visible, true, true);

            performer.ApplyVisibility(PerformerVisibility.Hidden);

            performer.Visibility.Should().Be(PerformerVisibility.Hidden);
            performer.Monitored.Should().BeFalse();
            performer.MoviesMonitored.Should().BeFalse();
        }

        [TestCase(true, false)]
        [TestCase(false, true)]
        public void should_show_a_hidden_performer_once_monitored(bool monitored, bool moviesMonitored)
        {
            var performer = GivenPerformer(PerformerVisibility.Hidden, monitored, moviesMonitored);

            performer.ApplyVisibility(PerformerVisibility.Hidden);

            performer.Visibility.Should().Be(PerformerVisibility.Visible);
            performer.Monitored.Should().Be(monitored);
            performer.MoviesMonitored.Should().Be(moviesMonitored);
        }

        [Test]
        public void should_keep_an_unmonitored_hidden_performer_hidden()
        {
            var performer = GivenPerformer(PerformerVisibility.Hidden);

            performer.ApplyVisibility(PerformerVisibility.Hidden);

            performer.Visibility.Should().Be(PerformerVisibility.Hidden);
        }

        [Test]
        public void should_show_a_hidden_performer_on_request()
        {
            var performer = GivenPerformer(PerformerVisibility.Hidden);

            performer.ApplyVisibility(PerformerVisibility.Visible);

            performer.Visibility.Should().Be(PerformerVisibility.Visible);
        }

        [Test]
        public void should_keep_an_unmonitored_visible_performer_visible()
        {
            var performer = GivenPerformer(PerformerVisibility.Visible);

            performer.ApplyVisibility(PerformerVisibility.Visible);

            performer.Visibility.Should().Be(PerformerVisibility.Visible);
        }

        [Test]
        public void should_let_hiding_win_over_a_stale_monitored_flag_in_apply_changes()
        {
            var performer = GivenPerformer(PerformerVisibility.Visible, true);

            performer.ApplyChanges(GivenPerformer(PerformerVisibility.Hidden, true));

            performer.Visibility.Should().Be(PerformerVisibility.Hidden);
            performer.Monitored.Should().BeFalse();
        }

        [Test]
        public void should_show_a_hidden_performer_monitored_through_apply_changes()
        {
            var performer = GivenPerformer(PerformerVisibility.Hidden);

            performer.ApplyChanges(GivenPerformer(PerformerVisibility.Hidden, true));

            performer.Visibility.Should().Be(PerformerVisibility.Visible);
            performer.Monitored.Should().BeTrue();
        }

        private static Performer GivenPerformer(PerformerVisibility visibility, bool monitored = false, bool moviesMonitored = false)
        {
            return new Performer
            {
                Visibility = visibility,
                Monitored = monitored,
                MoviesMonitored = moviesMonitored
            };
        }
    }
}
