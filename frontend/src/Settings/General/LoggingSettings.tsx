import React from 'react';
import FieldSet from 'Components/FieldSet';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { EnhancedSelectInputValue } from 'Components/Form/Select/EnhancedSelectInput';
import useShowAdvancedSettings from 'Helpers/Hooks/useShowAdvancedSettings';
import { inputTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import { GeneralSettingsSectionProps } from './GeneralSettingsProps';

const logLevelOptions: EnhancedSelectInputValue<string>[] = [
  {
    key: 'warn',
    get value() {
      return translate('Warn');
    },
  },
  {
    key: 'info',
    get value() {
      return translate('Info');
    },
  },
  {
    key: 'debug',
    get value() {
      return translate('Debug');
    },
  },
  {
    key: 'trace',
    get value() {
      return translate('Trace');
    },
  },
];

function LoggingSettings({
  settings,
  onInputChange,
}: Readonly<GeneralSettingsSectionProps>) {
  const advancedSettings = useShowAdvancedSettings();

  const { logLevel, logSizeLimit } = settings;

  return (
    <FieldSet legend={translate('Logging')}>
      <FormGroup>
        <FormLabel>{translate('LogLevel')}</FormLabel>

        <FormInputGroup
          type={inputTypes.SELECT}
          name="logLevel"
          values={logLevelOptions}
          helpTextWarning={
            logLevel.value === 'trace'
              ? translate('LogLevelTraceHelpTextWarning')
              : undefined
          }
          onChange={onInputChange}
          {...logLevel}
        />
      </FormGroup>

      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('LogSizeLimit')}</FormLabel>

        <FormInputGroup
          type={inputTypes.NUMBER}
          name="logSizeLimit"
          min={1}
          max={10}
          unit="MB"
          helpText={translate('LogSizeLimitHelpText')}
          onChange={onInputChange}
          {...logSizeLimit}
        />
      </FormGroup>
    </FieldSet>
  );
}

export default LoggingSettings;
