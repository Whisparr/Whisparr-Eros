using System.Collections.Generic;
using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.MediaFiles.Commands
{
    public class DeleteMovieFilesCommand : Command
    {
        public DeleteMovieFilesCommand()
        {
            MovieIds = new List<int>();
        }

        public List<int> MovieIds { get; set; }

        public override bool SendUpdatesToClient => true;
        public override bool RequiresDiskAccess => true;
    }
}
