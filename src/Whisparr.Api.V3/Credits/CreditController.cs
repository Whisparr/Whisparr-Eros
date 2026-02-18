using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Credits;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace NzbDrone.Api.V3.Credits
{
    /// <summary>
    /// API controller for credit-related endpoints (cast and crew).
    /// </summary>
    [V3ApiController]
    public class CreditController : RestController<CreditResource>
    {
        private readonly ICreditService _creditService;
        private readonly IMovieService _movieService;
        private readonly IMapCoversToLocal _coverMapper;
        private readonly MovieMetadataType _whisparrMovieMetadataSource;

        /// <summary>
        /// Initializes a new instance of the <see cref="CreditController"/> class.
        /// </summary>
        /// <param name="creditService">Service for accessing and managing credits.</param>
        /// <param name="movieService">Service for accessing movie data.</param>
        /// <param name="coverMapper">Mapper used to convert remote cover URLs to local URLs.</param>
        /// <param name="configService">Configuration service providing application settings.</param>
        public CreditController(ICreditService creditService, IMovieService movieService, IMapCoversToLocal coverMapper, IConfigService configService)
        {
            _creditService = creditService;
            _movieService = movieService;
            _coverMapper = coverMapper;
            _whisparrMovieMetadataSource = configService.WhisparrMovieMetadataSource;
        }

        /// <summary>
        /// Retrieves a single credit resource by identifier.
        /// </summary>
        /// <param name="id">The credit identifier.</param>
        /// <returns>The <see cref="CreditResource"/> for the specified id, or null if not found.</returns>
        protected override CreditResource GetResourceById(int id)
        {
            return _creditService.GetById(id).ToResource(_whisparrMovieMetadataSource);
        }

        /// <summary>
        /// Retrieves credits filtered by movie id, movie metadata id, or performer id.
        /// If multiple filters are provided, precedence is: movieMetadataId, movieId, performerId.
        /// If no filters are provided, all credits are returned.
        /// </summary>
        /// <param name="movieId">Optional internal movie id to filter credits by movie.</param>
        /// <param name="movieMetadataId">Optional movie metadata id to filter credits by metadata record.</param>
        /// <param name="performerId">Optional performer foreign id to filter credits by performer.</param>
        /// <returns>A list of <see cref="CreditResource"/> matching the provided filter.</returns>
        [HttpGet]
        public List<CreditResource> GetCredits(int? movieId, int? movieMetadataId, string performerId)
        {
            var credits = new List<Credit>();
            if (movieMetadataId.HasValue)
            {
                return MapToResource(_creditService.GetAllCreditsForMovieMetadata(movieMetadataId.Value)).ToList();
            }

            if (movieId.HasValue)
            {
                var movie = _movieService.GetMovie(movieId.Value);

                if (movie != null)
                {
                    credits = _creditService.GetAllCreditsForMovieMetadata(movie.MovieMetadataId);
                    foreach (var credit in credits)
                    {
                        _coverMapper.ConvertToLocalPerformerUrls(credit.Performer.Id, credit.Images);
                    }
                }

                return MapToResource(credits).ToList();
            }

            if (performerId.IsNotNullOrWhiteSpace())
            {
                return MapToResource(_creditService.GetPerformerMovies(performerId)).ToList();
            }

            return MapToResource(_creditService.GetAllCredits()).ToList();
        }

        /// <summary>
        /// Maps domain <see cref="Credit"/> instances to <see cref="CreditResource"/> and converts image URLs to local URLs when present.
        /// </summary>
        /// <param name="credits">Enumerable of <see cref="Credit"/> to map.</param>
        /// <returns>Enumerable of mapped <see cref="CreditResource"/> instances.</returns>
        private IEnumerable<CreditResource> MapToResource(IEnumerable<Credit> credits)
        {
            foreach (var currentCredits in credits)
            {
                var resource = currentCredits.ToResource(_whisparrMovieMetadataSource);

                // Fix for MovieHeadshot not loading local images in Cast section
                if (resource.PerformerId != 0)
                {
                    _coverMapper.ConvertToLocalPerformerUrls(resource.PerformerId, resource.Images);
                }
                else if (resource.Images.Any())
                {
                    _coverMapper.ConvertToLocalUrls(0, resource.Images);
                }

                yield return resource;
            }
        }
    }
}
