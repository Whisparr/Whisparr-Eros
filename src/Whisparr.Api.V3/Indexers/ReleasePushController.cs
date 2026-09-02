using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.Download;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.Qualities;
using Whisparr.Http;

namespace Whisparr.Api.V3.Indexers
{
    [V3ApiController("release/push")]
    public class ReleasePushController : ReleaseControllerBase
    {
        private readonly IMakeDownloadDecision _downloadDecisionMaker;
        private readonly IProcessDownloadDecisions _downloadDecisionProcessor;
        private readonly IIndexerFactory _indexerFactory;
        private readonly IDownloadClientFactory _downloadClientFactory;
        private readonly Logger _logger;

        private static readonly object PushLock = new object();

        public ReleasePushController(IMakeDownloadDecision downloadDecisionMaker,
                                 IProcessDownloadDecisions downloadDecisionProcessor,
                                 IIndexerFactory indexerFactory,
                                 IDownloadClientFactory downloadClientFactory,
                                 IQualityProfileService qualityProfileService,
                                 Logger logger)
            : base(qualityProfileService)
        {
            _downloadDecisionMaker = downloadDecisionMaker;
            _downloadDecisionProcessor = downloadDecisionProcessor;
            _indexerFactory = indexerFactory;
            _downloadClientFactory = downloadClientFactory;
            _logger = logger;

            PostValidator.RuleFor(s => s.Title).NotEmpty();
            PostValidator.RuleFor(s => s.DownloadUrl).NotEmpty().When(s => s.MagnetUrl.IsNullOrWhiteSpace());
            PostValidator.RuleFor(s => s.MagnetUrl).NotEmpty().When(s => s.DownloadUrl.IsNullOrWhiteSpace());
            PostValidator.RuleFor(s => s.Protocol).NotEmpty();
            PostValidator.RuleFor(s => s.PublishDate).NotEmpty();
        }

        [HttpPost]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<List<ReleaseResource>> Create([FromBody] ReleaseResource release)
        {
            _logger.Info("Release pushed: {0} - {1}", release.Title.ForLog(), (release.DownloadUrl ?? release.MagnetUrl).ForLog());

            ValidateResource(release);

            var info = release.ToModel();

            info.Guid = "PUSH-" + info.DownloadUrl;

            ResolveIndexer(info);

            var downloadClientId = ResolveDownloadClientId(release);

            DownloadDecision decision;

            lock (PushLock)
            {
                var decisions = _downloadDecisionMaker.GetRssDecision(new List<ReleaseInfo> { info }, true);

                decision = decisions.FirstOrDefault();

                // If parsing failed (no decision or missing parsed info), create a rejection decision
                if (decision == null || decision.RemoteMovie?.ParsedMovieInfo == null)
                {
                    var remoteMovie = new RemoteMovie
                    {
                        Release = info,
                        ParsedMovieInfo = new ParsedMovieInfo
                        {
                            Quality = new QualityModel(),
                            Languages = LanguageParser.ParseLanguages(info.Title)
                        },
                        Languages = LanguageParser.ParseLanguages(info.Title)
                    };

                    decision = new DownloadDecision(remoteMovie, new DownloadRejection(DownloadRejectionReason.UnableToParse, "Unable to parse movie from release information"));
                }

                _downloadDecisionProcessor.ProcessDecision(decision, downloadClientId).GetAwaiter().GetResult();
            }

            // Return the decision(s) (will include rejection info, if any)
            _logger.Info("Release push processing completed: {0} - {1}", release.Title.ForLog(), decision.Approved ? "Approved" : "Rejected");
            return MapDecisions(new[] { decision });
        }

        private void ResolveIndexer(ReleaseInfo release)
        {
            // ReleaseInfo.IndexerId is a non-nullable int, so an omitted indexer arrives as 0.
            // Passing that straight through would have the factory reject the push outright.
            var indexerId = release.IndexerId == 0 ? (int?)null : release.IndexerId;
            var indexer = _indexerFactory.ResolveIndexer(indexerId, release.Indexer);

            if (indexer == null)
            {
                _logger.Debug("Push Release {0} not associated with an indexer.", release.Title.ForLog());
            }
            else
            {
                _logger.Debug("Push Release {0} associated with indexer '{1}' ({2})", release.Title.ForLog(), indexer.Name.ForLog(), indexer.Id);

                release.IndexerId = indexer.Id;
                release.Indexer = indexer.Name;
            }
        }

        private int? ResolveDownloadClientId(ReleaseResource release)
        {
            var downloadClient = _downloadClientFactory.ResolveDownloadClient(release.DownloadClientId, release.DownloadClient);

            if (downloadClient == null)
            {
                _logger.Debug("Push Release {0} not associated with a download client.", release.Title.ForLog());
            }
            else
            {
                _logger.Debug("Push Release {0} associated with download client '{1}' ({2})", release.Title.ForLog(), downloadClient.Name.ForLog(), downloadClient.Id);
            }

            return downloadClient?.Id;
        }
    }
}
