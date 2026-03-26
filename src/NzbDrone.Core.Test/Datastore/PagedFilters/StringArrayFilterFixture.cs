using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Datastore.PagedFilters;

namespace NzbDrone.Core.Test.Datastore.PagedFilters
{
    [TestFixture]
    public class StringArrayFilterFixture
    {
        private class TestModel
        {
            public List<string> Tags { get; set; }
        }

        private static bool Evaluate(PagingSpec<TestModel> spec, TestModel model)
        {
            return spec.FilterExpressions.All(expr => expr.Compile()(model));
        }

        private static PagingSpec<TestModel> Apply(string jsonValue, string operation)
        {
            var spec = new PagingSpec<TestModel>();
            var element = JsonDocument.Parse(jsonValue).RootElement;
            StringArrayFilter.Apply(spec, element, operation, m => m.Tags);
            return spec;
        }

        // ── contains (any) ────────────────────────────────────────────────────

        [Test]
        public void contains_single_value_matches_when_list_has_value()
        {
            var spec = Apply("\"rock\"", "contains");
            Evaluate(spec, new TestModel { Tags = new List<string> { "rock", "pop" } }).Should().BeTrue();
        }

        [Test]
        public void contains_single_value_no_match()
        {
            var spec = Apply("\"jazz\"", "contains");
            Evaluate(spec, new TestModel { Tags = new List<string> { "rock", "pop" } }).Should().BeFalse();
        }

        [Test]
        public void contains_multi_value_matches_when_any_present()
        {
            var spec = Apply("[\"rock\",\"jazz\"]", "contains");

            // list has "rock" → matches
            Evaluate(spec, new TestModel { Tags = new List<string> { "rock" } }).Should().BeTrue();

            // list has "jazz" → matches
            Evaluate(spec, new TestModel { Tags = new List<string> { "jazz" } }).Should().BeTrue();

            // list has neither → no match
            Evaluate(spec, new TestModel { Tags = new List<string> { "pop" } }).Should().BeFalse();
        }

        [Test]
        public void contains_multi_value_produces_single_expression()
        {
            var spec = Apply("[\"rock\",\"jazz\"]", "contains");
            spec.FilterExpressions.Should().HaveCount(1);
        }

        [Test]
        public void containsany_alias_behaves_same_as_contains()
        {
            var spec = Apply("[\"rock\",\"jazz\"]", "containsany");
            Evaluate(spec, new TestModel { Tags = new List<string> { "jazz" } }).Should().BeTrue();
            Evaluate(spec, new TestModel { Tags = new List<string> { "pop" } }).Should().BeFalse();
        }

        [Test]
        public void contains_null_list_does_not_match()
        {
            var spec = Apply("\"rock\"", "contains");
            Evaluate(spec, new TestModel { Tags = null }).Should().BeFalse();
        }

        // ── containsall ───────────────────────────────────────────────────────

        [Test]
        public void containsall_requires_all_values_present()
        {
            var spec = Apply("[\"rock\",\"pop\"]", "containsall");
            Evaluate(spec, new TestModel { Tags = new List<string> { "rock", "pop", "jazz" } }).Should().BeTrue();
            Evaluate(spec, new TestModel { Tags = new List<string> { "rock" } }).Should().BeFalse();
            Evaluate(spec, new TestModel { Tags = new List<string> { "jazz" } }).Should().BeFalse();
        }

        [Test]
        public void containsall_null_list_does_not_match()
        {
            var spec = Apply("[\"rock\"]", "containsall");
            Evaluate(spec, new TestModel { Tags = null }).Should().BeFalse();
        }

        // ── doesnotcontain ────────────────────────────────────────────────────

        [Test]
        public void doesnotcontain_single_value_excludes_match()
        {
            var spec = Apply("\"rock\"", "doesnotcontain");
            Evaluate(spec, new TestModel { Tags = new List<string> { "rock", "pop" } }).Should().BeFalse();
            Evaluate(spec, new TestModel { Tags = new List<string> { "jazz" } }).Should().BeTrue();
        }

        [Test]
        public void doesnotcontain_multi_value_excludes_when_any_present()
        {
            var spec = Apply("[\"rock\",\"jazz\"]", "doesnotcontain");

            // list has "rock" → excluded
            Evaluate(spec, new TestModel { Tags = new List<string> { "rock" } }).Should().BeFalse();

            // list has "jazz" → excluded
            Evaluate(spec, new TestModel { Tags = new List<string> { "jazz" } }).Should().BeFalse();

            // list has neither → passes
            Evaluate(spec, new TestModel { Tags = new List<string> { "pop" } }).Should().BeTrue();
        }

        [Test]
        public void doesnotcontain_null_list_passes()
        {
            var spec = Apply("\"rock\"", "doesnotcontain");
            Evaluate(spec, new TestModel { Tags = null }).Should().BeTrue();
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
            var spec = Apply("\"rock\"", "unknown");
            spec.FilterExpressions.Should().BeEmpty();
        }
    }
}
