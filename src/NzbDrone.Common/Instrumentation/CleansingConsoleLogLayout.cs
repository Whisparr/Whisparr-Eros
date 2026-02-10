using NLog;
using NLog.Layouts;
using NzbDrone.Common.EnvironmentInfo;

namespace NzbDrone.Common.Instrumentation;

public class CleansingConsoleLogLayout : Layout
{
    private readonly string _format;

    public CleansingConsoleLogLayout(string format)
    {
        _format = format;
    }

    protected override string GetFormattedMessage(LogEventInfo logEvent)
    {
        var simpleLayout = new SimpleLayout(_format);
        var result = simpleLayout.Render(logEvent);

        if (RuntimeInfo.IsProduction)
        {
            result = CleanseLogMessage.Cleanse(result);
        }

        return result;
    }
}
