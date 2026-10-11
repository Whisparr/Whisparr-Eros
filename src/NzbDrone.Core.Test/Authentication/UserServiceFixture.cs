using System;
using FluentAssertions;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Authentication
{
    [TestFixture]
    public class UserServiceFixture : CoreTest<UserService>
    {
        private const string Password = "hunter2";

        private User _user;

        [SetUp]
        public void Setup()
        {
            _user = GivenUser(10000);

            Mocker.GetMock<IUserRepository>()
                  .Setup(s => s.FindUser("user"))
                  .Returns(() => _user);

            Mocker.GetMock<IUserRepository>()
                  .Setup(s => s.Update(It.IsAny<User>()))
                  .Returns<User>(u => u);
        }

        private static User GivenUser(int iterations)
        {
            var salt = new byte[16];

            return new User
            {
                Username = "user",
                Salt = Convert.ToBase64String(salt),
                Iterations = iterations,
                Password = Convert.ToBase64String(KeyDerivation.Pbkdf2(Password, salt, KeyDerivationPrf.HMACSHA512, iterations, 32))
            };
        }

        [Test]
        public void should_rehash_a_password_stored_with_fewer_iterations()
        {
            var oldHash = _user.Password;

            var user = Subject.FindUser("user", Password);

            user.Should().NotBeNull();
            user.Iterations.Should().Be(220000);
            user.Password.Should().NotBe(oldHash);

            Mocker.GetMock<IUserRepository>().Verify(v => v.Update(It.IsAny<User>()), Times.Once());
        }

        [Test]
        public void should_not_rehash_a_password_already_at_current_iterations()
        {
            _user = GivenUser(220000);

            Subject.FindUser("user", Password).Should().NotBeNull();

            Mocker.GetMock<IUserRepository>().Verify(v => v.Update(It.IsAny<User>()), Times.Never());
        }

        [Test]
        public void should_keep_the_stored_password_when_upserting_without_one()
        {
            var oldHash = _user.Password;

            Mocker.GetMock<IUserRepository>()
                  .Setup(s => s.SingleOrDefault())
                  .Returns(_user);

            var user = Subject.Upsert("Renamed", null);

            user.Username.Should().Be("renamed");
            user.Password.Should().Be(oldHash);
        }

        [Test]
        public void should_not_add_a_user_without_a_password()
        {
            Subject.Upsert("user", null).Should().BeNull();

            Mocker.GetMock<IUserRepository>().Verify(v => v.Insert(It.IsAny<User>()), Times.Never());
        }

        [Test]
        public void should_not_find_user_with_wrong_password()
        {
            Subject.FindUser("user", "wrong").Should().BeNull();

            Mocker.GetMock<IUserRepository>().Verify(v => v.Update(It.IsAny<User>()), Times.Never());
        }
    }
}
