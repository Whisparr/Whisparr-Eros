using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.MediaFiles;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Movies
{
    [V3ApiController("rename")]
    public class RenameMovieController : Controller
    {
        private readonly IRenameMovieFileService _renameMovieFileService;

        public RenameMovieController(IRenameMovieFileService renameMovieFileService)
        {
            _renameMovieFileService = renameMovieFileService;
        }

        [HttpGet]
        public List<RenameMovieResource> GetMovies([FromQuery(Name = "movieId")] List<int> movieIds,
                                                   [FromQuery] string performerForeignId,
                                                   [FromQuery] string studioForeignId)
        {
            var hasMovieIds = movieIds is { Count: not 0 };
            var hasPerformer = performerForeignId.IsNotNullOrWhiteSpace();
            var hasStudio = studioForeignId.IsNotNullOrWhiteSpace();

            if (new[] { hasMovieIds, hasPerformer, hasStudio }.Count(x => x) != 1)
            {
                throw new BadRequestException("Exactly one of movieId, performerForeignId or studioForeignId must be provided");
            }

            if (hasPerformer)
            {
                return _renameMovieFileService.GetRenamePreviewsForPerformer(performerForeignId).ToResource();
            }

            if (hasStudio)
            {
                return _renameMovieFileService.GetRenamePreviewsForStudio(studioForeignId).ToResource();
            }

            return _renameMovieFileService.GetRenamePreviews(movieIds).ToResource();
        }
    }
}
