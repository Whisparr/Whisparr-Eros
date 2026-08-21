import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ModelBaseSetting } from 'Store/Selectors/selectSettings';
import Field, { FieldSelectOption } from 'typings/Field';
import fetchJson, { ApiError } from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';

export interface ProviderOptions extends ModelBaseSetting {
  fields?: Field[];
}

export interface ProviderOptionsDevice {
  id: string;
  name: string;
}

export interface ProviderOptionsParams {
  provider: string;
  action: string;
  providerData: ProviderOptions;
}

const importantFieldNames = ['baseUrl', 'apiPath', 'apiKey', 'authToken'];

// Keys the query on the fields the provider actually needs to answer, so
// typing in an unrelated field doesn't refetch the options.
function getProviderDataKey(providerData: ProviderOptions) {
  if (!providerData || !providerData.fields) {
    return null;
  }

  return providerData.fields
    .filter((f) => importantFieldNames.includes(f.name))
    .map((f) => f.value);
}

function flattenProviderData(providerData: ProviderOptions) {
  return Object.keys(providerData).reduce<Record<string, unknown>>(
    (acc, key) => {
      const property = providerData[key];

      if (key === 'fields') {
        acc[key] = property;
      } else {
        acc[key] = property.value;
      }

      return acc;
    },
    {}
  );
}

function useProviderOptions<T = FieldSelectOption<unknown>>({
  provider,
  action,
  providerData,
}: ProviderOptionsParams) {
  const flattenedData = useMemo(
    () => flattenProviderData(providerData),
    [providerData]
  );

  // Not `useApiQuery`: it keys a POST on the whole body, which would refetch
  // on every keystroke in the provider form.
  const result = useQuery<{ options?: T[] }, ApiError>({
    queryKey: [
      `/${provider}/action/${action}`,
      getProviderDataKey(providerData),
    ],
    enabled: !!(provider && action && providerData),
    queryFn: async ({ signal }) => {
      return fetchJson<{ options?: T[] }, typeof flattenedData>({
        path: getQueryPath(`/${provider}/action/${action}`),
        method: 'POST',
        body: flattenedData,
        headers: {
          'X-Api-Key': window.Whisparr.apiKey,
          'X-Whisparr-Client': 'Whisparr',
        },
        signal,
      });
    },
    placeholderData: keepPreviousData,
  });

  return {
    ...result,
    data: result.data?.options ?? [],
  };
}

export default useProviderOptions;
