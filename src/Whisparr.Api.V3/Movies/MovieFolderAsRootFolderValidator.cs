using System;
using System.IO;
using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Organizer;

namespace Whisparr.Api.V3.Movies
{
    public class MovieFolderAsRootFolderValidator : PropertyValidator<MovieResource, string>
    {
        private readonly IBuildFileNames _fileNameBuilder;

        public MovieFolderAsRootFolderValidator(IBuildFileNames fileNameBuilder)
        {
            _fileNameBuilder = fileNameBuilder;
        }

        public override string Name => "MovieFolderAsRootFolderValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Root folder path '{rootFolderPath}' contains movie folder '{movieFolder}'";

        public override bool IsValid(ValidationContext<MovieResource> context, string value)
        {
            if (value == null)
            {
                return true;
            }

            if (context.InstanceToValidate is not MovieResource movieResource)
            {
                return true;
            }

            var rootFolderPath = value;

            if (rootFolderPath.IsNullOrWhiteSpace())
            {
                return true;
            }

            var rootFolder = new DirectoryInfo(rootFolderPath!).Name;
            var movie = movieResource.ToModel();
            var movieFolder = _fileNameBuilder.GetMovieFolder(movie);

            context.MessageFormatter.AppendArgument("rootFolderPath", rootFolderPath);
            context.MessageFormatter.AppendArgument("movieFolder", movieFolder);

            if (movieFolder == rootFolder)
            {
                return false;
            }

            var distance = movieFolder.LevenshteinDistance(rootFolder);

            return distance >= Math.Max(1, movieFolder.Length * 0.2);
        }
    }
}
