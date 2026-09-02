using System.Collections.Generic;
using Diacritical;

namespace NzbDrone.Common.Globalization;

// Diacritical's own map stops at the letters that are a base letter plus a
// mark. Eth and thorn are neither, so they survive it untouched and a title
// like `Ríkið` cleans to `rikið`, which no release spells that way.
public class AdditionalDiacriticsProvider : IDiacriticProvider
{
    public IDictionary<char, string> Provide()
    {
        return new Dictionary<char, string>
        {
            { 'ð', "d" },
            { 'Ð', "D" },
            { 'þ', "th" },
            { 'Þ', "Th" },
        };
    }
}
