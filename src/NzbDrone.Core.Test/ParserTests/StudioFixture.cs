using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.ParserTests
{
    [TestFixture]
    public class StudioFixture : CoreTest
    {
        [TestCase("Casting Couch-X", "Casting Couch-X")]
        [TestCase("Casting Couch-X", "Casting Couch X")]
        [TestCase("Casting Couch-X", "CastingCouch X")]
        [TestCase("Casting Couch-X", "CastingCouchX")]
        [TestCase("Casting Couch X", "Casting Couch-X")]
        [TestCase("Casting Couch X", "Casting Couch X")]
        [TestCase("Casting Couch X", "CastingCouchX")]
        [TestCase("Brazzers Exxtra", "Brazzers Exxtra")]
        [TestCase("Brazzers Exxtra", "BrazzersExxtra")]
        [TestCase("Hot and Mean", "Hot And Mean")]
        [TestCase("Hot and Mean", "HotAndMean")]
        [TestCase("Monsters of Cock", "MonstersOfCock")]
        [TestCase("In the VIP", "InTheVIP")]
        public void should_match_studio_names(string stashDB, string external)
        {
            // The Clean Title is used to match the record within the DB
            // Test that the studio name can be found for an external source:
            // FileName
            // Indexer
            stashDB.CleanStudioTitle().Should().Be(external.CleanStudioTitle());
        }

        // The metadata search matches whole words, so a studio name taken from a release has to be
        // expanded before it is sent. The cleaned form is what the result is matched on afterwards.
        [TestCase("SweetSinner", "Sweet Sinner")]
        [TestCase("BrazzersExxtra", "Brazzers Exxtra")]
        [TestCase("MileHighMedia", "Mile High Media")]
        [TestCase("ZeroToleranceFilms", "Zero Tolerance Films")]
        [TestCase("LifeSelector", "Life Selector")]
        [TestCase("3rdDegree", "3rd Degree")]
        [TestCase("IFeelMyself", "I Feel Myself")]

        // A run of capitals is an acronym and stays whole.
        [TestCase("BackdoorPOV", "Backdoor POV")]
        [TestCase("InTheVIP", "In The VIP")]
        [TestCase("POVLife", "POV Life")]

        // A name that already reads as words is left alone.
        [TestCase("Sweet Sinner", "Sweet Sinner")]
        [TestCase("Casting Couch-X", "Casting Couch-X")]
        [TestCase("  Sweet   Sinner  ", "Sweet Sinner")]
        [TestCase("", "")]
        [TestCase(null, "")]
        public void should_expand_studio_title_for_search(string parsed, string expected)
        {
            parsed.ExpandStudioTitle().Should().Be(expected);
        }

        [TestCase("SweetSinner")]
        [TestCase("BackdoorPOV")]
        [TestCase("MileHighMedia")]
        [TestCase("3rdDegree")]
        public void should_expand_studio_title_without_changing_its_clean_title(string parsed)
        {
            // Expanding is only about how the name is searched, never about how it is matched.
            parsed.ExpandStudioTitle().CleanStudioTitle().Should().Be(parsed.CleanStudioTitle());
        }
    }
}
