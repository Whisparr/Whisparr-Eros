using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;

namespace NzbDrone.Core.Download.Review
{
    public class ReviewItem : ModelBase
    {
        // The candidate the release was evaluated against, the first of Candidates
        public int MovieId { get; set; }
        public List<ReviewItemCandidate> Candidates { get; set; }
        public string Title { get; set; }
        public int IndexerId { get; set; }
        public string Indexer { get; set; }
        public string Guid { get; set; }
        public long Size { get; set; }
        public ReleaseInfo Release { get; set; }
        public ReviewItemTorrentInfo TorrentInfo { get; set; }
        public ParsedMovieInfo ParsedMovieInfo { get; set; }
        public QualityModel Quality { get; set; }
        public ReviewReason Reason { get; set; }
        public ReviewItemStatus Status { get; set; }
        public ReleaseSourceType ReleaseSource { get; set; }
        public DateTime Added { get; set; }

        // Not persisted
        public Movie Movie { get; set; }

        public ReviewItem()
        {
            Candidates = new List<ReviewItemCandidate>();
        }

        public List<int> CandidateMovieIds => Candidates.Select(c => c.MovieId).ToList();

        // Approved for a scene the user picked rather than one the release matched
        public bool ManuallyMatched => Candidates.Any(c => c.Manual && c.MovieId == MovieId);

        // The stored release is deserialized as a plain ReleaseInfo, put the torrent details back for the download client and blocklist
        public ReleaseInfo GetRelease()
        {
            if (TorrentInfo == null || Release == null)
            {
                return Release;
            }

            return new TorrentInfo
            {
                Guid = Release.Guid,
                Title = Release.Title,
                Size = Release.Size,
                DownloadUrl = Release.DownloadUrl,
                InfoUrl = Release.InfoUrl,
                CommentUrl = Release.CommentUrl,
                IndexerId = Release.IndexerId,
                Indexer = Release.Indexer,
                IndexerPriority = Release.IndexerPriority,
                DownloadProtocol = Release.DownloadProtocol,
                TmdbId = Release.TmdbId,
                ImdbId = Release.ImdbId,
                PublishDate = Release.PublishDate,
                Origin = Release.Origin,
                Source = Release.Source,
                Container = Release.Container,
                Codec = Release.Codec,
                Resolution = Release.Resolution,
                Languages = Release.Languages,
                IndexerFlags = Release.IndexerFlags,
                MagnetUrl = TorrentInfo.MagnetUrl,
                InfoHash = TorrentInfo.InfoHash,
                Seeders = TorrentInfo.Seeders,
                Peers = TorrentInfo.Peers
            };
        }
    }

    public class ReviewItemCandidate : IEmbeddedDocument
    {
        public int MovieId { get; set; }
        public MovieParseMatchType? MatchType { get; set; }

        // Picked by the user when approving, the release didn't match this scene on its own
        public bool Manual { get; set; }
    }

    public class ReviewItemTorrentInfo : IEmbeddedDocument
    {
        public string MagnetUrl { get; set; }
        public string InfoHash { get; set; }
        public int? Seeders { get; set; }
        public int? Peers { get; set; }
    }

    [Flags]
    public enum ReviewReason
    {
        None = 0,

        // Matched one scene of the studio, but only on performers, characters or part of the title
        WeakMatch = 1,

        // Matched a few scenes of the studio equally well
        AmbiguousMatch = 2,

        // Matched, but the quality could not be parsed from the release title
        UnknownQuality = 4
    }

    public enum ReviewItemStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }
}
