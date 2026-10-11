using System;
using System.IO;
using System.Security;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using FluentValidation;
using FluentValidation.Validators;
using NLog;
using NzbDrone.Common.Instrumentation;

namespace Whisparr.Api.V3.Config
{
    public static class CertificateValidation
    {
        public static IRuleBuilderOptions<T, string> IsValidCertificate<T>(this IRuleBuilder<T, string> ruleBuilder, Func<string, string> resolvePassword = null)
        {
            return ruleBuilder.SetValidator(new CertificateValidator<T>(resolvePassword));
        }
    }

    public class CertificateValidator<T> : PropertyValidator<T, string>
    {
        private readonly Func<string, string> _resolvePassword;

        // The settings API never returns the stored certificate password, so a
        // resource can carry the placeholder; the caller maps that back to the real one.
        public CertificateValidator(Func<string, string> resolvePassword = null)
        {
            _resolvePassword = resolvePassword ?? (password => password);
        }

        public override string Name => "CertificateValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Invalid SSL certificate file or password. {message}";

        private static readonly Logger Logger = NzbDroneLogger.GetLogger(typeof(CertificateValidator<T>));

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            if (value == null)
            {
                return false;
            }

            if (context.InstanceToValidate is not HostConfigResource resource)
            {
                return true;
            }

            try
            {
                var certBytes = File.ReadAllBytes(resource.SslCertPath);

                // Use SecureString for password
                SecureString securePassword = null;
                var password = _resolvePassword(resource.SslCertPassword);

                if (!string.IsNullOrEmpty(password))
                {
                    securePassword = new SecureString();
                    foreach (var c in password)
                    {
                        securePassword.AppendChar(c);
                    }

                    securePassword.MakeReadOnly();
                }

                #pragma warning disable SYSLIB0057 // Suppress obsolete warning for X509Certificate2 constructor
                var certificate = new X509Certificate2(
                    certBytes,
                    securePassword,
                    X509KeyStorageFlags.DefaultKeySet);
                #pragma warning restore SYSLIB0057
                return true;
            }
            catch (CryptographicException ex)
            {
                Logger.Debug(ex, "Invalid SSL certificate file or password. {0}", ex.Message);
                context.MessageFormatter.AppendArgument("message", ex.Message);
                return false;
            }
        }
    }
}
