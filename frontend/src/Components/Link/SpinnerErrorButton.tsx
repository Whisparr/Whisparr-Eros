import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon, { IconKind, IconName } from 'Components/Icon';
import SpinnerButton, {
  SpinnerButtonProps,
} from 'Components/Link/SpinnerButton';
import StatusIndicator from 'Components/StatusIndicator';
import { getValidationFailures } from 'Helpers/Hooks/useApiMutation';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { icons } from 'Helpers/Props';
import { ApiError } from 'Utilities/Fetch/fetchJson';
import styles from './SpinnerErrorButton.css';

function getTestResult(error: ApiError | string | undefined | null) {
  if (!error) {
    return {
      wasSuccessful: true,
      hasWarning: false,
      hasError: false,
    };
  }

  if (typeof error === 'string') {
    return {
      wasSuccessful: false,
      hasWarning: false,
      hasError: true,
    };
  }

  if (error.statusCode !== 400 || error.statusBody == null) {
    return {
      wasSuccessful: false,
      hasWarning: false,
      hasError: true,
    };
  }

  const failures = getValidationFailures(error);

  return {
    wasSuccessful: false,
    hasWarning: failures.warnings.length > 0,
    hasError: failures.errors.length > 0,
  };
}

interface SpinnerErrorButtonProps extends SpinnerButtonProps {
  isSpinning: boolean;
  error?: ApiError | string | null;
  pendingLabel?: string;
  successLabel?: string;
  warningLabel?: string;
  errorLabel?: string;
  children: React.ReactNode;
}

function SpinnerErrorButton({
  kind,
  isSpinning,
  error,
  pendingLabel,
  successLabel,
  warningLabel,
  errorLabel,
  children,
  ...otherProps
}: SpinnerErrorButtonProps) {
  const wasSpinning = usePrevious(isSpinning);
  const updateTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const [result, setResult] = useState({
    wasSuccessful: false,
    hasWarning: false,
    hasError: false,
  });
  const { wasSuccessful, hasWarning, hasError } = result;

  const showIcon = wasSuccessful || hasWarning || hasError;

  let statusLabel: string | undefined = undefined;

  if (isSpinning) {
    statusLabel = pendingLabel;
  } else if (hasError) {
    statusLabel = errorLabel;
  } else if (hasWarning) {
    statusLabel = warningLabel;
  } else if (wasSuccessful) {
    statusLabel = successLabel;
  }

  const { iconName, iconKind } = useMemo<{
    iconName: IconName;
    iconKind: IconKind;
  }>(() => {
    if (hasError) {
      return {
        iconName: icons.DANGER,
        iconKind: 'danger',
      };
    }

    if (hasWarning) {
      return {
        iconName: icons.WARNING,
        iconKind: 'warning',
      };
    }

    return {
      iconName: icons.CHECK,
      iconKind: kind === 'primary' ? 'default' : 'success',
    };
  }, [kind, hasError, hasWarning]);

  useEffect(() => {
    if (wasSpinning && !isSpinning) {
      const testResult = getTestResult(error);

      setResult(testResult);

      const { wasSuccessful, hasWarning, hasError } = testResult;

      if (wasSuccessful || hasWarning || hasError) {
        updateTimeout.current = setTimeout(() => {
          setResult({
            wasSuccessful: false,
            hasWarning: false,
            hasError: false,
          });
        }, 3000);
      }
    }
  }, [isSpinning, wasSpinning, error]);

  useEffect(() => {
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, []);

  return (
    <>
      <SpinnerButton kind={kind} isSpinning={isSpinning} {...otherProps}>
        <span className={showIcon ? styles.showIcon : undefined}>
          {showIcon ? (
            <span className={styles.iconContainer}>
              <Icon name={iconName} kind={iconKind} aria-hidden={true} />
            </span>
          ) : null}

          <span className={styles.label}>{children}</span>
        </span>
      </SpinnerButton>

      {statusLabel ? (
        <StatusIndicator
          label={statusLabel}
          role={hasError ? 'alert' : 'status'}
          aria-atomic={true}
        >
          <span />
        </StatusIndicator>
      ) : null}
    </>
  );
}

export default SpinnerErrorButton;
