using System;
using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Options;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Configuration;
using NzbDrone.Test.Common;
using Whisparr.Http.Authentication;

namespace NzbDrone.Api.Test.Authentication
{
    [TestFixture]
    public class AuthenticationServiceFixture : TestBase<AuthenticationService>
    {
        private HttpRequest _request;

        [SetUp]
        public void Setup()
        {
            Mocker.SetConstant<ICacheManager>(Mocker.Resolve<CacheManager>());

            Mocker.GetMock<IConfigFileProvider>()
                  .SetupGet(c => c.AuthenticationMethod)
                  .Returns(AuthenticationType.Forms);

            Mocker.GetMock<IUserService>()
                  .Setup(c => c.FindUser("user", "right"))
                  .Returns(new User { Username = "user" });

            Mocker.GetMock<IUserService>()
                  .Setup(c => c.FindUser())
                  .Returns(new User { Username = "whisparr" });

            Mocker.GetMock<IOptions<AuthOptions>>()
                  .Setup(c => c.Value)
                  .Returns(new AuthOptions());

            _request = GivenRequest("192.0.2.10");
        }

        private static HttpRequest GivenRequest(string remoteIp)
        {
            var request = new DefaultHttpContext().Request;
            request.HttpContext.Connection.RemoteIpAddress = IPAddress.Parse(remoteIp);

            return request;
        }

        private void GivenFailedAttempts(int count)
        {
            for (var i = 0; i < count; i++)
            {
                Subject.Login(_request, "user", "wrong").Should().BeNull();
            }
        }

        [Test]
        public void should_not_lock_out_before_five_failed_attempts()
        {
            GivenFailedAttempts(4);

            Subject.GetLockoutEndTime(_request).Should().BeNull();
            Subject.Login(_request, "user", "right").Should().NotBeNull();
        }

        [Test]
        public void should_lock_out_after_five_failed_attempts()
        {
            GivenFailedAttempts(5);

            Subject.GetLockoutEndTime(_request).Should().BeCloseTo(DateTime.UtcNow.AddMinutes(5), TimeSpan.FromSeconds(10));
        }

        [Test]
        public void should_refuse_the_right_password_while_locked_out()
        {
            GivenFailedAttempts(5);

            Subject.Login(_request, "user", "right").Should().BeNull();

            Mocker.GetMock<IUserService>()
                  .Verify(c => c.FindUser("user", "right"), Times.Never());
        }

        [Test]
        public void should_only_lock_out_the_address_that_failed()
        {
            GivenFailedAttempts(5);

            var otherRequest = GivenRequest("192.0.2.20");

            Subject.GetLockoutEndTime(otherRequest).Should().BeNull();
            Subject.Login(otherRequest, "user", "right").Should().NotBeNull();
        }

        [Test]
        public void should_reset_the_count_after_a_successful_login()
        {
            GivenFailedAttempts(4);

            Subject.Login(_request, "user", "right").Should().NotBeNull();

            GivenFailedAttempts(4);

            Subject.GetLockoutEndTime(_request).Should().BeNull();
        }

        [Test]
        public void should_issue_a_token_of_the_expected_length()
        {
            Subject.RequestPasswordReset(_request).Length.Should().Be(20);
        }

        [Test]
        public void should_reset_password_with_a_valid_token()
        {
            var token = Subject.RequestPasswordReset(_request);

            Subject.ResetPassword(_request, token, "whisparr", "newpassword").Should().BeTrue();

            Mocker.GetMock<IUserService>()
                .Verify(c => c.Upsert("whisparr", "newpassword"), Times.Once());
        }

        [Test]
        public void should_use_the_supplied_username_when_provided()
        {
            var token = Subject.RequestPasswordReset(_request);

            Subject.ResetPassword(_request, token, "renamed", "newpassword").Should().BeTrue();

            Mocker.GetMock<IUserService>()
                .Verify(c => c.Upsert("renamed", "newpassword"), Times.Once());
        }

        [Test]
        public void should_reject_an_incorrect_token()
        {
            Subject.RequestPasswordReset(_request);

            Subject.ResetPassword(_request, "NotTheToken", "whisparr", "newpassword").Should().BeFalse();

            Mocker.GetMock<IUserService>()
                .Verify(c => c.Upsert(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_reject_a_reused_token()
        {
            var token = Subject.RequestPasswordReset(_request);

            Subject.ResetPassword(_request, token, "whisparr", "newpassword").Should().BeTrue();
            Subject.ResetPassword(_request, token, "whisparr", "anotherpassword").Should().BeFalse();
        }

        [Test]
        public void should_reject_when_no_token_was_requested()
        {
            Subject.ResetPassword(_request, "AnyTokenAtAll", "whisparr", "newpassword").Should().BeFalse();
        }

        [Test]
        public void should_reject_a_blank_username()
        {
            var token = Subject.RequestPasswordReset(_request);

            Subject.ResetPassword(_request, token, string.Empty, "newpassword").Should().BeFalse();

            Mocker.GetMock<IUserService>()
                .Verify(c => c.Upsert(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_not_issue_a_token_when_authentication_is_not_forms()
        {
            Mocker.GetMock<IConfigFileProvider>()
                .SetupGet(c => c.AuthenticationMethod)
                .Returns(AuthenticationType.None);

            Subject.RequestPasswordReset(_request).Should().BeNull();
        }

        [Test]
        public void should_not_issue_a_second_token_while_one_is_active()
        {
            Subject.RequestPasswordReset(_request).Should().NotBeNull();

            _request.HttpContext.Connection.RemoteIpAddress = IPAddress.Parse("192.0.2.11");

            Subject.RequestPasswordReset(_request).Should().BeNull();
        }

        [Test]
        public void should_reset_password_when_no_user_exists()
        {
            Mocker.GetMock<IUserService>()
                .Setup(c => c.FindUser())
                .Returns((User)null);

            var token = Subject.RequestPasswordReset(_request);

            Subject.ResetPassword(_request, token, "whisparr", "newpassword").Should().BeTrue();

            Mocker.GetMock<IUserService>()
                .Verify(c => c.Upsert("whisparr", "newpassword"), Times.Once());
        }

        [Test]
        public void should_throttle_repeated_requests_from_the_same_address()
        {
            var first = Subject.RequestPasswordReset(_request);
            var second = Subject.RequestPasswordReset(_request);

            first.Should().NotBeNull();
            second.Should().BeNull();

            Subject.ResetPassword(_request, first, "whisparr", "newpassword").Should().BeTrue();
        }

        [Test]
        public void should_accept_a_configured_reset_token_in_place_of_a_generated_token()
        {
            Mocker.GetMock<IOptions<AuthOptions>>()
                .Setup(c => c.Value)
                .Returns(new AuthOptions { ResetToken = "abcdefghijklmnopqrst" });

            Subject.ResetPassword(_request, "abcdefghijklmnopqrst", "whisparr", "newpassword").Should().BeTrue();

            Mocker.GetMock<IUserService>()
                .Verify(c => c.Upsert("whisparr", "newpassword"), Times.Once());
        }

        [Test]
        public void should_accept_the_configured_reset_token_without_a_token_ever_being_requested()
        {
            Mocker.GetMock<IOptions<AuthOptions>>()
                .Setup(c => c.Value)
                .Returns(new AuthOptions { ResetToken = "abcdefghijklmnopqrst" });

            Subject.ResetPassword(_request, "abcdefghijklmnopqrst", "whisparr", "newpassword").Should().BeTrue();
        }

        [Test]
        public void should_not_allow_the_configured_reset_token_to_be_reused()
        {
            Mocker.GetMock<IOptions<AuthOptions>>()
                .Setup(c => c.Value)
                .Returns(new AuthOptions { ResetToken = "abcdefghijklmnopqrst" });

            Subject.ResetPassword(_request, "abcdefghijklmnopqrst", "whisparr", "newpassword").Should().BeTrue();
            Subject.ResetPassword(_request, "abcdefghijklmnopqrst", "whisparr", "anotherpassword").Should().BeFalse();
        }

        [Test]
        public void should_ignore_a_configured_reset_token_that_is_too_short()
        {
            Mocker.GetMock<IOptions<AuthOptions>>()
                .Setup(c => c.Value)
                .Returns(new AuthOptions { ResetToken = "tooshort" });

            Subject.ResetPassword(_request, "tooshort", "whisparr", "newpassword").Should().BeFalse();

            Mocker.GetMock<IUserService>()
                .Verify(c => c.Upsert(It.IsAny<string>(), It.IsAny<string>()), Times.Never());

            ExceptionVerification.ExpectedErrors(1);
        }

        [Test]
        public void should_reject_a_wrong_value_when_a_reset_token_is_configured()
        {
            Mocker.GetMock<IOptions<AuthOptions>>()
                .Setup(c => c.Value)
                .Returns(new AuthOptions { ResetToken = "abcdefghijklmnopqrst" });

            Subject.ResetPassword(_request, "NotTheToken", "whisparr", "newpassword").Should().BeFalse();

            Mocker.GetMock<IUserService>()
                .Verify(c => c.Upsert(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
        }
    }
}
