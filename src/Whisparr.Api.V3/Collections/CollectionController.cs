using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Datastore.Events;
using NzbDrone.Core.ImportLists.ImportExclusions;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Collections;
using NzbDrone.Core.Movies.Commands;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Organizer;
using NzbDrone.SignalR;
using Whisparr.Http;
using Whisparr.Http.REST;
using Whisparr.Http.REST.Attributes;

namespace Whisparr.Api.V3.Collections
{
    [V3ApiController]
    public class CollectionController : RestControllerWithSignalR<CollectionResource, MovieCollection>,
                                        IHandle<CollectionAddedEvent>,
                                        IHandle<CollectionEditedEvent>,
                                        IHandle<CollectionDeletedEvent>
    {
        private readonly IMovieCollectionService _collectionService;
        private readonly IImportListExclusionService _exclusionService;
        private readonly IMovieService _movieService;
        private readonly IMovieMetadataService _movieMetadataService;
        private readonly IImportListExclusionService _importListExclusionService;
        private readonly IConfigService _configService;
        private readonly IBuildFileNames _fileNameBuilder;
        private readonly INamingConfigService _namingService;
        private readonly IManageCommandQueue _commandQueueManager;

        /// <summary>
        /// Initializes a new instance of the <see cref="CollectionController"/> class.
        /// </summary>
        /// <param name="signalRBroadcaster">SignalR broadcaster used to push resource change notifications.</param>
        /// <param name="collectionService">Service for movie collections.</param>
        /// <param name="exclusionService">Service for Import List Exclusions</param>
        /// <param name="movieService">Service for movies.</param>
        /// <param name="movieMetadataService">Service to retrieve movie metadata (external sources).</param>
        /// <param name="importListExclusionService">Service used to check import list exclusions.</param>
        /// <param name="configService">Application configuration service.</param>
        /// <param name="fileNameBuilder">Builder for movie folder/file naming.</param>
        /// <param name="namingService">Naming configuration service.</param>
        /// <param name="commandQueueManager">Command queue manager used to enqueue background commands.</param>
        public CollectionController(IBroadcastSignalRMessage signalRBroadcaster,
                                    IMovieCollectionService collectionService,
                                    IImportListExclusionService exclusionService,
                                    IMovieService movieService,
                                    IMovieMetadataService movieMetadataService,
                                    IImportListExclusionService importListExclusionService,
                                    IConfigService configService,
                                    IBuildFileNames fileNameBuilder,
                                    INamingConfigService namingService,
                                    IManageCommandQueue commandQueueManager)
            : base(signalRBroadcaster)
        {
            _collectionService = collectionService;
            _exclusionService = exclusionService;
            _movieService = movieService;
            _movieMetadataService = movieMetadataService;
            _importListExclusionService = importListExclusionService;
            _configService = configService;
            _fileNameBuilder = fileNameBuilder;
            _namingService = namingService;
            _commandQueueManager = commandQueueManager;
        }

        protected override CollectionResource GetResourceById(int id)
        {
            return MapToResource(_collectionService.GetCollection(id));
        }

        /// <summary>
        /// Retrieves collections. If <paramref name="tmdbId"/> is provided returns the single matching collection;
        /// otherwise returns all collections.
        /// </summary>
        /// <param name="tmdbId">Optional TMDB collection id to filter by.</param>
        /// <returns>List of <see cref="CollectionResource"/> matching the request.</returns>
        [HttpGet]
        [Produces("application/json")]
        public List<CollectionResource> GetCollections(int? tmdbId)
        {
            var collectionResources = new List<CollectionResource>();

            if (tmdbId.HasValue)
            {
                var collection = _collectionService.FindByTmdbId(tmdbId.Value);

                if (collection != null)
                {
                    collectionResources.AddIfNotNull(MapToResource(collection));
                }
            }
            else
            {
                collectionResources = MapToResource(_collectionService.GetAllCollections()).ToList();
            }

            return collectionResources;
        }

        /// <summary>
        /// Updates a single collection.
        /// </summary>
        /// <param name="collectionResource">The collection resource containing updated values. The resource's Id is used to locate the existing collection.</param>
        /// <returns>Accepted result with the updated collection Id.</returns>
        [RestPutById]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<CollectionResource> UpdateCollection([FromBody] CollectionResource collectionResource)
        {
            var collection = _collectionService.GetCollection(collectionResource.Id);

            var model = collectionResource.ToModel(collection);

            var updatedMovie = _collectionService.UpdateCollection(model);

            return Accepted(updatedMovie.Id);
        }

        /// <summary>
        /// Bulk update for multiple collections. Only properties present in the request are applied.
        /// </summary>
        /// <param name="resource">The update resource containing collection ids and the properties to change.</param>
        /// <returns>Accepted result containing the updated collection resources.</returns>
        [HttpPut]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult UpdateCollections([FromBody] CollectionUpdateResource resource)
        {
            var collectionsToUpdate = _collectionService.GetCollections(resource.CollectionIds).ToList();

            foreach (var collection in collectionsToUpdate)
            {
                if (resource.Monitored.HasValue)
                {
                    collection.Monitored = resource.Monitored.Value;
                }

                if (resource.QualityProfileId.HasValue)
                {
                    collection.QualityProfileId = resource.QualityProfileId.Value;
                }

                if (resource.RootFolderPath.IsNotNullOrWhiteSpace())
                {
                    collection.RootFolderPath = resource.RootFolderPath;
                }

                if (resource.SearchOnAdd.HasValue)
                {
                    collection.SearchOnAdd = resource.SearchOnAdd.Value;
                }

                if (resource.MonitorMovies.HasValue)
                {
                    var movies = _movieService.GetMoviesByCollectionTmdbId(collection.TmdbId);

                    movies.ForEach(c => c.Monitored = resource.MonitorMovies.Value);

                    _movieService.UpdateMovie(movies, true);
                }
            }

            var updated = _collectionService.UpdateCollections(collectionsToUpdate).ToResource();

            _commandQueueManager.Push(new RefreshCollectionsCommand());

            return Accepted(updated);
        }

        /// <summary>Deletes a collection and their associated movies/scenes from Whisparr</summary>
        /// <param name="id">The internal ID of the colection to delete</param>
        /// <param name="deleteFiles">If true, associated movie/scene files will also be deleted from disk</param>
        /// <param name="addImportExclusion">If true, an import exclusion will be added to prevent re-adding the collection in future imports</param>
        [RestDeleteById]
        public void DeleteCollection(int id, bool deleteFiles = false, bool addImportExclusion = false)
        {
            var collection = _collectionService.GetCollection(id);

            if (collection == null)
            {
                return;
            }

            // Get the movies for the collection
            var movies = _movieService.GetMoviesByCollectionTmdbId(collection.TmdbId);
            var movieIds = movies.Select(x => x.Id).ToList();
            _movieService.DeleteMovies(movieIds, deleteFiles);

            if (addImportExclusion)
            {
                var exclusion = new ImportListExclusion();
                exclusion.ForeignId = collection.TmdbId.ToString();
                exclusion.MovieTitle = collection.Title;
                exclusion.Type = ImportExclusionType.Collection;
                exclusion.Reason = ImportExclusionReason.DuringDelete;

                _exclusionService.AddExclusion(exclusion);
            }

            // Remove the Collection now that the associated scenes have been removed
            _collectionService.RemoveCollection(collection);
        }

        private IEnumerable<CollectionResource> MapToResource(List<MovieCollection> collections)
        {
            // Avoid calling for naming spec on every movie in filenamebuilder
            var namingConfig = _namingService.GetConfig();

            var existingMoviesTmdbIds = _movieService.AllMovieWithCollectionsTmdbIds();
            var listExclusions = _importListExclusionService.GetAllByType(ImportExclusionType.Movie);

            var allCollectionMovies = _movieMetadataService.GetMoviesWithCollections()
                .GroupBy(x => x.CollectionTmdbId)
                .ToDictionary(x => x.Key, x => (IEnumerable<MovieMetadata>)x);

            foreach (var collection in collections)
            {
                var resource = collection.ToResource();

                allCollectionMovies.TryGetValue(collection.TmdbId, out var collectionMovies);

                if (collectionMovies != null)
                {
                    foreach (var movie in collectionMovies)
                    {
                        var movieResource = movie.ToResource();
                        movieResource.Folder = _fileNameBuilder.GetMovieFolder(new Movie { MovieMetadata = movie }, namingConfig);

                        var isExisting = existingMoviesTmdbIds.Contains(movie.TmdbId);
                        movieResource.IsExisting = isExisting;

                        var isExcluded = listExclusions.Any(e => e.ForeignId == movie.TmdbId.ToString());
                        movieResource.IsExcluded = isExcluded;

                        if (!isExisting && !isExcluded)
                        {
                            resource.MissingMovies++;
                        }

                        resource.Movies.Add(movieResource);
                    }
                }

                yield return resource;
            }
        }

        private CollectionResource MapToResource(MovieCollection collection)
        {
            var resource = collection.ToResource();

            var namingConfig = _namingService.GetConfig();

            var existingMoviesTmdbIds = _movieService.AllMovieWithCollectionsTmdbIds();
            var listExclusions = _importListExclusionService.GetAllByType(ImportExclusionType.Movie);

            foreach (var movie in _movieMetadataService.GetMoviesByCollectionTmdbId(collection.TmdbId))
            {
                var movieResource = movie.ToResource();
                movieResource.Folder = _fileNameBuilder.GetMovieFolder(new Movie { MovieMetadata = movie }, namingConfig);

                var isExisting = existingMoviesTmdbIds.Contains(movie.TmdbId);
                movieResource.IsExisting = isExisting;

                var isExcluded = listExclusions.Any(e => e.ForeignId == movie.TmdbId.ToString());
                movieResource.IsExcluded = isExcluded;

                if (!isExisting && !isExcluded)
                {
                    resource.MissingMovies++;
                }

                resource.Movies.Add(movieResource);
            }

            return resource;
        }

        /// <summary>
        /// Handles a collection added event and broadcasts the created resource.
        /// </summary>
        /// <param name="message">Event message containing the added collection.</param>
        [NonAction]
        public void Handle(CollectionAddedEvent message)
        {
            BroadcastResourceChange(ModelAction.Created, MapToResource(message.Collection));
        }

        /// <summary>
        /// Handles a collection edited event and broadcasts the updated resource.
        /// </summary>
        /// <param name="message">Event message containing the edited collection.</param>
        [NonAction]
        public void Handle(CollectionEditedEvent message)
        {
            BroadcastResourceChange(ModelAction.Updated, MapToResource(message.Collection));
        }

        /// <summary>
        /// Handles a collection deleted event and broadcasts the deleted collection id.
        /// </summary>
        /// <param name="message">Event message containing the deleted collection.</param>
        [NonAction]
        public void Handle(CollectionDeletedEvent message)
        {
            BroadcastResourceChange(ModelAction.Deleted, message.Collection.Id);
        }
    }
}
