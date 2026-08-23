import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Error as AppError } from 'App/State/AppSectionState';
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
  // A section for the forms still on Redux; `onSaveError` for the ones that
  // have moved and keep their save error in the hook instead. Exactly one of
  // the two is set.
  section?: string;
  onSaveError?: (error: AppError | null) => void;
  onChange: InputOnChange<unknown>;
}

function OAuthInput({
  label = 'Start OAuth',
  name,
  provider,
  providerData,
  section,
  onSaveError,
  onChange,
}: OAuthInputProps) {
  const dispatch = useDispatch();
  const { authorizing, error, result, startOAuth, resetOAuth } = useOAuth();

  // The provider form reads validation errors off whatever holds its save
  // error, so a failed authorization has to be reported there rather than just
  // shown on the button.
  const reportSaveError = useCallback(
    (saveError: AppError | null) => {
      if (onSaveError) {
        onSaveError(saveError);
      } else if (section) {
        dispatch(set({ section, saveError }));
      }
    },
    [dispatch, onSaveError, section]
  );

  const handlePress = useCallback(() => {
    startOAuth({ name, provider, providerData })
      .then(() => {
        reportSaveError(null);
      })
      .catch((error) => {
        if (error?.status === 400) {
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
