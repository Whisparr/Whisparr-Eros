import { useCallback, useState } from 'react';
import { ValidationFailure } from 'typings/pending';
import fetchJson, { ApiError } from 'Utilities/Fetch/fetchJson';
import { QueryParams } from 'Utilities/Fetch/getQueryString';
import requestAction, { ProviderData } from 'Utilities/requestAction';
import translate from 'Utilities/String/translate';

const callbackUrl = `${window.location.origin}${window.Whisparr.urlBase}/oauth.html`;

interface OAuthResult {
  [key: string]: string | number | boolean;
}

interface OAuthState {
  authorizing: boolean;
  result: OAuthResult | null;
  error: ApiError | null;
}

export interface StartOAuthParams {
  name: string;
  provider: string;
  providerData: ProviderData;
}

// What `startOAuth` answers with. Either an `oauthUrl` to send the user to, or
// the options for an intermediate request to the provider -- Plex returns its
// `plex.tv/api/v2/pins` url and the headers to call it with, and the pin it
// answers becomes the query for `continueOAuth`.
interface OAuthResponse {
  oauthUrl?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

interface QueryParamsResult {
  [key: string]: string;
}

interface WindowWithOAuth extends Window {
  onCompleteOauth?: (query: string, onComplete: () => void) => void;
}

const defaultState: OAuthState = {
  authorizing: false,
  result: null,
  error: null,
};

function showOAuthWindow(
  url: string,
  payload: StartOAuthParams
): Promise<QueryParamsResult> {
  return new Promise((resolve, reject) => {
    const selfWindow = window as WindowWithOAuth;
    const newWindow = window.open(url);

    if (
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === 'undefined'
    ) {
      // A fake validation error to mimic a 400 response from the API. The
      // failures ride in `statusBody`, which is where `getValidationFailures`
      // looks; the declared `ApiErrorResponse` shape is the other thing a 400
      // can carry, so this needs the same cast every other failure reader uses.
      const failures: ValidationFailure[] = [
        {
          isWarning: false,
          severity: 'error',
          propertyName: payload.name,
          errorMessage: translate('OAuthPopupMessage'),
        },
      ];

      return reject(
        new ApiError(
          url,
          400,
          'Bad Request',
          failures as unknown as ApiError['statusBody']
        )
      );
    }

    selfWindow.onCompleteOauth = function (
      query: string,
      onComplete: () => void
    ) {
      delete selfWindow.onCompleteOauth;

      const queryParams: QueryParamsResult = {};
      const splitQuery = query.substring(1).split('&');

      splitQuery.forEach((param) => {
        if (param) {
          const paramSplit = param.split('=');

          queryParams[paramSplit[0]] = paramSplit[1];
        }
      });

      onComplete();
      resolve(queryParams);
    };
  });
}

// The intermediate request goes to the provider, not to us, so it takes the
// url and headers verbatim -- no api root and no api key. `createAjaxRequest`
// made the same distinction with its `isRelative` check.
async function executeIntermediateRequest(
  payload: Pick<StartOAuthParams, 'provider' | 'providerData'>,
  { url, method, headers }: OAuthResponse
): Promise<OAuthResponse> {
  if (!url) {
    throw new Error('No intermediate request URL received from startOAuth');
  }

  const data = await fetchJson<Record<string, unknown>, never>({
    path: url,
    method,
    headers,
  });

  return requestAction<OAuthResponse>({
    ...payload,
    action: 'continueOAuth',
    queryParams: {
      ...(data as QueryParams),
      callbackUrl,
    },
  });
}

function useOAuth() {
  const [oAuthState, setOAuthState] = useState<OAuthState>(defaultState);

  const resetOAuth = useCallback(() => {
    setOAuthState(defaultState);
  }, []);

  const startOAuth = useCallback(async (params: StartOAuthParams) => {
    const { name, ...otherPayload } = params;

    setOAuthState((prevState) => ({ ...prevState, authorizing: true }));

    try {
      const response = await requestAction<OAuthResponse>({
        ...otherPayload,
        action: 'startOAuth',
        queryParams: { callbackUrl },
      });

      let startResponse = response;
      let queryParams: QueryParamsResult = {};

      if (response.oauthUrl) {
        queryParams = await showOAuthWindow(response.oauthUrl, params);
      } else {
        // The whole response doubles as the ajax options for the
        // intermediate request.
        startResponse = await executeIntermediateRequest(
          otherPayload,
          response
        );

        if (!startResponse.oauthUrl) {
          throw new Error('No OAuth URL received from intermediate request');
        }

        queryParams = await showOAuthWindow(startResponse.oauthUrl, params);
      }

      const result = await requestAction<OAuthResult>({
        ...otherPayload,
        action: 'getOAuthToken',
        queryParams: {
          ...(startResponse as QueryParams),
          ...queryParams,
        },
      });

      setOAuthState({ authorizing: false, result, error: null });

      return result;
    } catch (error) {
      setOAuthState({
        authorizing: false,
        result: null,
        error: error as ApiError,
      });

      throw error;
    }
  }, []);

  return {
    ...oAuthState,
    startOAuth,
    resetOAuth,
  };
}

export default useOAuth;
