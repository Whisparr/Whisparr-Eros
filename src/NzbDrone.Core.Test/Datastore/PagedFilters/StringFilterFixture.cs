using System.Linq;
using System.Text.Json;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Datastore.PagedFilters;

namespace NzbDrone.Core.Test.Datastore.PagedFilters
{
    [TestFixture]
    public class StringFilterFixture
    {
        private class TestModel
        {
            public string Title { get; set; }
        }

        private static bool Evaluate(PagingSpec<TestModel> spec, TestModel model)
        {
            return spec.FilterExpressions.All(expr => expr.Compile()(model));
        }

        private static PagingSpec<TestModel> Apply(string jsonValue, string operation)
        {
            var spec = new PagingSpec<TestModel>();
            var element = JsonDocument.Parse(jsonValue).RootElement;
            StringFilter.Apply(spec, element, operation, m => m.Title);
            return spec;
        }

        // ── contains ──────────────────────────────────────────────────────────

        [Test]
        public void contains_single_value_matches()
        {
            var spec = Apply("\"Taboo\"", "contains");
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeTrue();
        }

        [Test]
        public void contains_single_value_no_match()
        {
            var spec = Apply("\"Taboo\"", "contains");
            Evaluate(spec, new TestModel { Title = "Another Title" }).Should().BeFalse();
        }

        [Test]
        public void contains_multi_value_matches_any()
        {
            var spec = Apply("[\"Taboo\",\"Affair\"]", "contains");

            // matches first term
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeTrue();

            // matches second term
            Evaluate(spec, new TestModel { Title = "Big Affair" }).Should().BeTrue();

            // matches neither
            Evaluate(spec, new TestModel { Title = "Unrelated" }).Should().BeFalse();
        }

        [Test]
        public void contains_multi_value_produces_single_expression()
        {
            var spec = Apply("[\"Taboo\",\"Affair\"]", "contains");
            spec.FilterExpressions.Should().HaveCount(1);
        }

        [Test]
        public void contains_null_title_does_not_match()
        {
            var spec = Apply("\"Taboo\"", "contains");
            Evaluate(spec, new TestModel { Title = null }).Should().BeFalse();
        }

        // ── notcontains ───────────────────────────────────────────────────────

        [Test]
        public void notcontains_single_value_excludes_match()
        {
            var spec = Apply("\"Taboo\"", "notcontains");
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeFalse();
            Evaluate(spec, new TestModel { Title = "Another Title" }).Should().BeTrue();
        }

        [Test]
        public void notcontains_multi_value_and_semantics()
        {
            var spec = Apply("[\"Taboo\",\"Affair\"]", "notcontains");

            // both terms absent → passes
            Evaluate(spec, new TestModel { Title = "Unrelated" }).Should().BeTrue();

            // first term present → fails
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeFalse();

            // second term present → fails
            Evaluate(spec, new TestModel { Title = "Big Affair" }).Should().BeFalse();
        }

        [Test]
        public void notcontains_multi_value_produces_one_expression_per_term()
        {
            var spec = Apply("[\"Taboo\",\"Affair\"]", "notcontains");
            spec.FilterExpressions.Should().HaveCount(2);
        }

        [Test]
        public void notcontains_null_title_passes()
        {
            var spec = Apply("\"Taboo\"", "notcontains");
            Evaluate(spec, new TestModel { Title = null }).Should().BeTrue();
        }

        // ── equal ─────────────────────────────────────────────────────────────

        [Test]
        public void equal_single_value_matches_exactly()
        {
            var spec = Apply("\"Taboo\"", "equal");
            Evaluate(spec, new TestModel { Title = "Taboo" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeFalse();
        }

        [Test]
        public void equal_multi_value_matches_any()
        {
            var spec = Apply("[\"Taboo\",\"Affair\"]", "equal");
            Evaluate(spec, new TestModel { Title = "Taboo" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "Affair" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "Other" }).Should().BeFalse();
        }

        // ── notequal ──────────────────────────────────────────────────────────

        [Test]
        public void notequal_single_value_excludes_exact_match()
        {
            var spec = Apply("\"Taboo\"", "notequal");
            Evaluate(spec, new TestModel { Title = "Taboo" }).Should().BeFalse();
            Evaluate(spec, new TestModel { Title = "Other" }).Should().BeTrue();
        }

        [Test]
        public void notequal_multi_value_and_semantics()
        {
            var spec = Apply("[\"Taboo\",\"Affair\"]", "notequal");
            Evaluate(spec, new TestModel { Title = "Other" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "Taboo" }).Should().BeFalse();
            Evaluate(spec, new TestModel { Title = "Affair" }).Should().BeFalse();
        }

        // ── startswith ────────────────────────────────────────────────────────

        [Test]
        public void startswith_single_value_matches()
        {
            var spec = Apply("\"My\"", "startswith");
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "Big Affair" }).Should().BeFalse();
        }

        [Test]
        public void startswith_multi_value_matches_any()
        {
            var spec = Apply("[\"My\",\"Big\"]", "startswith");
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "Big Affair" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "Other" }).Should().BeFalse();
        }

        // ── notstartswith ─────────────────────────────────────────────────────

        [Test]
        public void notstartswith_multi_value_and_semantics()
        {
            var spec = Apply("[\"My\",\"Big\"]", "notstartswith");
            Evaluate(spec, new TestModel { Title = "Other" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeFalse();
            Evaluate(spec, new TestModel { Title = "Big Affair" }).Should().BeFalse();
        }

        // ── endswith ──────────────────────────────────────────────────────────

        [Test]
        public void endswith_single_value_matches()
        {
            var spec = Apply("\"Taboo\"", "endswith");
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "Big Affair" }).Should().BeFalse();
        }

        [Test]
        public void endswith_multi_value_matches_any()
        {
            var spec = Apply("[\"Taboo\",\"Affair\"]", "endswith");
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "Big Affair" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "Unrelated" }).Should().BeFalse();
        }

        // ── notendswith ───────────────────────────────────────────────────────

        [Test]
        public void notendswith_multi_value_and_semantics()
        {
            var spec = Apply("[\"Taboo\",\"Affair\"]", "notendswith");
            Evaluate(spec, new TestModel { Title = "Unrelated" }).Should().BeTrue();
            Evaluate(spec, new TestModel { Title = "My Taboo" }).Should().BeFalse();
            Evaluate(spec, new TestModel { Title = "Big Affair" }).Should().BeFalse();
        }

        // ── edge cases ────────────────────────────────────────────────────────

        [Test]
        public void empty_array_produces_no_expressions()
        {
            var spec = Apply("[]", "contains");
            spec.FilterExpressions.Should().BeEmpty();
        }

        [Test]
        public void whitespace_only_values_are_ignored()
        {
            var spec = Apply("[\"  \",\"\"]", "contains");
            spec.FilterExpressions.Should().BeEmpty();
        }

        [Test]
        public void unknown_operation_produces_no_expressions()
        {
            var spec = Apply("\"value\"", "unknown");
            spec.FilterExpressions.Should().BeEmpty();
        }
    }
}
