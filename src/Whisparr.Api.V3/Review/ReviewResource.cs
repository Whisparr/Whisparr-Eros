using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Qualities;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Review
{
    public class ReviewResource : RestResource
    {
        public int MovieId { get; set; }
        public List<ReviewCandidateResource> Candidates { get; set; }
        public string Title { get; set; }
        public int IndexerId { get; set; }
        public string Indexer { get; set; }
        public string InfoUrl { get; set; }
        public long Size { get; set; }
        public DownloadProtocol Protocol { get; set; }
        public QualityModel Quality { get; set; }
        public List<Language> Languages { get; set; }
        public List<ReviewReason> Reasons { get; set; }
        public ReviewItemStatus Status { get; set; }
        public DateTime? PublishDate { get; set; }
        public DateTime Added { get; set; }
    }

    public class ReviewCandidateResource
    {
        public int MovieId { get; set; }
        public string Title { get; set; }
        public string TitleSlug { get; set; }
        public string StudioTitle { get; set; }
        public string ReleaseDate { get; set; }
        public string Code { get; set; }
        public MovieParseMatchType? MatchType { get; set; }
        public bool HasFile { get; set; }
        public bool Monitored { get; set; }
    }

    public class ReviewBulkResource
    {
        public List<int> Ids { get; set; }
    }

    public class ReviewApproveResource
    {
        public List<int> Ids { get; set; }

        // The candidate to grab the release for, when it fits more than one scene
        public int? MovieId { get; set; }

        // Overrides the parsed quality, by quality id or name (e.g. "WEBDL-1080p")
        public int? QualityId { get; set; }
        public string Quality { get; set; }
    }

    public class ReviewActionResultResource
    {
        public List<int> Approved { get; set; } = new ();
        public List<ReviewActionFailureResource> Failed { get; set; } = new ();
    }

    public class ReviewActionFailureResource
    {
        public int Id { get; set; }
        public string Message { get; set; }
    }

    public class ReviewStatusResource
    {
        public int Count { get; set; }
    }

    public static class ReviewResourceMapper
    {
        public static ReviewResource ToResource(this ReviewItem model, IReadOnlyDictionary<int, Movie> movies)
        {
            if (model == null)
            {
                return null;
            }

            return new ReviewResource
            {
                Id = model.Id,
                MovieId = model.MovieId,
                Candidates = model.Candidates.Select(c => ToResource(c, movies.GetValueOrDefault(c.MovieId))).ToList(),
                Title = model.Title,
                IndexerId = model.IndexerId,
                Indexer = model.Indexer,
                InfoUrl = model.Release?.InfoUrl,
                Size = model.Size,
                Protocol = model.Release?.DownloadProtocol ?? DownloadProtocol.Unknown,
                Quality = model.Quality,
                Languages = model.ParsedMovieInfo?.Languages ?? new List<Language>(),
                Reasons = Enum.GetValues<ReviewReason>().Where(r => r != ReviewReason.None && model.Reason.HasFlag(r)).ToList(),
                Status = model.Status,
                PublishDate = model.Release?.PublishDate,
                Added = model.Added
            };
        }

        private static ReviewCandidateResource ToResource(ReviewItemCandidate candidate, Movie movie)
        {
            var resource = new ReviewCandidateResource
            {
                MovieId = candidate.MovieId,
                MatchType = candidate.MatchType
            };

            if (movie == null)
            {
                return resource;
            }

            var metadata = movie.MovieMetadata.Value;

            resource.Title = movie.Title;
            resource.TitleSlug = movie.TmdbId > 0 ? $"tmdb:{movie.TmdbId}" : metadata.ForeignId;
            resource.StudioTitle = metadata.StudioTitle;
            resource.ReleaseDate = metadata.ReleaseDate;
            resource.Code = metadata.Code;
            resource.HasFile = movie.HasFile;
            resource.Monitored = movie.Monitored;

            return resource;
        }
    }
}
