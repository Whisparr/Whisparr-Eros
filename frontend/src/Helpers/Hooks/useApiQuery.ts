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
    | Omit<
        UndefinedInitialDataOptions<Readonly<T>, ApiError>,
        'queryKey' | 'queryFn'
      >
    | undefined;
}

const useApiQuery = <T>(options: QueryOptions<T>) => {
  const { queryKey, requestOptions } = useMemo(() => {
    const { path, queryOptions, queryParams, body, ...otherOptions } = options;

    // Include body in cache key if present (for POSTs)
    const cacheKey = [path];

    // Include query params for GET requests in cache key
    if (queryParams) cacheKey.push(JSON.stringify(queryParams));

    // Include body in cache key if present (for POSTs)
    if (body) cacheKey.push(JSON.stringify(body));

    return {
      queryKey: cacheKey,
      requestOptions: {
        ...otherOptions,
        path: getQueryPath(path) + getQueryString(queryParams),
        body, // pass body through for POST
        headers: {
          ...options.headers,
          'X-Api-Key': window.Whisparr.apiKey,
          'X-Whisparr-Client': 'Whisparr',
        },
      },
    };
  }, [options]);

  return {
    queryKey,
    ...useQuery({
      placeholderData: (prev) => prev,
      ...options.queryOptions,
      queryKey,
      queryFn: async ({ signal }) =>
        fetchJson<Readonly<T>, unknown>({ ...requestOptions, signal }),
    }),
  };
};

export default useApiQuery;
