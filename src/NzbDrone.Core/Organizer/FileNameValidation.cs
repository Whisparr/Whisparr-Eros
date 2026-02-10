using System.IO;
using System.Linq;
using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.Organizer
{
    public static class FileNameValidation
    {
        public static IRuleBuilderOptions<T, string> ValidMovieFolderFormat<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            ruleBuilder.NotEmpty();
            ruleBuilder.SetValidator(new IllegalCharactersValidator<T>());

            return ruleBuilder.Matches(FileNameBuilder.MovieTitleRegex).WithMessage("Must contain movie title");
        }

        public static IRuleBuilderOptions<T, string> ValidMainMovieFolderFormat<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            ruleBuilder.NotEmpty();
            ruleBuilder.SetValidator(new IllegalCharactersValidator<T>());

            return ruleBuilder.Matches(FileNameBuilder.MainFolderRegex)
                              .WithMessage("Must start with a relative path inside root folder, ex. 'movies/'");
        }

        public static IRuleBuilderOptions<T, string> ValidMovieFormat<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            ruleBuilder.NotEmpty();
            ruleBuilder.SetValidator(new IllegalCharactersValidator<T>());

            return ruleBuilder.Matches(FileNameBuilder.MovieTitleRegex).WithMessage("Must contain movie title");
        }

        public static IRuleBuilderOptions<T, string> ValidSceneFolderFormat<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            ruleBuilder.NotEmpty();
            ruleBuilder.SetValidator(new IllegalCharactersValidator<T>());

            return ruleBuilder.Matches(FileNameBuilder.SceneFolderRegex)
                              .WithMessage("Must contain scene studio token, ex. {Studio CleanTitle}");
        }

        public static IRuleBuilderOptions<T, string> ValidMainSceneFolderFormat<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            ruleBuilder.NotEmpty();
            ruleBuilder.SetValidator(new IllegalCharactersValidator<T>());
            ruleBuilder.Matches(FileNameBuilder.MainFolderRegex)
                       .WithMessage("Must start with a relative path inside root folder, ex. 'scenes/'");
            return ruleBuilder.Must(value =>
                value is string s && FileNameBuilder.SceneTitleTokenRegex.IsMatch(s))
                    .WithMessage("Must contain a Scene Title naming token, ex. {Scene CleanTitle}");
        }

        public static IRuleBuilderOptions<T, string> ValidSceneImportFolderFormat<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            ruleBuilder.NotEmpty();
            ruleBuilder.SetValidator(new IllegalCharactersValidator<T>());

            return ruleBuilder.NotEmpty().WithMessage("Must not be empty");
        }

        public static IRuleBuilderOptions<T, string> ValidSceneFormat<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            ruleBuilder.NotEmpty();
            ruleBuilder.SetValidator(new IllegalCharactersValidator<T>());

            return ruleBuilder.Matches(FileNameBuilder.SceneTitleRegex)
                              .WithMessage("Must contain scene title, ex {Scene CleanTitle}");
        }
    }

    public class ValidMovieFolderFormatValidator<T> : PropertyValidator<T, string>
    {
        public override string Name => "ValidMovieFolderFormatValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Must contain movie title";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            if (value == null)
            {
                return false;
            }

            return FileNameBuilder.MovieTitleRegex.IsMatch(value);
        }
    }

    public class IllegalCharactersValidator<T> : PropertyValidator<T, string>
    {
        private static readonly char[] InvalidPathChars = Path.GetInvalidPathChars();

        public override string Name => "IllegalCharactersValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Contains illegal characters: {InvalidCharacters}";

        public override bool IsValid(ValidationContext<T> context, string value)
        {
            if (value.IsNullOrWhiteSpace())
            {
                return true;
            }

            var invalidCharacters = InvalidPathChars.Where(i => value!.IndexOf(i) >= 0).ToList();
            if (invalidCharacters.Any())
            {
                context.MessageFormatter.AppendArgument("InvalidCharacters", string.Join("", invalidCharacters));
                return false;
            }

            return true;
        }
    }
}
