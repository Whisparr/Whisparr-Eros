using System.Collections.Generic;
using System.Linq;
using System.Net;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.MetadataSource.SkyHook;
using NzbDrone.Core.MetadataSource.SkyHook.Resource;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Studios;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MetadataSource.SkyHook
{
    [TestFixture]
    public class SkyHookProxyStudioDateSearchFixture : CoreTest<SkyHookProxy>
    {
        private const string BrazzersExxtraId = "39cee498-a9ac-4403-910a-1a0157ad22d8";
        private const string OtherStudioId = "5b1a7f0c-2a3e-4d7a-9e1b-6c0d8f4a2b3c";
        private const string FileName = "BrazzersExxtra.2024-05-17.Jane.Doe.Threeway.Tug.Of.War.1080p.mp4";

        private HttpRequest _capturedRequest;

        [SetUp]
        public void Setup()
        {
            _capturedRequest = null;

            GivenSearchReturns();
        }

        private void GivenSearchReturns(params MovieResource[] scenes)
        {
            Mocker.GetMock<IHttpClient>()
                .Setup(v => v.Get<List<MovieResource>>(It.IsAny<HttpRequest>()))
                .Returns((HttpRequest request) =>
                {
                    _capturedRequest = request;

                    var response = new HttpResponse(request, new HttpHeader(), scenes.ToList().ToJson(), HttpStatusCode.OK);

                    return new HttpResponse<List<MovieResource>>(response);
                });
        }

        private void GivenStudioInLibrary(string foreignId)
        {
            Mocker.GetMock<IStudioService>()
                .Setup(v => v.FindByTitle(It.IsAny<string>()))
                .Returns(new Studio { Title = "Brazzers Exxtra", CleanTitle = "brazzersexxtra", ForeignId = foreignId });
        }

        private static MovieResource Scene(string stashId, string title, string studioTitle, string studioId, string releaseDate)
        {
            return new MovieResource
            {
                ItemType = ItemType.Scene,
                ForeignIds = new ExternalIdResource { StashId = stashId },
                Title = title,
                ReleaseDate = releaseDate,
                Images = new List<ImageResource>(),
                Genres = new List<string>(),
                Studio = new StudioResource
                {
                    Title = studioTitle,
                    ForeignIds = new ExternalIdResource { StashId = studioId }
                }
            };
        }

        private List<string> SearchTitles(string term, ItemType itemType = ItemType.Scene)
        {
            return Subject.SearchForNewEntity(term, itemType)
                .Cast<Movie>()
                .Select(m => m.MovieMetadata.Value.Title)
                .ToList();
        }

        private Dictionary<string, string> QueryParams()
        {
            _capturedRequest.Should().NotBeNull();

            return _capturedRequest.Url.Query
                .Split('&')
                .Select(p => p.Split('='))
                .ToDictionary(p => p[0], p => WebUtility.UrlDecode(p[1]));
        }

        [Test]
        public void should_search_a_library_studio_by_id_and_date()
        {
            GivenStudioInLibrary(BrazzersExxtraId);

            SearchTitles(FileName);

            var query = QueryParams();
            query["studio"].Should().Be(BrazzersExxtraId);
            query["date"].Should().Be("2024-05-17");
            query["q"].Should().Be("brazzers exxtra 2024-05-17");
        }

        [Test]
        public void should_only_return_the_library_studio_on_the_parsed_date()
        {
            GivenStudioInLibrary(BrazzersExxtraId);
            GivenSearchReturns(
                Scene("a", "The Brazzers Podcast: Episode 17", "Brazzers Exxtra", BrazzersExxtraId, "2026-05-23"),
                Scene("b", "May 17, 2024", "CumClinic", OtherStudioId, "2024-05-17"),
                Scene("c", "Threeway Tug Of War", "Brazzers Exxtra", BrazzersExxtraId, "2024-05-17"),
                Scene("d", "Step Up! The Best Of Stepsisters", "Brazzers Exxtra", BrazzersExxtraId, "2024-05-17"));

            SearchTitles(FileName).Should().Equal("Threeway Tug Of War", "Step Up! The Best Of Stepsisters");
        }

        [Test]
        public void should_not_match_another_studio_with_the_same_name_as_the_library_studio()
        {
            GivenStudioInLibrary(BrazzersExxtraId);
            GivenSearchReturns(
                Scene("c", "Threeway Tug Of War", "Brazzers Exxtra", OtherStudioId, "2024-05-17"));

            SearchTitles(FileName).Should().BeEmpty();
        }

        [Test]
        public void should_search_by_name_when_studio_is_not_in_library()
        {
            SearchTitles(FileName);

            var query = QueryParams();
            query.Should().NotContainKey("studio");
            query.Should().NotContainKey("date");
            query["q"].Should().Be("brazzersexxtra 2024-05-17");
        }

        [Test]
        public void should_search_by_name_when_library_studio_has_no_stash_id()
        {
            GivenStudioInLibrary("tpdb-1234");

            SearchTitles(FileName);

            QueryParams().Should().NotContainKey("studio");
        }

        [Test]
        public void should_match_studio_by_clean_title_when_studio_is_not_in_library()
        {
            GivenSearchReturns(
                Scene("b", "May 17, 2024", "CumClinic", OtherStudioId, "2024-05-17"),
                Scene("a", "The Brazzers Podcast: Episode 17", "Brazzers Exxtra", BrazzersExxtraId, "2026-05-23"),
                Scene("c", "Threeway Tug Of War", "Brazzers Exxtra", BrazzersExxtraId, "2024-05-17"));

            SearchTitles(FileName).Should().Equal("Threeway Tug Of War");
        }

        [Test]
        public void should_return_nothing_when_no_result_is_from_the_parsed_studio()
        {
            // What StashDB returns for "brazzersexxtra 2024-05-17": only the date token matches
            GivenSearchReturns(
                Scene("e", "SpyTug 244-G17", "SpyTug", OtherStudioId, "2016-11-11"),
                Scene("b", "May 17, 2024", "CumClinic", OtherStudioId, "2024-05-17"),
                Scene("f", "May 17, 2024", "Cumpsters", OtherStudioId, "2024-05-17"));

            SearchTitles(FileName).Should().BeEmpty();
        }

        [Test]
        public void should_search_two_digit_year_scene_names_by_studio_and_date()
        {
            GivenStudioInLibrary(BrazzersExxtraId);

            SearchTitles("BrazzersExxtra.24.05.17.Jane.Doe.Threeway.Tug.Of.War.XXX.1080p.MP4-GROUP.mp4");

            var query = QueryParams();
            query["studio"].Should().Be(BrazzersExxtraId);
            query["date"].Should().Be("2024-05-17");
        }

        [Test]
        public void should_search_whole_name_without_filtering_when_there_is_no_date()
        {
            GivenSearchReturns(
                Scene("b", "May 17, 2024", "CumClinic", OtherStudioId, "2024-05-17"));

            SearchTitles("BrazzersExxtra.Jane.Doe.Threeway.Tug.Of.War.1080p.mp4").Should().Equal("May 17, 2024");

            var query = QueryParams();
            query.Should().NotContainKey("studio");
            query["q"].Should().StartWith("brazzersexxtra jane doe threeway tug of war");

            Mocker.GetMock<IStudioService>().Verify(v => v.FindByTitle(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_not_look_up_studio_for_movie_search()
        {
            SearchTitles(FileName, ItemType.Movie);

            Mocker.GetMock<IStudioService>().Verify(v => v.FindByTitle(It.IsAny<string>()), Times.Never());
        }
    }
}
