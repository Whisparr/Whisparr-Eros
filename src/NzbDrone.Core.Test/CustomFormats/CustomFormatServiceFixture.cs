using System.Collections.Generic;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.CustomFormats
{
    [TestFixture]
    public class CustomFormatServiceFixture : CoreTest<CustomFormatService>
    {
        [SetUp]
        public void Setup()
        {
            Mocker.SetConstant<ICacheManager>(Mocker.Resolve<CacheManager>());

            Mocker.GetMock<ICustomFormatRepository>()
                  .Setup(s => s.All())
                  .Returns(new List<CustomFormat>
                  {
                      new CustomFormat("x264") { Id = 1 }
                  });
        }

        [Test]
        public void get_by_id_should_return_custom_format()
        {
            Subject.GetById(1).Name.Should().Be("x264");
        }

        [Test]
        public void get_by_id_should_throw_model_not_found_for_unknown_id()
        {
            var ex = Assert.Throws<ModelNotFoundException>(() => Subject.GetById(999));

            ex.Message.Should().Contain("ID 999");
        }
    }
}
