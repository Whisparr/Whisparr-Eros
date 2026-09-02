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

function WhisparrSettings({
  settings,
  onInputChange,
}: Readonly<GeneralSettingsSectionProps>) {
  const advancedSettings = useShowAdvancedSettings();

  const {
    whisparrAlwaysExcludeCollectionsTag,
    whisparrAlwaysExcludePerformersTag,
    whisparrAlwaysExcludeStudiosTag,
    whisparrAlwaysExcludeStudiosAfterTag,
    whisparrAlwaysExcludeTagsTag,
    whisparrAutoMatchOnDate,
    whisparrCacheExclusionAPI,
    whisparrCacheMovieAPI,
    whisparrCachePerformerAPI,
    whisparrCacheStudioAPI,
    whisparrCorruptFileDetection,
    whisparrFuzzyTitleMatchingThreshold,
    whisparrMonitorNewItems,
    whisparrMovieMetadataSource,
    whisparrValidateRuntime,
    whisparrValidateRuntimeLimit,
  } = settings;

  const movieMetadataTypes: EnhancedSelectInputValue<string>[] = [
    {
      key: 'none',
      value: translate('None'),
    },
    {
      key: 'tmdb',
      value: translate('TMDB'),
    },
    {
      key: 'tpdb',
      value: translate('TPDB'),
    },
  ];

  return (
    <FieldSet legend={translate('Whisparr')}>
      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('WhisparrCacheExclusionAPI')}</FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="whisparrCacheExclusionAPI"
          helpText={translate('WhisparrCacheExclusionAPIHelpText')}
          onChange={onInputChange}
          {...whisparrCacheExclusionAPI}
        />
      </FormGroup>

      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('WhisparrCacheMovieAPI')}</FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="whisparrCacheMovieAPI"
          helpText={translate('WhisparrCacheMovieAPIHelpText')}
          onChange={onInputChange}
          {...whisparrCacheMovieAPI}
        />
      </FormGroup>

      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('WhisparrCachePerformerAPI')}</FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="whisparrCachePerformerAPI"
          helpText={translate('WhisparrCachePerformerAPIHelpText')}
          onChange={onInputChange}
          {...whisparrCachePerformerAPI}
        />
      </FormGroup>

      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('WhisparrCacheStudioAPI')}</FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="whisparrCacheStudioAPI"
          helpText={translate('WhisparrCacheStudioAPIHelpText')}
          onChange={onInputChange}
          {...whisparrCacheStudioAPI}
        />
      </FormGroup>

      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('WhisparrAutoMatchOnDate')}</FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="whisparrAutoMatchOnDate"
          helpText={translate('WhisparrAutoMatchOnDateHelpText')}
          helpTextWarning={translate('WhisparrAutoMatchOnDateHelpTextWarning')}
          onChange={onInputChange}
          {...whisparrAutoMatchOnDate}
        />
      </FormGroup>
      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>
          {translate('WhisparrFuzzyTitleMatchingThreshold')}
        </FormLabel>
        <FormInputGroup
          type={inputTypes.NUMBER}
          min={0}
          max={100}
          name="whisparrFuzzyTitleMatchingThreshold"
          helpText={translate('WhisparrFuzzyTitleMatchingThresholdHelpText')}
          onChange={onInputChange}
          {...whisparrFuzzyTitleMatchingThreshold}
        />
      </FormGroup>
      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('WhisparrCorruptFileDetection')}</FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="whisparrCorruptFileDetection"
          helpText={translate('WhisparrCorruptFileDetectionHelpText')}
          onChange={onInputChange}
          {...whisparrCorruptFileDetection}
        />
      </FormGroup>

      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('WhisparrValidateRuntime')}</FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="whisparrValidateRuntime"
          helpText={translate('WhisparrValidateRuntimeHelpText')}
          onChange={onInputChange}
          {...whisparrValidateRuntime}
        />
      </FormGroup>

      <FormGroup advancedSettings={advancedSettings} isAdvanced={true}>
        <FormLabel>{translate('WhisparrValidateRuntimeLimit')}</FormLabel>

        <FormInputGroup
          type={inputTypes.NUMBER}
          name="whisparrValidateRuntimeLimit"
          helpText={translate('WhisparrValidateRuntimeLimitHelpText')}
          onChange={onInputChange}
          {...whisparrValidateRuntimeLimit}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>{translate('WhisparrMonitorNewItems')}</FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="whisparrMonitorNewItems"
          helpText={translate('WhisparrMonitorNewItemsHelpText')}
          onChange={onInputChange}
          {...whisparrMonitorNewItems}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>{translate('WhisparrMovieMetadataSource')}</FormLabel>

        <FormInputGroup
          type={inputTypes.SELECT}
          name="whisparrMovieMetadataSource"
          values={movieMetadataTypes}
          helpText={translate('WhisparrMovieMetadataSourceHelpText')}
          onChange={onInputChange}
          {...whisparrMovieMetadataSource}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>
          {translate('WhisparrAlwaysExcludeCollectionsTag')}
        </FormLabel>

        <FormInputGroup
          type={inputTypes.TEXT}
          name="whisparrAlwaysExcludeCollectionsTag"
          helpText={translate('WhisparrAlwaysExcludeCollectionsTagHelpText')}
          onChange={onInputChange}
          {...whisparrAlwaysExcludeCollectionsTag}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>{translate('WhisparrAlwaysExcludePerformersTag')}</FormLabel>

        <FormInputGroup
          type={inputTypes.TEXT}
          name="whisparrAlwaysExcludePerformersTag"
          helpText={translate('WhisparrAlwaysExcludePerformersTagHelpText')}
          onChange={onInputChange}
          {...whisparrAlwaysExcludePerformersTag}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>{translate('WhisparrAlwaysExcludeStudiosTag')}</FormLabel>

        <FormInputGroup
          type={inputTypes.TEXT}
          name="whisparrAlwaysExcludeStudiosTag"
          helpText={translate('WhisparrAlwaysExcludeStudiosTagHelpText')}
          onChange={onInputChange}
          {...whisparrAlwaysExcludeStudiosTag}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>
          {translate('WhisparrAlwaysExcludeStudiosAfterTag')}
        </FormLabel>

        <FormInputGroup
          type={inputTypes.TEXT}
          name="whisparrAlwaysExcludeStudiosAfterTag"
          helpText={translate('WhisparrAlwaysExcludeStudiosAfterTagHelpText')}
          onChange={onInputChange}
          {...whisparrAlwaysExcludeStudiosAfterTag}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>{translate('WhisparrAlwaysExcludeTagsTag')}</FormLabel>

        <FormInputGroup
          type={inputTypes.TEXT}
          name="whisparrAlwaysExcludeTagsTag"
          helpText={translate('WhisparrAlwaysExcludeTagsTagHelpText')}
          onChange={onInputChange}
          {...whisparrAlwaysExcludeTagsTag}
        />
      </FormGroup>
    </FieldSet>
  );
}

export default WhisparrSettings;
