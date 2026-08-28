import React, { useCallback, useRef, useState } from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import { icons } from 'Helpers/Props';
import SettingsToolbar from 'Settings/SettingsToolbar';
import {
  SaveCallback,
  SettingsStateChange,
} from 'typings/Settings/SettingsState';
import translate from 'Utilities/String/translate';
import DownloadClients from './DownloadClients/DownloadClients';
import ManageDownloadClientsModal from './DownloadClients/Manage/ManageDownloadClientsModal';
import { useTestAllDownloadClients } from './DownloadClients/useDownloadClients';
import DownloadClientOptions from './Options/DownloadClientOptions';
import RemotePathMappings from './RemotePathMappings/RemotePathMappings';

function DownloadClientSettings() {
  const { testAllDownloadClients, isTestingAll } = useTestAllDownloadClients();

  const saveOptions = useRef<(() => void) | undefined>(undefined);

  const [isSaving, setIsSaving] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isManageDownloadClientsOpen, setIsManageDownloadClientsOpen] =
    useState(false);

  const handleSetChildSave = useCallback((saveCallback: SaveCallback) => {
    saveOptions.current = saveCallback;
  }, []);

  const handleChildStateChange = useCallback(
    ({ isSaving, hasPendingChanges }: SettingsStateChange) => {
      setIsSaving(isSaving);
      setHasPendingChanges(hasPendingChanges);
    },
    []
  );

  const handleManageDownloadClientsPress = useCallback(() => {
    setIsManageDownloadClientsOpen(true);
  }, []);

  const handleManageDownloadClientsModalClose = useCallback(() => {
    setIsManageDownloadClientsOpen(false);
  }, []);

  const handleSavePress = useCallback(() => {
    saveOptions.current?.();
  }, []);

  const handleTestAllDownloadClientsPress = useCallback(() => {
    testAllDownloadClients();
  }, [testAllDownloadClients]);

  return (
    <PageContent title={translate('DownloadClientSettings')}>
      <SettingsToolbar
        isSaving={isSaving}
        hasPendingChanges={hasPendingChanges}
        additionalButtons={
          <>
            <PageToolbarSeparator />

            <PageToolbarButton
              label={translate('TestAllClients')}
              iconName={icons.TEST}
              isSpinning={isTestingAll}
              onPress={handleTestAllDownloadClientsPress}
            />

            <PageToolbarButton
              label={translate('ManageClients')}
              iconName={icons.MANAGE}
              onPress={handleManageDownloadClientsPress}
            />
          </>
        }
        onSavePress={handleSavePress}
      />

      <PageContentBody>
        <DownloadClients />

        <DownloadClientOptions
          setChildSave={handleSetChildSave}
          onChildStateChange={handleChildStateChange}
        />

        <RemotePathMappings />

        <ManageDownloadClientsModal
          isOpen={isManageDownloadClientsOpen}
          onModalClose={handleManageDownloadClientsModalClose}
        />
      </PageContentBody>
    </PageContent>
  );
}

export default DownloadClientSettings;
