import React from 'react';
import FieldSet from 'Components/FieldSet';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { EnhancedSelectInputValue } from 'Components/Form/Select/EnhancedSelectInput';
import useShowAdvancedSettings from 'Helpers/Hooks/useShowAdvancedSettings';
import { inputTypes, sizes } from 'Helpers/Props';
import { useSystemStatusData } from 'System/Status/useSystemStatus';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import { GeneralSettingsSectionProps } from './GeneralSettingsProps';

const branchValues = ['master', 'develop', 'nightly'];

function UpdateSettings({
  settings,
  onInputChange,
}: Readonly<GeneralSettingsSectionProps>) {
  const advancedSettings = useShowAdvancedSettings();
  const { packageUpdateMechanism } = useSystemStatusData();

  const { branch, updateAutomatically, updateMechanism, updateScriptPath } =
    settings;

  if (!advancedSettings) {
    return null;
  }

  const usingExternalUpdateMechanism = packageUpdateMechanism !== 'builtIn';

  const updateOptions: EnhancedSelectInputValue<string>[] = [];

  if (usingExternalUpdateMechanism) {
    updateOptions.push({
      key: packageUpdateMechanism,
      value: titleCase(packageUpdateMechanism),
    });
  } else {
    updateOptions.push({ key: 'builtIn', value: translate('BuiltIn') });
  }

  updateOptions.push({ key: 'script', value: translate('Script') });

  return (
    <FieldSet legend={translate('Updates')}>
      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('Branch')}</FormLabel>

        <FormInputGroup
          type={inputTypes.AUTO_COMPLETE}
          name="branch"
          helpText={
            usingExternalUpdateMechanism
              ? translate('BranchUpdateMechanism')
              : translate('BranchUpdate')
          }
          helpLink="https://wiki.servarr.com/whisparr/settings#updates"
          {...branch}
          values={branchValues}
          readOnly={usingExternalUpdateMechanism}
          onChange={onInputChange}
        />
      </FormGroup>

      <div>
        <FormGroup
          advancedSettings={advancedSettings}
          isAdvanced={true}
          size={sizes.MEDIUM}
        >
          <FormLabel>{translate('Automatic')}</FormLabel>

          <FormInputGroup
            type={inputTypes.CHECK}
            name="updateAutomatically"
            helpText={translate('UpdateAutomaticallyHelpText')}
            helpTextWarning={
              updateMechanism.value === 'docker'
                ? translate('AutomaticUpdatesDisabledDocker')
                : undefined
            }
            onChange={onInputChange}
            {...updateAutomatically}
          />
        </FormGroup>

        <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
          <FormLabel>{translate('Mechanism')}</FormLabel>

          <FormInputGroup
            type={inputTypes.SELECT}
            name="updateMechanism"
            values={updateOptions}
            helpText={translate('UpdateMechanismHelpText')}
            helpLink="https://wiki.servarr.com/whisparr/settings#updates"
            onChange={onInputChange}
            {...updateMechanism}
          />
        </FormGroup>

        {updateMechanism.value === 'script' && (
          <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
            <FormLabel>{translate('ScriptPath')}</FormLabel>

            <FormInputGroup
              type={inputTypes.TEXT}
              name="updateScriptPath"
              helpText={translate('UpdateScriptPathHelpText')}
              onChange={onInputChange}
              {...updateScriptPath}
            />
          </FormGroup>
        )}
      </div>
    </FieldSet>
  );
}

export default UpdateSettings;
