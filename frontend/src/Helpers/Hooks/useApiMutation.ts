import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { ValidationFailures } from 'Helpers/selectSettings';
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

interface MutationOptions<T, TData, TBody = TData> extends Omit<
  FetchJsonOptions<TBody>,
  'method' | 'path' | 'body'
> {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string | ((data: TData) => string);
  // Derives the request body from the mutate() argument. For read-modify-
  // writes where the caller only holds a partial payload (a monitored flag,
  // say) and the full entity is loaded from cache before a whole-record PUT.
  body?: (data: TData) => TBody | Promise<TBody>;
  mutationOptions?: Omit<UseMutationOptions<T, ApiError, TData>, 'mutationFn'>;
  // A function form is for query params the caller can only decide per-call,
  // such as the provider `forceSave` flag, which depends on whether this is a
  // repeat of the previous attempt.
  queryParams?: QueryParams | ((data: TData) => QueryParams);
}

function useApiMutation<T, TData, TBody = TData>(
  options: MutationOptions<T, TData, TBody>
) {
  return useMutation<T, ApiError, TData>({
    ...options.mutationOptions,
    mutationFn: async (data: TData) => {
      const { path, queryParams, body, mutationOptions, ...otherOptions } =
        options;
      const resolvedPath = typeof path === 'function' ? path(data) : path;

      const resolvedQueryParams =
        typeof queryParams === 'function' ? queryParams(data) : queryParams;

      // Without a body function the mutate() argument is the request body --
      // `TBody` defaults to `TData`, so widening through `unknown` is safe.
      const resolvedBody: TBody = body
        ? await body(data)
        : (data as unknown as TBody);

      return fetchJson<T, TBody>({
        ...otherOptions,
        path: getQueryPath(resolvedPath) + getQueryString(resolvedQueryParams),
        headers: {
          ...options.headers,
          'X-Api-Key': window.Whisparr.apiKey,
          'X-Whisparr-Client': 'Whisparr',
        },
        body: resolvedBody,
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
