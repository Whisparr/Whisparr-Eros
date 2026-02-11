using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using Whisparr.Http.ClientSchema;

namespace Whisparr.Http.REST
{
    public class ResourceValidator<TResource> : AbstractValidator<TResource>
    {
        public IRuleBuilderInitial<TResource, TProperty> RuleForField<TProperty>(Expression<Func<TResource, IEnumerable<Field>>> fieldListAccessor, string fieldName)
        {
            var accessor = fieldListAccessor.Compile();

            return RuleFor(resource => GetValue<TProperty>(resource, accessor, fieldName));
        }

        private static TProperty GetValue<TProperty>(TResource resource, Func<TResource, IEnumerable<Field>> fieldListAccessor, string fieldName)
        {
            var field = fieldListAccessor(resource).SingleOrDefault(c => c.Name == fieldName);

            if (field?.Value == null)
            {
                return default;
            }

            return (TProperty)field.Value;
        }
    }
}
