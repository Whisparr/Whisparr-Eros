import anySignal from './anySignal';

export interface ApiErrorResponse {
  message: string;
  details: string;
}
export class ApiError extends Error {
  public statusCode: number;
  public statusText: string;
  public statusBody?: ApiErrorResponse;

  public constructor(
    path: string,
    statusCode: number,
    statusText: string,
    statusBody?: ApiErrorResponse
  ) {
    super(`Request Error: (${statusCode}) ${path}`);

    this.statusCode = statusCode;
    this.statusText = statusText;
    this.statusBody = statusBody;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface FetchJsonOptions<TData> extends Omit<RequestInit, 'body'> {
  path: string;
  headers?: HeadersInit;
  body?: TData;
  timeout?: number;
}

// `path` is used verbatim — callers must pass an already-rooted path built with
// `Utilities/Fetch/getQueryPath`.
async function fetchJson<T, TData>({
  body,
  path,
  signal,
  timeout,
  ...options
}: FetchJsonOptions<TData>): Promise<T> {
  const abortController = new AbortController();

  let timeoutID: ReturnType<typeof setTimeout> | null = null;

  if (timeout) {
    timeoutID = setTimeout(() => {
      abortController.abort();
    }, timeout);
  }

  // Binary bodies (FormData, Blob) pass through untouched so a multipart upload
  // keeps the boundary only the browser can set. Everything else is JSON-encoded
  // and gets a matching content type below.
  const isBinaryBody = body instanceof FormData || body instanceof Blob;

  let requestBody: BodyInit | undefined = undefined;
  if (body) {
    requestBody = isBinaryBody
      ? (body as unknown as BodyInit)
      : JSON.stringify(body);
  }

  const response = await fetch(path, {
    ...options,
    body: requestBody,
    headers: {
      ...options.headers,
      Accept: 'application/json',
      // Only when there is something to describe. `Content-Type:
      // application/json` is not a CORS-safelisted request header, so setting
      // it unconditionally makes every cross-origin GET preflight -- which the
      // OAuth intermediate request to plex.tv is. Same-origin calls never
      // noticed, and a body-less request has no content type to declare. A
      // binary body carries its own (browser-set) multipart content type.
      ...(body && !isBinaryBody ? { 'Content-Type': 'application/json' } : {}),
    },
    signal: anySignal(abortController.signal, signal),
  });

  if (timeoutID) {
    clearTimeout(timeoutID);
  }

  if (!response.ok) {
    // eslint-disable-next-line init-declarations
    let body;

    try {
      body = (await response.json()) as ApiErrorResponse;
    } catch {
      throw new ApiError(path, response.status, response.statusText);
    }

    throw new ApiError(path, response.status, response.statusText, body);
  }

  // Not every success carries a body. `[RestDeleteById]` actions that return
  // `void` answer 200 with an empty body, and `response.json()` rejects on
  // that -- which lands the mutation in `onError` and skips its cache
  // invalidation, so the deleted row stays on screen.
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export default fetchJson;
