import Field from 'typings/Field';
import fetchJson from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import getQueryString, { QueryParams } from 'Utilities/Fetch/getQueryString';

// A provider form's pending values, as `useProviderSettings` holds them: every
// setting wrapped in a `{ value }`, except `fields`, which is already a list of
// resources the server understands.
export interface ProviderData {
  fields?: Field[];
  [key: string]: unknown;
}

export interface RequestActionPayload {
  provider: string;
  action: string;
  providerData: ProviderData;
  queryParams?: QueryParams;
}

function flattenProviderData(providerData: ProviderData) {
  return Object.keys(providerData).reduce<Record<string, unknown>>(
    (result, key) => {
      const property = providerData[key];

      if (key === 'fields') {
        result[key] = property;
      } else {
        result[key] = (property as { value?: unknown })?.value;
      }

      return result;
    },
    {}
  );
}

function requestAction<T>({
  provider,
  action,
  providerData,
  queryParams,
}: RequestActionPayload): Promise<T> {
  return fetchJson<T, Record<string, unknown>>({
    path: `${getQueryPath(
      `/${provider}/action/${action}`
    )}${getQueryString(queryParams)}`,
    method: 'POST',
    headers: {
      'X-Api-Key': window.Whisparr.apiKey,
    },
    body: flattenProviderData(providerData),
  });
}

export default requestAction;
