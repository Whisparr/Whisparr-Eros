import React, { useCallback, useEffect } from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import useShowAdvancedSettings from 'Helpers/Hooks/useShowAdvancedSettings';
import { inputTypes, kinds, sizes } from 'Helpers/Props';
import { InputChanged } from 'typings/inputs';
import DownloadClientOptionsSettings from 'typings/Settings/DownloadClientOptions';
import {
  OnChildStateChange,
  SetChildSave,
} from 'typings/Settings/SettingsState';
import translate from 'Utilities/String/translate';
import { useManageDownloadClientOptions } from './useDownloadClientOptions';

interface DownloadClientOptionsProps {
  setChildSave: SetChildSave;
  onChildStateChange: OnChildStateChange;
}

function DownloadClientOptions({
  setChildSave,
  onChildStateChange,
}: Readonly<DownloadClientOptionsProps>) {
  const {
    settings,
    updateSetting,
    saveSettings,
    isFetching,
    isSaving,
    error,
    hasSettings,
    hasPendingChanges,
  } = useManageDownloadClientOptions();

  const showAdvancedSettings = useShowAdvancedSettings();

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      const key = name as keyof DownloadClientOptionsSettings;

      updateSetting(key, value as DownloadClientOptionsSettings[typeof key]);
    },
    [updateSetting]
  );

  useEffect(() => {
    setChildSave(saveSettings);
  }, [saveSettings, setChildSave]);

  useEffect(() => {
    onChildStateChange({ isSaving, hasPendingChanges });
  }, [hasPendingChanges, isSaving, onChildStateChange]);

  return (
    <div>
      {isFetching ? <LoadingIndicator /> : null}

      {!isFetching && error ? (
        <Alert kind={kinds.DANGER}>
          {translate('DownloadClientOptionsLoadError')}
        </Alert>
      ) : null}

      {hasSettings && !isFetching && !error && showAdvancedSettings ? (
        <div>
          <FieldSet legend={translate('CompletedDownloadHandling')}>
            <Form>
              <FormGroup
                advancedSettings={showAdvancedSettings}
                isAdvanced={true}
                size={sizes.MEDIUM}
              >
                <FormLabel>{translate('Enable')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="enableCompletedDownloadHandling"
                  helpText={translate(
                    'EnableCompletedDownloadHandlingHelpText'
                  )}
                  onChange={handleInputChange}
                  {...settings.enableCompletedDownloadHandling}
                />
              </FormGroup>

              <FormGroup
                advancedSettings={showAdvancedSettings}
                isAdvanced={true}
                size={sizes.MEDIUM}
              >
                <FormLabel>
                  {translate('CheckForFinishedDownloadsInterval')}
                </FormLabel>

                <FormInputGroup
                  type={inputTypes.NUMBER}
                  name="checkForFinishedDownloadInterval"
                  min={1}
                  max={120}
                  unit="minutes"
                  helpText={translate('RefreshMonitoredIntervalHelpText')}
                  onChange={handleInputChange}
                  {...settings.checkForFinishedDownloadInterval}
                />
              </FormGroup>
            </Form>
          </FieldSet>

          <FieldSet legend={translate('FailedDownloadHandling')}>
            <Form>
              <FormGroup
                advancedSettings={showAdvancedSettings}
                isAdvanced={true}
                size={sizes.MEDIUM}
              >
                <FormLabel>{translate('AutoRedownloadFailed')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="autoRedownloadFailed"
                  helpText={translate('AutoRedownloadFailedHelpText')}
                  onChange={handleInputChange}
                  {...settings.autoRedownloadFailed}
                />
              </FormGroup>

              {settings.autoRedownloadFailed.value ? (
                <FormGroup
                  advancedSettings={showAdvancedSettings}
                  isAdvanced={true}
                  size={sizes.MEDIUM}
                >
                  <FormLabel>
                    {translate('AutoRedownloadFailedFromInteractiveSearch')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.CHECK}
                    name="autoRedownloadFailedFromInteractiveSearch"
                    helpText={translate(
                      'AutoRedownloadFailedFromInteractiveSearchHelpText'
                    )}
                    onChange={handleInputChange}
                    {...settings.autoRedownloadFailedFromInteractiveSearch}
                  />
                </FormGroup>
              ) : null}
            </Form>

            <Alert kind={kinds.INFO}>{translate('RemoveDownloadsAlert')}</Alert>
          </FieldSet>
        </div>
      ) : null}
    </div>
  );
}

export default DownloadClientOptions;
