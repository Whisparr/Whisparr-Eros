import { useCallback, useState } from 'react';
import type AppError from 'typings/AppError';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import requestAction from 'Utilities/requestAction';
import translate from 'Utilities/String/translate';

const callbackUrl = `${window.location.origin}${window.Whisparr.urlBase}/oauth.html`;

interface OAuthResult {
  [key: string]: string | number | boolean;
}

interface OAuthState {
  authorizing: boolean;
  result: OAuthResult | null;
  error: AppError | null;
}

export interface StartOAuthParams {
  name: string;
  provider?: string;
  providerData?: Record<string, unknown>;
  [key: string]: unknown;
}

interface OAuthResponse {
  oauthUrl?: string;
  [key: string]: unknown;
}

interface QueryParams {
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
): Promise<QueryParams> {
  return new Promise((resolve, reject) => {
    const selfWindow = window as WindowWithOAuth;
    const newWindow = window.open(url);

    if (
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === 'undefined'
    ) {
      // A fake validation error to mimic a 400 response from the API.
      const error: AppError = {
        status: 400,
        responseJSON: [
          {
            isWarning: false,
            severity: 'error',
            propertyName: payload.name,
            errorMessage: translate('OAuthPopupMessage'),
          },
        ],
      };

      return reject(error);
    }

    selfWindow.onCompleteOauth = function (
      query: string,
      onComplete: () => void
    ) {
      delete selfWindow.onCompleteOauth;

      const queryParams: QueryParams = {};
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

function executeIntermediateRequest(
  payload: Record<string, unknown>,
  ajaxOptions: Record<string, unknown>
): Promise<OAuthResponse> {
  return createAjaxRequest(ajaxOptions).request.then(
    (data: Record<string, unknown>) => {
      return requestAction({
        action: 'continueOAuth',
        queryParams: {
          ...data,
          callbackUrl,
        },
        ...payload,
      });
    }
  );
}

function useOAuth() {
  const [oAuthState, setOAuthState] = useState<OAuthState>(defaultState);

  const resetOAuth = useCallback(() => {
    setOAuthState(defaultState);
  }, []);

  const startOAuth = useCallback(async (params: StartOAuthParams) => {
    const { name, ...otherPayload } = params;

    const actionPayload = {
      action: 'startOAuth',
      queryParams: { callbackUrl },
      ...otherPayload,
    };

    setOAuthState((prevState) => ({ ...prevState, authorizing: true }));

    try {
      const response = (await requestAction(actionPayload)) as OAuthResponse;

      let startResponse = response;
      let queryParams: QueryParams = {};

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

      const result = (await requestAction({
        action: 'getOAuthToken',
        queryParams: {
          ...startResponse,
          ...queryParams,
        },
        ...otherPayload,
      })) as OAuthResult;

      setOAuthState({ authorizing: false, result, error: null });

      return result;
    } catch (error) {
      setOAuthState({
        authorizing: false,
        result: null,
        error: error as AppError,
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
