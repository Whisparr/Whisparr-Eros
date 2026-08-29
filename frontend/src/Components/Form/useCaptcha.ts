import { useCallback, useState } from 'react';
import requestAction, { ProviderData } from 'Utilities/requestAction';

interface CaptchaState {
  refreshing: boolean;
  token: string | null;
  siteKey: string | null;
  secretToken: string | null;
  ray: string | null;
  stoken: string | null;
  responseUrl: string | null;
}

interface CaptchaRequest {
  siteKey?: string | null;
  secretToken?: string | null;
  ray?: string | null;
  stoken?: string | null;
  responseUrl?: string | null;
}

interface ProviderParams {
  provider: string;
  providerData: ProviderData;
}

const defaultState: CaptchaState = {
  refreshing: false,
  token: null,
  siteKey: null,
  secretToken: null,
  ray: null,
  stoken: null,
  responseUrl: null,
};

function useCaptcha() {
  const [state, setState] = useState<CaptchaState>(defaultState);

  const refresh = useCallback(({ provider, providerData }: ProviderParams) => {
    setState((prevState) => ({ ...prevState, refreshing: true }));

    requestAction<{ captchaRequest?: CaptchaRequest }>({
      action: 'checkCaptcha',
      provider,
      providerData,
    })
      .then((data) => {
        setState((prevState) => ({
          ...prevState,
          refreshing: false,
          ...data.captchaRequest,
        }));
      })
      .catch(() => {
        setState((prevState) => ({ ...prevState, refreshing: false }));
      });
  }, []);

  const getCaptchaCookie = useCallback(
    ({
      provider,
      providerData,
      captchaResponse,
    }: ProviderParams & { captchaResponse: string }) => {
      requestAction<{ captchaToken: string }>({
        action: 'getCaptchaCookie',
        provider,
        providerData,
        queryParams: {
          responseUrl: state.responseUrl,
          ray: state.ray,
          captchaResponse,
        },
      })
        .then((data) => {
          setState((prevState) => ({ ...prevState, token: data.captchaToken }));
        })
        // The original attached only a `done` handler, so a failed request
        // left the captcha untouched and said nothing. Kept, because a native
        // promise would otherwise log an unhandled rejection where jQuery's
        // deferred stayed quiet -- see the migration doc.
        .catch(() => {});
    },
    [state.responseUrl, state.ray]
  );

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    ...state,
    refresh,
    getCaptchaCookie,
    reset,
  };
}

export default useCaptcha;
