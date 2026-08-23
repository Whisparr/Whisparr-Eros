import { PropertyFilter } from 'Filters/Filter';

export interface QueryParams {
  [key: string]:
    | string
    | number
    | boolean
    | PropertyFilter[]
    | number[]
    | string[]
    | undefined;
}

const getQueryString = (queryParams?: QueryParams) => {
  if (!queryParams) {
    return '';
  }

  const searchParams = Object.keys(queryParams).reduce<URLSearchParams>(
    (acc, key) => {
      const value = queryParams[key];

      if (value == null) {
        return acc;
      }

      if (Array.isArray(value)) {
        if (typeof value[0] === 'object') {
          (value as PropertyFilter[]).forEach((filter) => {
            acc.append(filter.key, String(filter.value));
          });
        } else {
          value.forEach((item) => {
            acc.append(key, String(item));
          });
        }
      } else {
        acc.append(key, String(value));
      }

      return acc;
    },
    new URLSearchParams()
  );

  const paramsString = searchParams.toString();

  // A caller that decides its params per-call can legitimately end up with
  // none of them set, and a bare `?` on the path is noise in the request log.
  if (!paramsString) {
    return '';
  }

  return `?${paramsString}`;
};

export default getQueryString;
