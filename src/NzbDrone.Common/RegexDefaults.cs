using System;

namespace NzbDrone.Common
{
    public static class RegexDefaults
    {
        // Circuit breaker against catastrophic backtracking, passed as the matchTimeout argument to
        // every Regex in the codebase. Legitimate input matches in microseconds, so this only fires on
        // a pathological pattern/input pair; it is deliberately generous so a loaded or CPU-throttled
        // host can't trip it on a release title that would otherwise parse.
        //
        // Note for callers: static readonly fields initialise in textual order, so a regex field that
        // is initialised inline must be declared after any local copy of this value.
        public static readonly TimeSpan Timeout = TimeSpan.FromSeconds(5);
    }
}
