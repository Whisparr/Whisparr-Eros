import fetchJson from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';

// This file contains some helpers for power users in a browser console

let hasWarned = false;

function checkActivationWarning() {
  if (!hasWarned) {
    console.log('Activated WhisparrApi console helpers.');
    console.warn('Be warned: There will be no further confirmation checks.');
    hasWarned = true;
  }
}

interface Resource {
  id: number;
}

// A promise with the array helpers bolted on, so a console session can write
// `WhisparrApi.movie.all().filter(...).forEach(...)` without awaiting between
// the steps. Every helper returns another one of these. The element type is
// `unknown` and the callbacks are declared as methods, which are bivariant --
// a console user writes `(movie: Movie) => ...` and it is accepted.
interface ChainablePromise<T> extends Promise<T> {
  filter(predicate: (item: unknown) => boolean): ChainablePromise<T>;
  map(mapper: (item: unknown) => unknown): ChainablePromise<unknown[]>;
  all(): ChainablePromise<T>;
  forEach(action: (item: unknown) => unknown): ChainablePromise<unknown[]>;
}

// Inside, the resolved value is only known to be an array.
function attachAsyncActions<T>(promise: Promise<T>): ChainablePromise<T> {
  const chainable = promise as ChainablePromise<T>;
  const asArray = () => chainable.then((data) => data as unknown[]);

  chainable.filter = (predicate) =>
    attachAsyncActions(asArray().then((data) => data.filter(predicate) as T));

  chainable.map = (mapper) =>
    attachAsyncActions(asArray().then((data) => data.map(mapper)));

  chainable.all = () =>
    attachAsyncActions(
      asArray().then((data) => Promise.all(data) as Promise<T>)
    );

  chainable.forEach = (action) =>
    attachAsyncActions(asArray().then((data) => Promise.all(data.map(action))));

  return chainable;
}

interface FetchOptions {
  method?: string;
  data?: unknown;
}

class ResourceApi {
  private api: ConsoleApi;
  private url: string;

  constructor(api: ConsoleApi, url: string) {
    this.api = api;
    this.url = url;
  }

  single<T>(id: number) {
    return this.api.fetch<T>(`${this.url}/${id}`);
  }

  all<T>() {
    return this.api.fetch<T[]>(this.url);
  }

  filter<T>(predicate: (item: unknown) => boolean) {
    return this.all<T>().filter(predicate);
  }

  update<T extends Resource>(resource: T) {
    return this.api.fetch<T>(`${this.url}/${resource.id}`, {
      method: 'PUT',
      data: resource,
    });
  }

  delete(resource: number | Resource) {
    const id = typeof resource === 'object' ? resource?.id : resource;

    if (!id || !Number.isInteger(id)) {
      throw new Error(`Invalid resource: ${JSON.stringify(resource)}`);
    }

    return this.api.fetch<void>(`${this.url}/${id}`, { method: 'DELETE' });
  }

  fetch<T>(url: string, options?: FetchOptions) {
    return this.api.fetch<T>(`${this.url}${url}`, options);
  }
}

class ConsoleApi {
  movie: ResourceApi;

  constructor() {
    this.movie = new ResourceApi(this, '/movie');
  }

  resource(url: string) {
    return new ResourceApi(this, url);
  }

  fetch<T>(url: string, options: FetchOptions = {}): ChainablePromise<T> {
    checkActivationWarning();

    const promise = fetchJson<T, unknown>({
      path: getQueryPath(url),
      method: options.method ?? 'GET',
      headers: {
        'X-Api-Key': window.Whisparr.apiKey,
      },
      body: options.data,
    }).catch((error) => {
      console.error(`Failed to fetch ${url}`, error);

      throw error;
    });

    return attachAsyncActions(promise);
  }
}

declare global {
  interface Window {
    WhisparrApi: ConsoleApi;
  }
}

window.WhisparrApi = new ConsoleApi();

export default ConsoleApi;
