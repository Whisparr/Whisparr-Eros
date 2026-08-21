import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import { kinds } from 'Helpers/Props';
import useOAuth from 'OAuth/useOAuth';
import { set } from 'Store/Actions/baseActions';
import { InputOnChange } from 'typings/inputs';

export interface OAuthInputProps {
  label?: string;
  name: string;
  provider: string;
  providerData: Record<string, unknown>;
  section: string;
  onChange: InputOnChange<unknown>;
}

function OAuthInput({
  label = 'Start OAuth',
  name,
  provider,
  providerData,
  section,
  onChange,
}: OAuthInputProps) {
  const dispatch = useDispatch();
  const { authorizing, error, result, startOAuth, resetOAuth } = useOAuth();

  const handlePress = useCallback(() => {
    startOAuth({ name, provider, providerData })
      .then(() => {
        // Clear any previously set save error.
        dispatch(set({ section, saveError: null }));
      })
      .catch((error) => {
        // The provider form reads validation errors off the section's save
        // error, so it still has to go through Redux until settings moves.
        if (error?.status === 400) {
          dispatch(set({ section, saveError: error }));
        }
      });
  }, [name, provider, providerData, section, startOAuth, dispatch]);

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
