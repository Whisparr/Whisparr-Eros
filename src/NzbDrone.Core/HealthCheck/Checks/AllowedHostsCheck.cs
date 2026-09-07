using NLog;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Configuration.Events;
using NzbDrone.Core.Lifecycle;
using NzbDrone.Core.Localization;

namespace NzbDrone.Core.HealthCheck.Checks
{
    [CheckOn(typeof(ApplicationStartedEvent))]
    [CheckOn(typeof(ConfigFileSavedEvent))]
    public class AllowedHostsCheck : HealthCheckBase
    {
        private readonly IConfigFileProvider _configFileProvider;
        private readonly Logger _logger;

        public AllowedHostsCheck(IConfigFileProvider configFileProvider, ILocalizationService localizationService, Logger logger)
            : base(localizationService)
        {
            _configFileProvider = configFileProvider;
            _logger = logger;
        }

        public override HealthCheck Check()
        {
            var allowedHosts = AllowedHostsParser.Parse(_configFileProvider.AllowedHosts);
            var isWildcard = allowedHosts.Contains("*");

            if (allowedHosts.Count > 0 && !isWildcard)
            {
                return new HealthCheck(GetType());
            }

            if (_configFileProvider.AuthenticationRequired == AuthenticationRequiredType.Enabled)
            {
                return new HealthCheck(GetType());
            }

            if (isWildcard)
            {
                _logger.Warn("Allowed Hosts is set to '*', requests for any hostname will be accepted. You can set this via settings or the config file");

                return new HealthCheck(GetType(),
                    HealthCheckResult.Warning,
                    HealthCheckReason.AllowedHostsWildcard,
                    _localizationService.GetLocalizedString("AllowedHostsWildcardHealthCheckMessage"),
                    "#allowed-hosts-not-configured");
            }

            _logger.Warn("Allowed Hosts is not configured, requests for any hostname will be accepted. You can set this via settings or the config file");

            return new HealthCheck(GetType(),
                HealthCheckResult.Warning,
                HealthCheckReason.AllowedHostsNotConfigured,
                _localizationService.GetLocalizedString("AllowedHostsNotConfiguredHealthCheckMessage"),
                "#allowed-hosts-not-configured");
        }
    }
}
