import React, { useCallback, useEffect, useState } from 'react';
import { useAppValue } from 'App/appStore';
import TextInput from 'Components/Form/TextInput';
import Icon, { IconProps } from 'Components/Icon';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { icons, kinds } from 'Helpers/Props';
import { useRestart } from 'System/useSystem';
import { FileInputChanged } from 'typings/inputs';
import { ApiError } from 'Utilities/Fetch/fetchJson';
import translate from 'Utilities/String/translate';
import { useRestoreBackup, useRestoreBackupUpload } from './useBackups';
import styles from './RestoreBackupModalContent.css';

function getErrorMessage(error: ApiError | Error | null) {
  if (error instanceof ApiError && error.statusBody) {
    const { message } = error.statusBody as { message?: string };

    if (message) {
      return message;
    }
  }

  return translate('ErrorRestoringBackup');
}

function getStepIconProps(
  isExecuting: boolean,
  hasExecuted: boolean,
  error?: ApiError | Error | null
): IconProps {
  if (isExecuting) {
    return {
      name: icons.SPINNER,
      isSpinning: true,
    };
  }

  if (hasExecuted) {
    return {
      name: icons.CHECK,
      kind: kinds.SUCCESS,
    };
  }

  if (error) {
    return {
      name: icons.FATAL,
      kind: kinds.DANGER,
      title: getErrorMessage(error),
    };
  }

  return {
    name: icons.PENDING,
  };
}

interface RestoreBackupModalContentProps {
  id?: number;
  name?: string;
  onModalClose: () => void;
}

function RestoreBackupModalContent({
  id,
  name,
  onModalClose,
}: RestoreBackupModalContentProps) {
  const { mutate: restart } = useRestart();
  const isRestarting = useAppValue('isRestarting');

  const { restoreBackupById, isRestoringBackup, restoreBackupError } =
    useRestoreBackup(id || 0);
  const { uploadBackup, isUploadingBackup, uploadBackupError } =
    useRestoreBackupUpload();

  const [path, setPath] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const [isRestarted, setIsRestarted] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const isRestoring = isRestoringBackup || isUploadingBackup;
  const restoreError = restoreBackupError || uploadBackupError;
  const wasRestoring = usePrevious(isRestoring);
  const wasRestarting = usePrevious(isRestarting);

  const isRestoreDisabled =
    (!id && !path) || isRestoring || isRestarting || isReloading;

  const handlePathChange = useCallback(({ value, files }: FileInputChanged) => {
    if (!files?.length) {
      return;
    }

    setPath(value);
    setFile(files[0]);
  }, []);

  const handleRestorePress = useCallback(() => {
    if (id) {
      restoreBackupById();
    } else if (file) {
      const formData = new FormData();
      formData.append('restore', file);
      uploadBackup(formData);
    }
  }, [id, file, restoreBackupById, uploadBackup]);

  useEffect(() => {
    if (wasRestoring && !isRestoring && !restoreError) {
      setIsRestored(true);
      restart();
    }
  }, [isRestoring, wasRestoring, restoreError, restart]);

  useEffect(() => {
    if (wasRestarting && !isRestarting) {
      setIsRestarted(true);
      setIsReloading(true);
      window.location.reload();
    }
  }, [isRestarting, wasRestarting]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('RestoreBackup')}</ModalHeader>

      <ModalBody>
        {id && name ? (
          translate('WouldYouLikeToRestoreBackup', {
            name,
          })
        ) : (
          <TextInput
            type="file"
            name="path"
            value={path}
            onChange={handlePathChange}
          />
        )}

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepState}>
              <Icon
                size={20}
                {...getStepIconProps(isRestoring, isRestored, restoreError)}
              />
            </div>

            <div>{translate('Restore')}</div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepState}>
              <Icon
                size={20}
                {...getStepIconProps(isRestarting, isRestarted)}
              />
            </div>

            <div>{translate('Restart')}</div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepState}>
              <Icon size={20} {...getStepIconProps(isReloading, false)} />
            </div>

            <div>{translate('Reload')}</div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className={styles.additionalInfo}>
          {translate('RestartReloadNote')}
        </div>

        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <SpinnerButton
          kind={kinds.WARNING}
          isDisabled={isRestoreDisabled}
          isSpinning={isRestoring}
          onPress={handleRestorePress}
        >
          {translate('Restore')}
        </SpinnerButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default RestoreBackupModalContent;
