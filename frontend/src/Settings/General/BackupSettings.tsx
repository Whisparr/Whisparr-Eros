import React from 'react';
import FieldSet from 'Components/FieldSet';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import useShowAdvancedSettings from 'Helpers/Hooks/useShowAdvancedSettings';
import { inputTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import { GeneralSettingsSectionProps } from './GeneralSettingsProps';

function BackupSettings({
  settings,
  onInputChange,
}: Readonly<GeneralSettingsSectionProps>) {
  const advancedSettings = useShowAdvancedSettings();

  const { backupFolder, backupInterval, backupRetention } = settings;

  if (!advancedSettings) {
    return null;
  }

  return (
    <FieldSet legend={translate('Backups')}>
      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('Folder')}</FormLabel>

        <FormInputGroup
          type={inputTypes.PATH}
          name="backupFolder"
          helpText={translate('BackupFolderHelpText')}
          includeFiles={false}
          onChange={onInputChange}
          {...backupFolder}
        />
      </FormGroup>

      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('Interval')}</FormLabel>

        <FormInputGroup
          type={inputTypes.NUMBER}
          name="backupInterval"
          unit="days"
          helpText={translate('BackupIntervalHelpText')}
          onChange={onInputChange}
          {...backupInterval}
        />
      </FormGroup>

      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('Retention')}</FormLabel>

        <FormInputGroup
          type={inputTypes.NUMBER}
          name="backupRetention"
          unit="days"
          helpText={translate('BackupRetentionHelpText')}
          onChange={onInputChange}
          {...backupRetention}
        />
      </FormGroup>
    </FieldSet>
  );
}

export default BackupSettings;
