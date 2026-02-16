using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Core.Movies;

namespace NzbDrone.Core.Validation.Paths
{
    public class MovieExistsValidator<T> : PropertyValidator<T, string>
    {
        private readonly IMovieService _movieService;

        public MovieExistsValidator(IMovieService movieService)
        {
            _movieService = movieService;
        }

        public override string Name => "MovieExistsValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "This item has already been added";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            if (value == null)
            {
                return true;
            }

            return _movieService.FindByForeignId(value) == null;
        }
    }
}
