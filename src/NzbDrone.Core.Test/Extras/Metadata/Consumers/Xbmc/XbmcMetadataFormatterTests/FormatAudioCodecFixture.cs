using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Extras.Metadata.Consumers.Xbmc;
using NzbDrone.Core.MediaFiles.MediaInfo;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.Extras.Metadata.Consumers.Xbmc.XbmcMetadataFormatterTests
{
    [TestFixture]
    public class FormatAudioCodecFixture : TestBase
    {
        [TestCase("dts", "DTS-HD HRA", "dtshd_hra")]
        [TestCase("dts", "DTS-HD MA", "dtshd_ma")]
        [TestCase("dts", "DTS-HD MA + DTS:X", "dtshd_ma_x")]
        [TestCase("dts", "DTS-HD MA + DTS:X IMAX", "dtshd_ma_x_imax")]
        [TestCase("dts", "DTS", "dts")]
        [TestCase("truehd", "Dolby TrueHD + Dolby Atmos", "truehd_atmos")]
        [TestCase("truehd", "", "truehd")]
        [TestCase("eac3", "Dolby Digital Plus + Dolby Atmos", "eac3_ddp_atmos")]
        [TestCase("eac3", "", "eac3")]
        [TestCase("aac", "LC", "aac_lc")]
        [TestCase("aac", "HE-AAC", "he_aac")]
        [TestCase("aac", "HE-AACv2", "he_aac_v2")]
        [TestCase("aac", "SSR", "aac_ssr")]
        [TestCase("aac", "LTP", "aac_ltp")]
        [TestCase("aac", "", "aac")]
        public void should_format_audio_codec_for_kodi(string audioFormat, string audioProfile, string expected)
        {
            var mediaInfo = new MediaInfoModel
            {
                AudioFormat = audioFormat,
                AudioProfile = audioProfile
            };

            XbmcMetadataFormatter.FormatAudioCodec(mediaInfo).Should().Be(expected);
        }

        [Test]
        public void should_return_audio_format_by_default()
        {
            var mediaInfo = new MediaInfoModel
            {
                AudioFormat = "Other Audio Format"
            };

            XbmcMetadataFormatter.FormatAudioCodec(mediaInfo).Should().Be(mediaInfo.AudioFormat);
        }

        [Test]
        public void should_return_empty_when_media_info_is_null()
        {
            XbmcMetadataFormatter.FormatAudioCodec(null).Should().Be(string.Empty);
        }

        [Test]
        public void should_return_empty_when_audio_format_is_null()
        {
            XbmcMetadataFormatter.FormatAudioCodec(new MediaInfoModel()).Should().Be(string.Empty);
        }
    }
}
