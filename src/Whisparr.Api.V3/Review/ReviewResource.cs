using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Download.Review;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Credits;
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

        // Approved for a scene the user picked rather than one of the candidates
        public bool ManualMatch { get; set; }

        // Default search for the scene on the metadata source
        public string LookupTerm { get; set; }
    }

    public class ReviewCandidateResource
    {
        public int MovieId { get; set; }

        // The scene on the metadata source, MovieId is 0 for a scene that isn't in the library yet
        public string ForeignId { get; set; }
        public bool InLibrary { get; set; }
        public string Title { get; set; }
        public string TitleSlug { get; set; }
        public string StudioTitle { get; set; }
        public string ReleaseDate { get; set; }
        public string Code { get; set; }
        public List<string> PerformerNames { get; set; } = new ();
        public MovieParseMatchType? MatchType { get; set; }
        public bool Manual { get; set; }
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

        // MovieId may be any scene in the library, not only a candidate
        public bool ManualMatch { get; set; }

        // With ManualMatch, a scene on the metadata source instead of MovieId. It is added to the library when it isn't there yet
        public string ForeignId { get; set; }

        // Overrides the parsed quality, by quality id or name (e.g. "WEBDL-1080p")
        public int? QualityId { get; set; }
        public string Quality { get; set; }

        // Per release choices, approved together with Ids
        public List<ReviewApproveItemResource> Items { get; set; }
    }

    public class ReviewApproveItemResource
    {
        public int Id { get; set; }
        public int? MovieId { get; set; }
        public string ForeignId { get; set; }
        public bool ManualMatch { get; set; }
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
                Added = model.Added,
                ManualMatch = model.ManuallyMatched,
                LookupTerm = ReviewService.GetLookupTerm(model)
            };
        }

        // A scene offered when choosing a different one for a release
        public static ReviewCandidateResource ToSceneResource(this Movie movie)
        {
            return ToResource(new ReviewItemCandidate { MovieId = movie.Id }, movie);
        }

        private static ReviewCandidateResource ToResource(ReviewItemCandidate candidate, Movie movie)
        {
            var resource = new ReviewCandidateResource
            {
                MovieId = candidate.MovieId,
                MatchType = candidate.MatchType,
                Manual = candidate.Manual
            };

            if (movie == null)
            {
                return resource;
            }

            var metadata = movie.MovieMetadata.Value;

            resource.Title = movie.Title;
            resource.ForeignId = metadata.ForeignId;
            resource.InLibrary = movie.Id > 0;
            resource.TitleSlug = !resource.InLibrary ? null : movie.TmdbId > 0 ? $"tmdb:{movie.TmdbId}" : metadata.ForeignId;
            resource.StudioTitle = metadata.StudioTitle;
            resource.ReleaseDate = metadata.ReleaseDate;
            resource.Code = metadata.Code;
            resource.PerformerNames = GetPerformerNames(metadata);
            resource.HasFile = movie.HasFile;
            resource.Monitored = movie.Monitored;

            return resource;
        }

        // A scene from the metadata source only carries its performers as credits
        private static List<string> GetPerformerNames(MovieMetadata metadata)
        {
            if (metadata.PerformerNames?.Count > 0)
            {
                return metadata.PerformerNames;
            }

            return (metadata.Credits ?? new List<Credit>())
                   .Select(c => c.Performer?.Name ?? c.PersonName)
                   .Where(n => n.IsNotNullOrWhiteSpace())
                   .Distinct()
                   .ToList();
        }
    }
}
