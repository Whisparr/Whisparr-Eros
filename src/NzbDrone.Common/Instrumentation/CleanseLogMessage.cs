using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Common.Instrumentation
{
    public static class CleanseLogMessage
    {
        private static readonly Regex[] CleansingRules =
        {
            // Url
            Rule(@"(?<=\?|&|: )(apikey|(?:access[-_]?)?token|passkey|auth|authkey|user|uid|api|[a-z_]*apikey|account|passwd)=(?<secret>[^&=]+?)(?=[ ""&=]|$)"),
            Rule(@"(?<=\?|&)[^=]*?(username|password)=(?<secret>[^&=]+?)(?= |&|$)"),
            Rule(@"rss(24h)?\.torrentleech\.org/(?!rss)(?<secret>[0-9a-z]+)"),
            Rule(@"torrentleech\.org/rss/download/[0-9]+/(?<secret>[0-9a-z]+)"),
            Rule(@"iptorrents\.com/[/a-z0-9?&;]*?(?:[?&;](u|tp)=(?<secret>[^&=;]+?))+(?= |;|&|$)"),
            Rule(@"/fetch/[a-z0-9]{32}/(?<secret>[a-z0-9]{32})", RegexOptions.None),
            Rule(@"(getnzb|rss).*?(?<=\?|&)(r)=(?<secret>[^&=]+?)(?= |&|$)"),
            Rule(@"\b(\w*)?(_?(?<!use|get_)token|username|passwo?rd)=(?<secret>[^&=]+?)(?= |&|$|;)"),
            Rule(@"-hd.me/torrent/[a-z0-9-]\.[0-9]+\.(?<secret>[0-9a-z]+)"),

            // Trackers Announce Keys; Designed for Qbit Json; should work for all in theory
            Rule(@"announce(\.php)?(/|%2f|%3fpasskey%3d)(?<secret>[a-z0-9]{16,})|(?<secret>[a-z0-9]{16,})(/|%2f)announce"),

            // Path
            Rule(@"C:\\Users\\(?<secret>[^\""]+?)(\\|$)"),
            Rule(@"/(home|Users)/(?<secret>[^/""]+?)(/|$)"),

            // Email
            Rule(@"\b(?<secret>[a-z0-9._%+-]+)@[a-z0-9.-]+\.[a-z]{2,}\b"),

            // NzbGet
            Rule(@"""Name""\s*:\s*""[^""]*(username|password)""\s*,\s*""Value""\s*:\s*""(?<secret>[^""]+?)"""),

            // Sabnzbd
            Rule(@"""[^""]*(username|password|api_?key|nzb_key)""\s*:\s*""(?<secret>[^""]+?)"""),
            Rule(@"""email_(account|to|from|pwd)""\s*:\s*""(?<secret>[^""]+?)"""),

            // uTorrent
            Rule(@"\[""[a-z._]*(username|password)"",\d,""(?<secret>[^""]+?)"""),
            Rule(@"\[""(boss_key|boss_key_salt|proxy\.proxy)"",\d,""(?<secret>[^""]+?)"""),

            // Deluge
            Rule(@"auth.login\(""(?<secret>[^""]+?)"""),

            // BroadcastheNet
            Rule(@"""?method""?\s*:\s*""(getTorrents)"",\s*""?params""?\s*:\s*\[\s*""(?<secret>[^""]+?)"""),
            Rule(@"getTorrents\(""(?<secret>[^""]+?)"""),
            Rule(@"(?<=\?|&)(authkey|torrent_pass)=(?<secret>[^&=]+?)(?=""|&|$)"),

            // Plex
            Rule(@"(?<=\?|&)(X-Plex-Client-Identifier|X-Plex-Token)=(?<secret>[^&=]+?)(?= |&|$)"),

            // Notifiarr
            Rule(@"api/v[0-9]/notification/whisparr/(?<secret>[\w-]+)"),

            // Discord
            Rule(@"discord.com/api/webhooks/((?<secret>[\w-]+)/)?(?<secret>[\w-]+)"),

            // Telegram
            Rule(@"api.telegram.org/bot(?<id>[\d]+):(?<secret>[\w-]+)/")
        };

        private static readonly Regex CleanseRemoteIPRegex = Rule(@"(?:Auth-\w+(?<!Failure|Unauthorized) ip|from) (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", RegexOptions.None);

        public static string Cleanse(string message)
        {
            if (message.IsNullOrWhiteSpace())
            {
                return message;
            }

            foreach (var regex in CleansingRules)
            {
                message = regex.Replace(message, m =>
                {
                    var value = m.Value;
                    foreach (var capture in m.Groups["secret"].Captures.OfType<Capture>().Reverse())
                    {
                        value = value.Replace(capture.Index - m.Index, capture.Length, "(removed)");
                    }

                    return value;
                });
            }

            message = CleanseRemoteIPRegex.Replace(message, CleanseRemoteIP);

            return message;
        }

        private static string CleanseRemoteIP(Match match)
        {
            var group = match.Groups[1];
            var valueIP = group.Value;

            if (IPAddress.TryParse(valueIP, out var address) && !address.IsLocalAddress())
            {
                var prefix = match.Value.Substring(0, group.Index - match.Index);
                var postfix = match.Value.Substring(group.Index + group.Length - match.Index);
                var items = valueIP.Split('.');

                return $"{prefix}{items[0]}.*.*.{items[3]}{postfix}";
            }

            return match.Value;
        }

        // Every rule is compiled and timeout-guarded, and this is the only place that says so - a new
        // rule cannot be added without both. RegexDefaults.Timeout is the codebase-wide circuit
        // breaker against catastrophic backtracking; the two rules that pass RegexOptions.None are
        // case-sensitive by design.
        private static Regex Rule(string pattern, RegexOptions options = RegexOptions.IgnoreCase)
        {
            return new Regex(pattern, options | RegexOptions.Compiled, RegexDefaults.Timeout);
        }
    }
}
