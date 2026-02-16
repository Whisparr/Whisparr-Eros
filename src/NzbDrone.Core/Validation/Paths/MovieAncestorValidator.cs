using System.Linq;
using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Movies;

namespace NzbDrone.Core.Validation.Paths
{
    public class MovieAncestorValidator<T> : PropertyValidator<T, string>
    {
        private readonly IMovieService _movieService;

        public MovieAncestorValidator(IMovieService movieService)
        {
            _movieService = movieService;
        }

        public override string Name => "MovieAncestorValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Path '{path}' is an ancestor of an existing movie";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            if (value == null)
            {
                return true;
            }

            context.MessageFormatter.AppendArgument("path", value);

            return !_movieService.AllMoviePaths().Any(s => value.IsParentPath(s.Value));
        }
    }
}
