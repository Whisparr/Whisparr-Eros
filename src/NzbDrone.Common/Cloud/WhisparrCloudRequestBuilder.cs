using NzbDrone.Common.Http;
namespace NzbDrone.Common.Cloud
{
    public interface IWhisparrCloudRequestBuilder
    {
        IHttpRequestBuilderFactory Services { get; }
        IHttpRequestBuilderFactory TMDB { get; }
        IHttpRequestBuilderFactory WhisparrMetadata { get; }
        IHttpRequestBuilderFactory StashDB { get; }
        IHttpRequestBuilderFactory GithubReleases { get; }
        IHttpRequestBuilderFactory GithubLatestRelease { get; }
    }

    public class WhisparrCloudRequestBuilder : IWhisparrCloudRequestBuilder
    {
        public WhisparrCloudRequestBuilder()
        {
            Services = new HttpRequestBuilder("https://whisparr.servarr.com/v1/")
                .CreateFactory();

            TMDB = new HttpRequestBuilder("https://api.themoviedb.org/{api}/{route}/{id}{secondaryRoute}")
                .SetHeader("Authorization", $"Bearer {AuthToken}")
                .CreateFactory();

            WhisparrMetadata = new HttpRequestBuilder("https://api.whisparr.com/v4/{route}")
                .CreateFactory();

            StashDB = new HttpRequestBuilder("https://stashdb.org/graphql")
                .CreateFactory();

            GithubReleases = new HttpRequestBuilder("https://api.github.com/repos/{githubownerrepo}/releases")
                .CreateFactory();

            // Returns the newest non-draft, non-prerelease release. The stable branch
            // uses this rather than paging the list, because develop publishes a release
            // per merge and buries the newest stable one well past any page size.
            GithubLatestRelease = new HttpRequestBuilder("https://api.github.com/repos/{githubownerrepo}/releases/latest")
                .CreateFactory();
        }

        public IHttpRequestBuilderFactory Services { get; private set; }
        public IHttpRequestBuilderFactory TMDB { get; private set; }
        public IHttpRequestBuilderFactory WhisparrMetadata { get; private set; }
        public IHttpRequestBuilderFactory StashDB { get; private set; }
        public IHttpRequestBuilderFactory GithubReleases { get; private set; }
        public IHttpRequestBuilderFactory GithubLatestRelease { get; private set; }

        public string AuthToken => "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYTczNzMzMDE5NjFkMDNmOTdmODUzYTg3NmRkMTIxMiIsInN1YiI6IjU4NjRmNTkyYzNhMzY4MGFiNjAxNzUzNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gh1BwogCCKOda6xj9FRMgAAj_RYKMMPC3oNlcBtlmwk";
    }
}
