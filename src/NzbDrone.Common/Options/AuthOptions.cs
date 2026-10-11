namespace NzbDrone.Common.Options;

public class AuthOptions
{
    public string ApiKey { get; set; }
    public string InitialUsername { get; set; }
    public string InitialPassword { get; set; }
    public string ResetToken { get; set; }
    public bool? Enabled { get; set; }
    public string Method { get; set; }
    public string Required { get; set; }
    public bool? TrustCgnatIpAddresses { get; set; }
}
