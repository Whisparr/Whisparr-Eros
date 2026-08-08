using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.ImportLists.StashDB.Favorite;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.ImportListTests.StashDB
{
    public class StashDBSettingsValidatorFixture : CoreTest
    {
        [TestCase("")]
        [TestCase(null)]
        public void invalid_api_key_should_not_validate(string apiKey)
        {
            var settings = new StashDBFavoriteSettings
            {
                ApiKey = apiKey,
            };

            settings.Validate().IsValid.Should().BeFalse();
            settings.Validate().Errors.Should().Contain(c => c.PropertyName == "ApiKey");
        }

        [TestCase("validApiKey123")]
        [TestCase("anotherValidApiKey456")]
        public void valid_api_key_should_validate(string apiKey)
        {
            var settings = new StashDBFavoriteSettings
            {
                ApiKey = apiKey,
            };

            settings.Validate().IsValid.Should().BeTrue();
            settings.Validate().Errors.Should().NotContain(c => c.PropertyName == "ApiKey");
        }

        [TestCase(0, false)]
        [TestCase(1, true)]
        [TestCase(1000, true)]
        [TestCase(1001, false)]
        public void limit_should_validate_within_supported_range(int limit, bool expectedIsValid)
        {
            var settings = new StashDBFavoriteSettings
            {
                ApiKey = "valid-api-key",
                Limit = limit
            };

            var validationResult = settings.Validate();

            validationResult.IsValid.Should().Be(expectedIsValid);
            validationResult.Errors.Any(error => error.PropertyName == nameof(settings.Limit)).Should().Be(!expectedIsValid);
        }
    }
}
