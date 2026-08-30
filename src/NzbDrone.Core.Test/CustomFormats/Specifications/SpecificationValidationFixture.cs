using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.CustomFormats.Specifications
{
    [TestFixture]
    public class SpecificationValidationFixture : CoreTest
    {
        // Both enums start at Unknown = 0 and both are offered to the user as select options, so
        // NotEmpty() rejected a legitimate choice while letting any out-of-range number through.
        [TestCase((int)Resolution.Unknown)]
        [TestCase((int)Resolution.R720p)]
        [TestCase((int)Resolution.R2160p)]
        public void should_accept_defined_resolution(int value)
        {
            new ResolutionSpecification { Value = value }.Validate().IsValid.Should().BeTrue();
        }

        [TestCase(-1)]
        [TestCase(1)]
        [TestCase(9999)]
        public void should_reject_undefined_resolution(int value)
        {
            var result = new ResolutionSpecification { Value = value }.Validate();

            result.IsValid.Should().BeFalse();
            result.Errors.Should().ContainSingle(e => e.ErrorMessage == $"Invalid resolution condition value: {value}");
        }

        [TestCase((int)QualitySource.Unknown)]
        [TestCase((int)QualitySource.Web)]
        [TestCase((int)QualitySource.VR)]
        public void should_accept_defined_source(int value)
        {
            new SourceSpecification { Value = value }.Validate().IsValid.Should().BeTrue();
        }

        [TestCase(-1)]
        [TestCase(9999)]
        public void should_reject_undefined_source(int value)
        {
            var result = new SourceSpecification { Value = value }.Validate();

            result.IsValid.Should().BeFalse();
            result.Errors.Should().ContainSingle(e => e.ErrorMessage == $"Invalid source condition value: {value}");
        }
    }
}
