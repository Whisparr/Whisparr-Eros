using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Core.Notifications.Pushover;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.NotificationTests.PushoverTests
{
    [TestFixture]
    public class PushoverProxyFixture : CoreTest<PushoverProxy>
    {
        private const string Key = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";

        private HttpRequest _sentRequest;

        [SetUp]
        public void Setup()
        {
            _sentRequest = null;

            Mocker.GetMock<IHttpClient>()
                  .Setup(c => c.Post(It.IsAny<HttpRequest>()))
                  .Callback<HttpRequest>(r => _sentRequest = r)
                  .Returns((HttpRequest r) => new HttpResponse(r, new HttpHeader(), Array.Empty<byte>()));
        }

        private static PushoverSettings GivenSettings(string encryptionKey)
        {
            return new PushoverSettings
            {
                ApiKey = "api",
                UserKey = "user",
                Devices = Array.Empty<string>(),
                Priority = 0,
                EncryptionKey = encryptionKey
            };
        }

        private Dictionary<string, string> GetFormParameters()
        {
            var body = Encoding.UTF8.GetString(_sentRequest.ContentData);
            var parsed = HttpUtility.ParseQueryString(body);

            return parsed.AllKeys.ToDictionary(k => k, k => parsed[k]);
        }

        // Mirrors the Pushover client side: strip the trailing HMAC, verify it over
        // the IV and ciphertext, then AES-CBC decrypt and gunzip what is left.
        private static string Decrypt(string payload, string hexKey)
        {
            var key = Convert.FromHexString(hexKey);
            var bytes = Convert.FromBase64String(payload);

            var ivAndCiphertext = bytes[..^32];
            var mac = bytes[^32..];

            using var hmac = new HMACSHA256(key);
            hmac.ComputeHash(ivAndCiphertext).Should().Equal(mac);

            using var aes = Aes.Create();
            aes.KeySize = 256;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            aes.Key = key;
            aes.IV = ivAndCiphertext[..16];

            using var decryptor = aes.CreateDecryptor();
            var compressed = decryptor.TransformFinalBlock(ivAndCiphertext, 16, ivAndCiphertext.Length - 16);

            using var input = new MemoryStream(compressed);
            using var gzip = new GZipStream(input, CompressionMode.Decompress);
            using var output = new MemoryStream();

            gzip.CopyTo(output);

            return Encoding.UTF8.GetString(output.ToArray());
        }

        [Test]
        public void should_send_plaintext_when_no_encryption_key_is_set()
        {
            Subject.SendNotification("Movie Grabbed", "Movie Title (2022)", GivenSettings(null));

            var parameters = GetFormParameters();

            parameters["title"].Should().Be("Movie Grabbed");
            parameters["message"].Should().Be("Movie Title (2022)");
            parameters.Should().NotContainKey("encrypted");
        }

        [Test]
        public void should_flag_the_request_as_encrypted_when_a_key_is_set()
        {
            Subject.SendNotification("Movie Grabbed", "Movie Title (2022)", GivenSettings(Key));

            GetFormParameters()["encrypted"].Should().Be("1");
        }

        [Test]
        public void should_round_trip_title_and_message_through_encryption()
        {
            Subject.SendNotification("Movie Grabbed", "Movie Title (2022)", GivenSettings(Key));

            var parameters = GetFormParameters();

            Decrypt(parameters["title"], Key).Should().Be("Movie Grabbed");
            Decrypt(parameters["message"], Key).Should().Be("Movie Title (2022)");
        }

        [Test]
        public void should_round_trip_non_ascii_content()
        {
            const string message = "Ma vie sexuelle — épisode 1 · 日本語";

            Subject.SendNotification("Grabbed", message, GivenSettings(Key));

            Decrypt(GetFormParameters()["message"], Key).Should().Be(message);
        }

        [Test]
        public void should_use_a_fresh_iv_for_every_field()
        {
            Subject.SendNotification("Same", "Same", GivenSettings(Key));

            var parameters = GetFormParameters();

            parameters["title"].Should().NotBe(parameters["message"]);
        }

        [Test]
        public void should_accept_an_upper_case_hex_key()
        {
            Subject.SendNotification("Grabbed", "Movie Title", GivenSettings(Key.ToUpperInvariant()));

            Decrypt(GetFormParameters()["message"], Key).Should().Be("Movie Title");
        }

        [TestCase("")]
        [TestCase("   ")]
        [TestCase(null)]
        public void should_not_encrypt_for_a_blank_key(string encryptionKey)
        {
            Subject.SendNotification("Grabbed", "Movie Title", GivenSettings(encryptionKey));

            GetFormParameters().Should().NotContainKey("encrypted");
        }

        // HexStringToBytes throws on anything that is not exactly 64 hex chars,
        // so the validator has to reject those before a notification is sent.
        [TestCase("deadbeef")]
        [TestCase("00112233445566778899aabbccddeeff00112233445566778899aabbccddeegg")]
        [TestCase("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f0")]
        public void should_reject_a_malformed_encryption_key(string encryptionKey)
        {
            GivenSettings(encryptionKey).Validate().IsValid.Should().BeFalse();
        }

        [TestCase(Key)]
        [TestCase(null)]
        [TestCase("")]
        public void should_accept_a_valid_or_absent_encryption_key(string encryptionKey)
        {
            GivenSettings(encryptionKey).Validate().IsValid.Should().BeTrue();
        }
    }
}
