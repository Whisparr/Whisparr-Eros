using System.Collections.Generic;
using FluentValidation;
using FluentValidation.Validators;
using NzbDrone.Common.Extensions;

namespace Whisparr.Http.Validation
{
    public class EmptyCollectionValidator<T, TProp> : PropertyValidator<T, IEnumerable<TProp>>
    {
        public override string Name => "EmptyCollectionValidator";

        protected override string GetDefaultMessageTemplate(string errorCode) => "Collection Must Be Empty";

        public override bool IsValid(ValidationContext<T> context, IEnumerable<TProp> value)
        {
            if (value == null)
            {
                return true;
            }

            return value.Empty();
        }
    }
}
