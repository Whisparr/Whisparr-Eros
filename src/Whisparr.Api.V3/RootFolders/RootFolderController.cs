using System.Collections.Generic;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.RootFolders;
using NzbDrone.Core.Validation.Paths;
using NzbDrone.SignalR;
using Whisparr.Http;
using Whisparr.Http.REST;
using Whisparr.Http.REST.Attributes;

namespace Whisparr.Api.V3.RootFolders
{
    /// <summary>
    /// Controller for managing root folders used by the application.
    /// Exposes endpoints to create, list, refresh and delete root folders.
    /// </summary>
    [V3ApiController]
    public class RootFolderController : RestControllerWithSignalR<RootFolderResource, RootFolder>
    {
        private readonly IRootFolderService _rootFolderService;

        /// <summary>
        /// Initializes a new instance of <see cref="RootFolderController"/>.
        /// Configures shared validators for root folder creation and updates.
        /// </summary>
        /// <param name="rootFolderService">Service used to manage root folders.</param>
        /// <param name="signalRBroadcaster">SignalR broadcaster used to publish changes.</param>
        /// <param name="rootFolderValidator">Validator for root folder rules.</param>
        /// <param name="pathExistsValidator">Validator that ensures the path exists.</param>
        /// <param name="mappedNetworkDriveValidator">Validator that checks mapped network drive rules.</param>
        /// <param name="recycleBinValidator">Validator that checks recycle bin restrictions.</param>
        /// <param name="startupFolderValidator">Validator that checks startup folder restrictions.</param>
        /// <param name="systemFolderValidator">Validator that checks system folder restrictions.</param>
        /// <param name="folderWritableValidator">Validator that ensures folder is writable.</param>
        public RootFolderController(IRootFolderService rootFolderService,
                                IBroadcastSignalRMessage signalRBroadcaster,
                                RootFolderValidator<RootFolderResource> rootFolderValidator,
                                PathExistsValidator<RootFolderResource> pathExistsValidator,
                                MappedNetworkDriveValidator<RootFolderResource> mappedNetworkDriveValidator,
                                RecycleBinValidator<RootFolderResource> recycleBinValidator,
                                StartupFolderValidator<RootFolderResource> startupFolderValidator,
                                SystemFolderValidator<RootFolderResource> systemFolderValidator,
                                FolderWritableValidator<RootFolderResource> folderWritableValidator)
        : base(signalRBroadcaster)
        {
            _rootFolderService = rootFolderService;

            SharedValidator.RuleFor(c => c.Path)
                .Cascade(CascadeMode.Stop)
                .IsValidPath()
                           .SetValidator(rootFolderValidator)
                           .SetValidator(mappedNetworkDriveValidator)
                           .SetValidator(startupFolderValidator)
                           .SetValidator(recycleBinValidator)
                           .SetValidator(pathExistsValidator)
                           .SetValidator(systemFolderValidator)
                           .SetValidator(folderWritableValidator);
        }

        /// <summary>
        /// Retrieves a single <see cref="RootFolderResource"/> by identifier.
        /// </summary>
        /// <param name="id">The id of the root folder to retrieve.</param>
        /// <returns>The <see cref="RootFolderResource"/> matching the provided id.</returns>
        protected override RootFolderResource GetResourceById(int id)
        {
            return _rootFolderService.Get(id).ToResource();
        }

        /// <summary>
        /// Creates a new root folder.
        /// </summary>
        /// <param name="rootFolderResource">The root folder resource payload.</param>
        /// <returns>An ActionResult with Created (201) and the created id on success.</returns>
        [RestPostById]
        [Consumes("application/json")]
        public ActionResult<RootFolderResource> CreateRootFolder([FromBody] RootFolderResource rootFolderResource)
        {
            var model = rootFolderResource.ToModel();

            return Created(_rootFolderService.Add(model).Id);
        }

        /// <summary>
        /// Returns all configured root folders, including import file metadata.
        /// </summary>
        /// <returns>List of <see cref="RootFolderResource"/>.</returns>
        [HttpGet]
        public List<RootFolderResource> GetRootFolders()
        {
            return _rootFolderService.AllWithImportFiles().ToResource();
        }

        /// <summary>
        /// Refreshes the specified root folder (e.g. re-scan for media).
        /// </summary>
        /// <param name="id">Id of the root folder to refresh.</param>
        /// <returns>The refreshed <see cref="RootFolderResource"/>.</returns>
        [HttpPost("refresh/{id}")]
        public RootFolderResource Refresh([FromRoute] int id)
        {
            return _rootFolderService.Refresh(id).ToResource();
        }

        /// <summary>
        /// Deletes the specified root folder.
        /// </summary>
        /// <param name="id">Id of the root folder to delete.</param>
        [RestDeleteById]
        public void DeleteFolder(int id)
        {
            _rootFolderService.Remove(id);
        }
    }
}
