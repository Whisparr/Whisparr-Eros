import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { ValidationFailures } from 'Store/Selectors/selectSettings';
import {
  ValidationError,
  ValidationFailure,
  ValidationWarning,
} from 'typings/pending';
import fetchJson, {
  ApiError,
  FetchJsonOptions,
} from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import getQueryString, { QueryParams } from 'Utilities/Fetch/getQueryString';

interface MutationOptions<T, TData> extends Omit<
  FetchJsonOptions<TData>,
  'method' | 'path'
> {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string | ((data: TData) => string);
  mutationOptions?: Omit<UseMutationOptions<T, ApiError, TData>, 'mutationFn'>;
  queryParams?: QueryParams;
}

function useApiMutation<T, TData>(options: MutationOptions<T, TData>) {
  return useMutation<T, ApiError, TData>({
    ...options.mutationOptions,
    mutationFn: async (data: TData) => {
      const { path, queryParams, mutationOptions, ...otherOptions } = options;
      const resolvedPath = typeof path === 'function' ? path(data) : path;

      return fetchJson<T, TData>({
        ...otherOptions,
        path: getQueryPath(resolvedPath) + getQueryString(queryParams),
        headers: {
          ...options.headers,
          'X-Api-Key': window.Whisparr.apiKey,
          'X-Whisparr-Client': 'Whisparr',
        },
        body: data,
      });
    },
  });
}

export default useApiMutation;

export function getValidationFailures(
  error?: ApiError | null
): ValidationFailures {
  if (!error || error.statusCode !== 400) {
    return {
      errors: [],
      warnings: [],
    };
  }

  return ((error.statusBody ?? []) as ValidationFailure[]).reduce(
    (acc: ValidationFailures, failure: ValidationFailure) => {
      if (failure.isWarning) {
        acc.warnings.push(failure as ValidationWarning);
      } else {
        acc.errors.push(failure as ValidationError);
      }

      return acc;
    },
    {
      errors: [],
      warnings: [],
    }
  );
}
