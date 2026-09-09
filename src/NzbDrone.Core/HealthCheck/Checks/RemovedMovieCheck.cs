using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Localization;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Events;

namespace NzbDrone.Core.HealthCheck.Checks
{
    [CheckOn(typeof(MovieUpdatedEvent))]
    [CheckOn(typeof(MoviesDeletedEvent))]
    [CheckOn(typeof(MovieRefreshCompleteEvent))]
    public class RemovedMovieCheck : HealthCheckBase, ICheckOnCondition<MovieUpdatedEvent>, ICheckOnCondition<MoviesDeletedEvent>
    {
        private readonly IMovieService _movieService;

        public RemovedMovieCheck(IMovieService movieService, ILocalizationService localizationService)
            : base(localizationService)
        {
            _movieService = movieService;
        }

        public override HealthCheck Check()
        {
            var deletedItems = _movieService.GetAllMovies().Where(v => v.MovieMetadata.Value.Status == MovieStatusType.Deleted).ToList();

            if (deletedItems.Empty())
            {
                return new HealthCheck(GetType());
            }

            var movies = deletedItems.Where(i => i.MovieMetadata.Value.ItemType == ItemType.Movie).ToList();
            var scenes = deletedItems.Where(i => i.MovieMetadata.Value.ItemType == ItemType.Scene).ToList();

            var messages = new List<string>();

            if (!movies.Empty())
            {
                var movieText = movies.Select(s => $"[{s.Title}](/movie/{s.Id}) (tmdbid {s.ForeignId})").Join(", ");

                messages.Add(movies.Count == 1
                    ? _localizationService.GetLocalizedString("RemovedMovieCheckSingleMessage", new Dictionary<string, object>
                    {
                        { "movie", movieText }
                    })
                    : _localizationService.GetLocalizedString("RemovedMovieCheckMultipleMessage", new Dictionary<string, object>
                    {
                        { "movies", movieText }
                    }));
            }

            if (!scenes.Empty())
            {
                var sceneText = scenes.Select(s => $"[{s.Title}](/movie/{s.Id}) (stashid {s.ForeignId})").Join(", ");

                messages.Add(scenes.Count == 1
                    ? _localizationService.GetLocalizedString("RemovedMovieCheckSceneSingleMessage", new Dictionary<string, object>
                    {
                        { "scene", sceneText }
                    })
                    : _localizationService.GetLocalizedString("RemovedMovieCheckSceneMultipleMessage", new Dictionary<string, object>
                    {
                        { "scenes", sceneText }
                    }));
            }

            // The wiki only documents removal from TMDb; there is no section for StashDB scenes yet.
            var wikiFragment = scenes.Empty() ? "#movie-was-removed-from-tmdb" : null;

            return new HealthCheck(GetType(), HealthCheckResult.Error, HealthCheckReason.RemovedMovie, messages.Join("; "), wikiFragment);
        }

        public bool ShouldCheckOnEvent(MoviesDeletedEvent message)
        {
            return message.Movies.Any(m => m.MovieMetadata.Value.Status == MovieStatusType.Deleted);
        }

        public bool ShouldCheckOnEvent(MovieUpdatedEvent message)
        {
            return message.Movie.MovieMetadata.Value.Status == MovieStatusType.Deleted;
        }
    }
}
