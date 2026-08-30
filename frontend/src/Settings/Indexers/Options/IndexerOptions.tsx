import React, { useCallback, useEffect } from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import useShowAdvancedSettings from 'Helpers/Hooks/useShowAdvancedSettings';
import { inputTypes, kinds } from 'Helpers/Props';
import { InputChanged } from 'typings/inputs';
import IndexerOptionsSettings from 'typings/Settings/IndexerOptions';
import {
  OnChildStateChange,
  SetChildSave,
} from 'typings/Settings/SettingsState';
import translate from 'Utilities/String/translate';
import { useManageIndexerOptions } from './useIndexerOptions';

interface IndexerOptionsProps {
  setChildSave: SetChildSave;
  onChildStateChange: OnChildStateChange;
}

function IndexerOptions({
  setChildSave,
  onChildStateChange,
}: Readonly<IndexerOptionsProps>) {
  const {
    settings,
    updateSetting,
    saveSettings,
    isFetching,
    isSaving,
    error,
    hasSettings,
    hasPendingChanges,
  } = useManageIndexerOptions();

  const showAdvancedSettings = useShowAdvancedSettings();
  const searchDateFormatOptions = [
    {
      key: 'yymmdd',
      value: translate('yymmdd'),
    },
    {
      key: 'ddmmyyyy',
      value: translate('ddmmyyyy'),
    },
    {
      key: 'both',
      value: translate('Both'),
    },
  ];
  const searchStudioFormatOptions = [
    {
      key: 'original',
      value: translate('Original'),
    },
    {
      key: 'clean',
      value: translate('Clean'),
    },
    {
      key: 'both',
      value: translate('Both'),
    },
  ];

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      const key = name as keyof IndexerOptionsSettings;

      updateSetting(key, value as IndexerOptionsSettings[typeof key]);
    },
    [updateSetting]
  );

  // The endpoint holds one comma-separated string; `TextTagInput` splits it for
  // display and hands an array back, so the join is what keeps the two ends
  // agreeing. It was a second dispatch under the slice for the same reason.
  const handleWhitelistedSubtitleChange = useCallback(
    ({ value }: InputChanged<string[]>) => {
      updateSetting('whitelistedHardcodedSubs', value.join(','));
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
      <FieldSet legend={translate('Options')}>
        {isFetching ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>
            {translate('IndexerOptionsLoadError')}
          </Alert>
        ) : null}

        {hasSettings && !error ? (
          <Form>
            <FormGroup>
              <FormLabel>{translate('MinimumAge')}</FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="minimumAge"
                min={0}
                unit="minutes"
                helpText={translate('MinimumAgeHelpText')}
                onChange={handleInputChange}
                {...settings.minimumAge}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('Retention')}</FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="retention"
                min={0}
                unit="days"
                helpText={translate('RetentionHelpText')}
                onChange={handleInputChange}
                {...settings.retention}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('MaximumSize')}</FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="maximumSize"
                min={0}
                unit="MB"
                helpText={translate('MaximumSizeHelpText')}
                onChange={handleInputChange}
                {...settings.maximumSize}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('PreferIndexerFlags')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="preferIndexerFlags"
                helpText={translate('PreferIndexerFlagsHelpText')}
                helpLink="https://wiki.servarr.com/whisparr/settings#indexer-flags"
                onChange={handleInputChange}
                {...settings.preferIndexerFlags}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('AvailabilityDelay')}</FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="availabilityDelay"
                unit="days"
                helpText={translate('AvailabilityDelayHelpText')}
                onChange={handleInputChange}
                {...settings.availabilityDelay}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('RssSyncInterval')}</FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="rssSyncInterval"
                min={0}
                max={120}
                unit="minutes"
                helpText={translate('RssSyncIntervalHelpText')}
                helpTextWarning={translate('RssSyncIntervalHelpTextWarning')}
                helpLink="https://wiki.servarr.com/whisparr/faq#how-does-whisparr-work"
                onChange={handleInputChange}
                {...settings.rssSyncInterval}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('WhitelistedSubtitleTags')}</FormLabel>

              <FormInputGroup
                type={inputTypes.TEXT_TAG}
                name="whitelistedHardcodedSubs"
                helpText={translate('WhitelistedHardcodedSubsHelpText')}
                onChange={handleWhitelistedSubtitleChange}
                {...settings.whitelistedHardcodedSubs}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('AllowHardcodedSubs')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="allowHardcodedSubs"
                helpText={translate('AllowHardcodedSubsHelpText')}
                onChange={handleInputChange}
                {...settings.allowHardcodedSubs}
              />
            </FormGroup>
          </Form>
        ) : null}
      </FieldSet>
      {showAdvancedSettings ? (
        <FieldSet legend={translate('AdvancedSearchOptions')}>
          <Form>
            <Alert kind={kinds.WARNING}>
              <p>{translate('IndexerAdvancedSearchWarning1')}</p>
              <p>{translate('IndexerAdvancedSearchWarning2')}</p>
              <p>{translate('IndexerAdvancedSearchWarning3')}</p>
            </Alert>
            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('SearchTitleOnly')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="searchTitleOnly"
                helpText={translate('SearchTitleOnlyHelpText')}
                helpTextWarning={`${translate('Default')}: ${translate(
                  'Disabled'
                )}`}
                onChange={handleInputChange}
                {...settings.searchTitleOnly}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('SearchTitleDate')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="searchTitleDate"
                helpText={translate('SearchTitleDateHelpText')}
                helpTextWarning={`${translate('Default')}: ${translate(
                  'Disabled'
                )}`}
                onChange={handleInputChange}
                {...settings.searchTitleDate}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('SearchStudioCode')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="searchStudioCode"
                helpText={translate('SearchStudioCodeHelpText')}
                helpTextWarning={`${translate('Default')}: ${translate(
                  'Disabled'
                )}`}
                onChange={handleInputChange}
                {...settings.searchStudioCode}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('SearchStudioDate')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="searchStudioDate"
                helpText={translate('SearchStudioDateHelpText')}
                helpTextWarning={`${translate('Default')}: ${translate(
                  'Enabled'
                )}`}
                onChange={handleInputChange}
                {...settings.searchStudioDate}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('SearchStudioTitle')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="searchStudioTitle"
                helpText={translate('SearchStudioTitleHelpText')}
                helpTextWarning={`${translate('Default')}: ${translate(
                  'Disabled'
                )}`}
                onChange={handleInputChange}
                {...settings.searchStudioTitle}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('SearchDateFormat')}</FormLabel>

              <FormInputGroup
                type={inputTypes.SELECT}
                name="searchDateFormat"
                values={searchDateFormatOptions}
                helpText={translate('SearchDateFormatHelpText')}
                helpTextWarning={`${translate('Default')}: YYMMDD`}
                onChange={handleInputChange}
                {...settings.searchDateFormat}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('SearchStudioFormat')}</FormLabel>

              <FormInputGroup
                type={inputTypes.SELECT}
                name="searchStudioFormat"
                values={searchStudioFormatOptions}
                helpText={translate('SearchStudioFormatHelpText')}
                helpTextWarning={`${translate('Default')}: ${translate(
                  'Clean'
                )}`}
                onChange={handleInputChange}
                {...settings.searchStudioFormat}
              />
            </FormGroup>
          </Form>
        </FieldSet>
      ) : null}
    </div>
  );
}

export default IndexerOptions;
