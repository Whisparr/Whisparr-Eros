import React, { useCallback, useEffect } from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { EnhancedSelectInputValue } from 'Components/Form/Select/EnhancedSelectInput';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import useShowAdvancedSettings from 'Helpers/Hooks/useShowAdvancedSettings';
import { inputTypes, kinds } from 'Helpers/Props';
import { InputChanged } from 'typings/inputs';
import ImportListOptionsSettings from 'typings/Settings/ImportListOptions';
import {
  OnChildStateChange,
  SetChildSave,
} from 'typings/Settings/SettingsState';
import translate from 'Utilities/String/translate';
import { useManageImportListOptions } from './useImportListOptions';

const cleanLibraryLevelOptions: EnhancedSelectInputValue<string>[] = [
  {
    key: 'disabled',
    get value() {
      return translate('Disabled');
    },
  },
  {
    key: 'logOnly',
    get value() {
      return translate('LogOnly');
    },
  },
  {
    key: 'keepAndUnmonitor',
    get value() {
      return translate('KeepAndUnmonitorMovie');
    },
  },
  {
    key: 'removeAndKeep',
    get value() {
      return translate('RemoveMovieAndKeepFiles');
    },
  },
  {
    key: 'removeAndDelete',
    get value() {
      return translate('RemoveMovieAndDeleteFiles');
    },
  },
];

interface ImportListOptionsProps {
  setChildSave: SetChildSave;
  onChildStateChange: OnChildStateChange;
}

function ImportListOptions({
  setChildSave,
  onChildStateChange,
}: Readonly<ImportListOptionsProps>) {
  const showAdvancedSettings = useShowAdvancedSettings();

  const {
    settings,
    updateSetting,
    saveSettings,
    isFetching,
    isSaving,
    error,
    hasSettings,
    hasPendingChanges,
  } = useManageImportListOptions();

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      const key = name as keyof ImportListOptionsSettings;

      updateSetting(key, value as ImportListOptionsSettings[typeof key]);
    },
    [updateSetting]
  );

  useEffect(() => {
    setChildSave(saveSettings);
  }, [saveSettings, setChildSave]);

  useEffect(() => {
    onChildStateChange({ isSaving, hasPendingChanges });
  }, [onChildStateChange, isSaving, hasPendingChanges]);

  // The whole section is advanced-only, and it always has been. The hooks above
  // still run, so the toolbar's Save keeps saving these options even while the
  // fieldset is hidden -- which is what the slice's dispatches did too.
  if (!showAdvancedSettings) {
    return null;
  }

  return (
    <FieldSet legend={translate('Options')}>
      {isFetching ? <LoadingIndicator /> : null}

      {!isFetching && error ? (
        <Alert kind={kinds.DANGER}>{translate('ListOptionsLoadError')}</Alert>
      ) : null}

      {hasSettings && !error ? (
        <Form>
          <FormGroup advancedSettings={showAdvancedSettings} isAdvanced={true}>
            <FormLabel>{translate('CleanLibraryLevel')}</FormLabel>
            <FormInputGroup
              type={inputTypes.SELECT}
              name="listSyncLevel"
              values={cleanLibraryLevelOptions}
              helpText={translate('ListSyncLevelHelpText')}
              onChange={handleInputChange}
              {...settings.listSyncLevel}
            />
          </FormGroup>
        </Form>
      ) : null}
    </FieldSet>
  );
}

export default ImportListOptions;
