import React, { useCallback, useEffect } from 'react';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import { kinds } from 'Helpers/Props';
import useOAuth from 'OAuth/useOAuth';
import { InputOnChange } from 'typings/inputs';
import { ApiError } from 'Utilities/Fetch/fetchJson';

export interface OAuthInputProps {
  label?: string;
  name: string;
  provider: string;
  providerData: Record<string, unknown>;
  onSaveError?: (error: ApiError | null) => void;
  onChange: InputOnChange<unknown>;
}

function OAuthInput({
  label = 'Start OAuth',
  name,
  provider,
  providerData,
  onSaveError,
  onChange,
}: Readonly<OAuthInputProps>) {
  const { authorizing, error, result, startOAuth, resetOAuth } = useOAuth();

  // The provider form reads validation errors off whatever holds its save
  // error, so a failed authorization has to be reported there rather than just
  // shown on the button.
  const reportSaveError = useCallback(
    (saveError: ApiError | null) => {
      onSaveError?.(saveError);
    },
    [onSaveError]
  );

  const handlePress = useCallback(() => {
    startOAuth({ name, provider, providerData })
      .then(() => {
        reportSaveError(null);
      })
      .catch((error) => {
        if (error?.statusCode === 400) {
          reportSaveError(error);
        }
      });
  }, [name, provider, providerData, startOAuth, reportSaveError]);

  useEffect(() => {
    if (!result) {
      return;
    }

    Object.keys(result).forEach((key) => {
      onChange({ name: key, value: result[key] });
    });
  }, [result, onChange]);

  useEffect(() => {
    return () => {
      resetOAuth();
    };
  }, [resetOAuth]);

  return (
    <div>
      <SpinnerErrorButton
        kind={kinds.PRIMARY}
        isSpinning={authorizing}
        error={error}
        onPress={handlePress}
      >
        {label}
      </SpinnerErrorButton>
    </div>
  );
}

export default OAuthInput;
