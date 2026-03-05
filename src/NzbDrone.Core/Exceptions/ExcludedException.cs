using NzbDrone.Common.Exceptions;

namespace NzbDrone.Core.Exceptions
{
    public class ExcludedException : NzbDroneException
    {
        public ExcludedException(string message)
            : base(message)
        {
        }
    }
}
