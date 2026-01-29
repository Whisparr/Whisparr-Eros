import { UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import fetchJson, {
  ApiError,
  FetchJsonOptions,
} from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import getQueryString, { QueryParams } from 'Utilities/Fetch/getQueryString';

export interface QueryOptions<T> extends FetchJsonOptions<unknown> {
  queryParams?: QueryParams;
  queryOptions?:
    | Omit<UndefinedInitialDataOptions<T, ApiError>, 'queryKey' | 'queryFn'>
    | undefined;
}

const useApiQuery = <T>(options: QueryOptions<T>) => {
  const { queryKey, requestOptions } = useMemo(() => {
    const { path: path, queryOptions, queryParams, ...otherOptions } = options;

    const key = queryParams ? [path, queryParams] : [path];
    const reqOpts = {
      ...otherOptions,
      path: getQueryPath(path) + getQueryString(queryParams),
      headers: {
        ...options.headers,
        'X-Api-Key': window.Whisparr.apiKey,
        'X-Whisparr-Client': 'Whisparr',
      },
    };
    return {
      queryKey: key,
      requestOptions: reqOpts,
    };
  }, [options]);

  return {
    queryKey,
    ...useQuery({
      ...options.queryOptions,
      queryKey,
      queryFn: async ({ signal }) =>
        fetchJson<T, unknown>({ ...requestOptions, signal }),
    }),
  };
};

export default useApiQuery;
