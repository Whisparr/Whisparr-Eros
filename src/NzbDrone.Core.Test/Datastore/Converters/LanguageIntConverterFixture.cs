using System.Text.Json;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Datastore.Converters
{
    [TestFixture]
    public class LanguageIntConverterFixture : CoreTest
    {
        private JsonSerializerOptions _options;

        [SetUp]
        public void Setup()
        {
            _options = new JsonSerializerOptions();
            _options.Converters.Add(new NzbDrone.Core.Datastore.Converters.LanguageIntConverter());
        }

        [Test]
        public void should_read_language_id()
        {
            JsonSerializer.Deserialize<Language>("1", _options).Should().Be(Language.English);
        }

        [Test]
        public void should_read_null_as_unknown()
        {
            // A null language stored in the DB threw on GetInt32 instead of falling back, so a
            // single bad row took down whatever was deserializing it.
            JsonSerializer.Deserialize<Language>("null", _options).Should().Be(Language.Unknown);
        }

        [Test]
        public void should_write_language_id()
        {
            JsonSerializer.Serialize(Language.English, _options).Should().Be("1");
        }
    }
}
