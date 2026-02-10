using FluentValidation;
using FluentValidation.Results;
using NzbDrone.Core.Validation.Paths;

namespace NzbDrone.Core.Movies
{
    public interface IAddMovieValidator
    {
        ValidationResult Validate(Movie instance);
    }

    public class AddMovieValidator : AbstractValidator<Movie>, IAddMovieValidator
    {
        public AddMovieValidator(RootFolderValidator<Movie> rootFolderValidator,
                                 RecycleBinValidator<Movie> recycleBinValidator,
                                 MoviePathValidator<Movie> moviePathValidator,
                                 MovieAncestorValidator<Movie> movieAncestorValidator)
        {
            RuleFor(c => c.Path).Cascade(CascadeMode.Stop)
                                .IsValidPath()
                                .SetValidator(rootFolderValidator)
                                .SetValidator(recycleBinValidator)
                                .SetValidator(moviePathValidator)
                                .SetValidator(movieAncestorValidator);
        }
    }
}
