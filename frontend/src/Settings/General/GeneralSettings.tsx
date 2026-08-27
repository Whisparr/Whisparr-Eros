import React, { useCallback, useEffect, useState } from 'react';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import Alert from 'Components/Alert';
import Form from 'Components/Form/Form';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { kinds } from 'Helpers/Props';
import SettingsToolbar from 'Settings/SettingsToolbar';
import { useIsWindowsService } from 'System/Status/useSystemStatus';
import { useRestart } from 'System/useSystem';
import { InputChanged } from 'typings/inputs';
import General from 'typings/Settings/General';
import translate from 'Utilities/String/translate';
import AnalyticSettings from './AnalyticSettings';
import BackupSettings from './BackupSettings';
import HostSettings from './HostSettings';
import LoggingSettings from './LoggingSettings';
import ProxySettings from './ProxySettings';
import SecuritySettings from './SecuritySettings';
import UpdateSettings from './UpdateSettings';
import { useManageGeneralSettings } from './useGeneralSettings';
import WhisparrSettings from './WhisparrSettings';

const REQUIRES_RESTART_KEYS: (keyof General)[] = [
  'bindAddress',
  'port',
  'urlBase',
  'instanceName',
  'enableSsl',
  'sslPort',
  'sslCertPath',
  'sslCertPassword',
];

function GeneralSettings() {
  const isWindowsService = useIsWindowsService();
  const { mutate: restart } = useRestart();
  const executeCommand = useExecuteCommand();
  const isResettingApiKey = useCommandExecuting(commandNames.RESET_API_KEY);

  const {
    settings,
    hasSettings,
    isFetching,
    isFetched,
    error,
    isSaving,
    saveError,
    hasPendingChanges,
    pendingChanges,
    validationErrors,
    validationWarnings,
    updateSetting,
    saveSettings,
  } = useManageGeneralSettings();

  const wasSaving = usePrevious(isSaving);
  const wasResettingApiKey = usePrevious(isResettingApiKey);
  const previousPendingChanges = usePrevious(pendingChanges);

  const [isRestartRequiredModalOpen, setIsRestartRequiredModalOpen] =
    useState(false);

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateSetting(name as keyof General, value as General[keyof General]);
    },
    [updateSetting]
  );

  const handleSavePress = useCallback(() => {
    saveSettings();
  }, [saveSettings]);

  const handleConfirmResetApiKey = useCallback(() => {
    executeCommand({ name: commandNames.RESET_API_KEY });
  }, [executeCommand]);

  const handleConfirmRestart = useCallback(() => {
    setIsRestartRequiredModalOpen(false);
    restart();
  }, [restart]);

  const handleCloseRestartRequiredModal = useCallback(() => {
    setIsRestartRequiredModalOpen(false);
  }, []);

  // The class this replaces compared each restart-sensitive setting's
  // `previousValue` against its `value` after a save, which only worked because
  // the slice kept the pending bag until the fetch that followed the save
  // overwrote it. `useSaveSettings` clears the bag on success, so the keys that
  // were pending have to be read from the render before the save landed.
  useEffect(() => {
    const requiresRestart = Object.keys(previousPendingChanges ?? {}).some(
      (key) => REQUIRES_RESTART_KEYS.includes(key as keyof General)
    );

    if (wasSaving && !isSaving && !saveError && requiresRestart) {
      setIsRestartRequiredModalOpen(true);
    }
  }, [isSaving, wasSaving, saveError, previousPendingChanges]);

  useEffect(() => {
    if (wasResettingApiKey && !isResettingApiKey) {
      setIsRestartRequiredModalOpen(true);
    }
  }, [isResettingApiKey, wasResettingApiKey]);

  return (
    <PageContent title={translate('GeneralSettings')}>
      <SettingsToolbar
        hasPendingChanges={hasPendingChanges}
        isSaving={isSaving}
        onSavePress={handleSavePress}
      />

      <PageContentBody>
        {isFetching && !isFetched ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>
            {translate('GeneralSettingsLoadError')}
          </Alert>
        ) : null}

        {hasSettings && isFetched && !error ? (
          <Form
            id="generalSettings"
            validationErrors={validationErrors}
            validationWarnings={validationWarnings}
          >
            <HostSettings
              settings={settings}
              onInputChange={handleInputChange}
            />

            <SecuritySettings
              settings={settings}
              isResettingApiKey={isResettingApiKey}
              onInputChange={handleInputChange}
              onConfirmResetApiKey={handleConfirmResetApiKey}
            />

            <ProxySettings
              settings={settings}
              onInputChange={handleInputChange}
            />

            <LoggingSettings
              settings={settings}
              onInputChange={handleInputChange}
            />

            <AnalyticSettings
              settings={settings}
              onInputChange={handleInputChange}
            />

            <UpdateSettings
              settings={settings}
              onInputChange={handleInputChange}
            />

            <BackupSettings
              settings={settings}
              onInputChange={handleInputChange}
            />

            <WhisparrSettings
              settings={settings}
              onInputChange={handleInputChange}
            />
          </Form>
        ) : null}
      </PageContentBody>

      <ConfirmModal
        isOpen={isRestartRequiredModalOpen}
        kind={kinds.DANGER}
        title={translate('RestartWhisparr')}
        message={`${translate('RestartRequiredToApplyChanges')} ${isWindowsService ? translate('RestartRequiredWindowsService') : ''}`}
        cancelLabel={translate('RestartLater')}
        confirmLabel={translate('RestartNow')}
        onConfirm={handleConfirmRestart}
        onCancel={handleCloseRestartRequiredModal}
      />
    </PageContent>
  );
}

export default GeneralSettings;
