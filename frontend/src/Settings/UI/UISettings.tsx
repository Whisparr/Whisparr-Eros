import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { EnhancedSelectInputValue } from 'Components/Form/Select/EnhancedSelectInput';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { inputTypes, kinds } from 'Helpers/Props';
import { useFilteredLanguages } from 'Language/useLanguages';
import SettingsToolbar from 'Settings/SettingsToolbar';
import themes from 'Styles/Themes';
import { InputChanged } from 'typings/inputs';
import UiSettings from 'typings/Settings/UiSettings';
import timeZoneOptions from 'Utilities/Date/timeZoneOptions';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import { useManageUiSettings } from './useUiSettings';

// Neither of these is a UI language: `Any` and `Unknown` are matching
// placeholders and `Original` means "whatever the file says".
const NON_UI_LANGUAGES = ['Any', 'Unknown', 'Original'];

// The examples are rendered through moment so they follow the UI language's
// month and day names rather than being hardcoded English.
const createDateFormatOption = (format: string) => ({
  key: format,
  get value() {
    return moment('2014-03-25').format(format);
  },
  hint: format,
});

export const firstDayOfWeekOptions: EnhancedSelectInputValue<number>[] = [
  {
    key: 0,
    get value() {
      return translate('Sunday');
    },
  },
  {
    key: 1,
    get value() {
      return translate('Monday');
    },
  },
];

export const weekColumnOptions: EnhancedSelectInputValue<string>[] = [
  createDateFormatOption('ddd M/D'),
  createDateFormatOption('ddd MM/DD'),
  createDateFormatOption('ddd D/M'),
  createDateFormatOption('ddd DD/MM'),
];

const shortDateFormatOptions: EnhancedSelectInputValue<string>[] = [
  createDateFormatOption('MMM D YYYY'),
  createDateFormatOption('DD MMM YYYY'),
  createDateFormatOption('MM/D/YYYY'),
  createDateFormatOption('MM/DD/YYYY'),
  createDateFormatOption('DD/MM/YYYY'),
  createDateFormatOption('YYYY-MM-DD'),
];

const longDateFormatOptions: EnhancedSelectInputValue<string>[] = [
  createDateFormatOption('dddd, MMMM D YYYY'),
  createDateFormatOption('dddd, D MMMM YYYY'),
];

export const timeFormatOptions: EnhancedSelectInputValue<string>[] = [
  { key: 'h(:mm)a', value: '5pm/5:30pm' },
  { key: 'HH:mm', value: '17:00/17:30' },
];

export const movieRuntimeFormatOptions: EnhancedSelectInputValue<string>[] = [
  { key: 'hoursMinutes', value: '1h 15m' },
  { key: 'minutes', value: '75 mins' },
];

function UISettings() {
  const {
    isFetching,
    isFetched,
    error,
    hasPendingChanges,
    hasSettings,
    settings,
    isSaving,
    validationErrors,
    validationWarnings,
    saveSettings,
    updateSetting,
  } = useManageUiSettings();

  const { data: languageItems } = useFilteredLanguages(NON_UI_LANGUAGES);

  const [isClearingLocalData, setIsClearingLocalData] = useState(false);

  const languages = useMemo(() => {
    return languageItems.map((language) => ({
      key: language.id,
      value: language.name,
    }));
  }, [languageItems]);

  const themeOptions = useMemo(() => {
    return Object.keys(themes).map((theme) => ({
      key: theme,
      value: titleCase(theme),
    }));
  }, []);

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateSetting(
        name as keyof UiSettings,
        value as UiSettings[keyof UiSettings]
      );
    },
    [updateSetting]
  );

  const handleSavePress = useCallback(() => {
    saveSettings();
  }, [saveSettings]);

  const handleClearLocalStoragePress = useCallback(() => {
    setIsClearingLocalData(true);

    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      setIsClearingLocalData(false);
    }
  }, []);

  return (
    <PageContent title={translate('UiSettings')}>
      <SettingsToolbar
        hasPendingChanges={hasPendingChanges}
        isSaving={isSaving}
        onSavePress={handleSavePress}
      />

      <PageContentBody>
        {isFetching && !isFetched ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>{translate('UiSettingsLoadError')}</Alert>
        ) : null}

        {hasSettings && isFetched && !error ? (
          <Form
            id="uiSettings"
            validationErrors={validationErrors}
            validationWarnings={validationWarnings}
          >
            <FieldSet legend={translate('Calendar')}>
              <FormGroup>
                <FormLabel>{translate('FirstDayOfWeek')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="firstDayOfWeek"
                  values={firstDayOfWeekOptions}
                  onChange={handleInputChange}
                  {...settings.firstDayOfWeek}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('WeekColumnHeader')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="calendarWeekColumnHeader"
                  values={weekColumnOptions}
                  helpText={translate('WeekColumnHeaderHelpText')}
                  onChange={handleInputChange}
                  {...settings.calendarWeekColumnHeader}
                />
              </FormGroup>
            </FieldSet>

            <FieldSet legend={translate('Movies')}>
              <FormGroup>
                <FormLabel>{translate('RuntimeFormat')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="movieRuntimeFormat"
                  values={movieRuntimeFormatOptions}
                  onChange={handleInputChange}
                  {...settings.movieRuntimeFormat}
                />
              </FormGroup>
            </FieldSet>

            <FieldSet legend={translate('Dates')}>
              <FormGroup>
                <FormLabel>{translate('ShortDateFormat')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="shortDateFormat"
                  values={shortDateFormatOptions}
                  onChange={handleInputChange}
                  {...settings.shortDateFormat}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('LongDateFormat')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="longDateFormat"
                  values={longDateFormatOptions}
                  onChange={handleInputChange}
                  {...settings.longDateFormat}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('TimeFormat')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="timeFormat"
                  values={timeFormatOptions}
                  onChange={handleInputChange}
                  {...settings.timeFormat}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('TimeZone')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="timeZone"
                  values={timeZoneOptions}
                  onChange={handleInputChange}
                  {...settings.timeZone}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('ShowRelativeDates')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="showRelativeDates"
                  helpText={translate('ShowRelativeDatesHelpText')}
                  onChange={handleInputChange}
                  {...settings.showRelativeDates}
                />
              </FormGroup>
            </FieldSet>

            <FieldSet legend={translate('Style')}>
              <FormGroup>
                <FormLabel>{translate('Theme')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.SELECT}
                  name="theme"
                  helpText={translate('ThemeHelpText')}
                  values={themeOptions}
                  onChange={handleInputChange}
                  {...settings.theme}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('EnableColorImpairedMode')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="enableColorImpairedMode"
                  helpText={translate('EnableColorImpairedModeHelpText')}
                  onChange={handleInputChange}
                  {...settings.enableColorImpairedMode}
                />
              </FormGroup>
            </FieldSet>

            <FieldSet legend={translate('Language')}>
              <FormGroup>
                <FormLabel>{translate('UiLanguage')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.LANGUAGE_SELECT}
                  name="uiLanguage"
                  values={languages}
                  helpText={translate('UiLanguageHelpText')}
                  helpTextWarning={translate('BrowserReloadRequired')}
                  onChange={handleInputChange}
                  {...settings.uiLanguage}
                  errors={
                    languages.some(
                      (language) => language.key === settings.uiLanguage.value
                    )
                      ? settings.uiLanguage.errors
                      : [
                          ...settings.uiLanguage.errors,
                          { message: translate('InvalidUILanguage') },
                        ]
                  }
                />
              </FormGroup>
            </FieldSet>

            <FieldSet legend={translate('Browser')}>
              <FormGroup>
                <FormLabel>{translate('ClearLocalData')}</FormLabel>

                <SpinnerButton
                  kind={kinds.DANGER}
                  isSpinning={isClearingLocalData}
                  title={translate('ClearLocalDataHelpText')}
                  onPress={handleClearLocalStoragePress}
                >
                  {translate('Clear')}
                </SpinnerButton>
              </FormGroup>
            </FieldSet>
          </Form>
        ) : null}
      </PageContentBody>
    </PageContent>
  );
}

export default UISettings;
