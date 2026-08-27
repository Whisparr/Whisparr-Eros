import React, { useCallback, useEffect, useState } from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputButton from 'Components/Form/FormInputButton';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import useDebounce from 'Helpers/Hooks/useDebounce';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import useShowAdvancedSettings from 'Helpers/Hooks/useShowAdvancedSettings';
import { inputTypes, kinds, sizes } from 'Helpers/Props';
import { InputChanged } from 'typings/inputs';
import NamingConfig from 'typings/Settings/NamingConfig';
import {
  OnChildStateChange,
  SetChildSave,
} from 'typings/Settings/SettingsState';
import translate from 'Utilities/String/translate';
import NamingModal from './NamingModal';
import {
  useManageNamingSettings,
  useNamingExamples,
} from './useNamingSettings';
import styles from './Naming.css';

interface NamingModalOptions {
  name: keyof Pick<
    NamingConfig,
    | 'standardMovieFormat'
    | 'movieFolderFormat'
    | 'standardSceneFormat'
    | 'sceneFolderFormat'
    | 'sceneImportFolderFormat'
  >;
  movie?: boolean;
  scene?: boolean;
  additional?: boolean;
}

interface NamingProps {
  setChildSave: SetChildSave;
  onChildStateChange: OnChildStateChange;
}

function Naming({ setChildSave, onChildStateChange }: Readonly<NamingProps>) {
  const advancedSettings = useShowAdvancedSettings();

  const {
    settings,
    updateSetting,
    saveSettings,
    isFetching,
    isSaving,
    error,
    hasSettings,
    hasPendingChanges,
  } = useManageNamingSettings();

  // The redux version debounced by hand, restarting a one-second timer on
  // every keystroke before dispatching the examples fetch. The request is now
  // keyed on the settings themselves, so the debounce moves onto the value --
  // and typing back to a format that was already asked about is a cache hit
  // rather than a request.
  const debouncedSettings = useDebounce(settings, 300);
  const { examples } = useNamingExamples(debouncedSettings);
  const examplesPopulated = !!examples;

  const [isNamingModalOpen, setNamingModalOpen, setNamingModalClosed] =
    useModalOpenState(false);
  const [namingModalOptions, setNamingModalOptions] =
    useState<NamingModalOptions | null>(null);

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      const key = name as keyof NamingConfig;

      updateSetting(key, value as NamingConfig[typeof key]);
    },
    [updateSetting]
  );

  const onSceneNamingModalOpenClick = useCallback(() => {
    setNamingModalOpen();
    setNamingModalOptions({
      name: 'standardSceneFormat',
      scene: true,
      additional: true,
    });
  }, [setNamingModalOpen, setNamingModalOptions]);

  const onSceneFolderNamingModalOpenClick = useCallback(() => {
    setNamingModalOpen();
    setNamingModalOptions({
      name: 'sceneFolderFormat',
      scene: true,
    });
  }, [setNamingModalOpen, setNamingModalOptions]);

  const onStandardNamingModalOpenClick = useCallback(() => {
    setNamingModalOpen();

    setNamingModalOptions({
      name: 'standardMovieFormat',
      movie: true,
      additional: true,
    });
  }, [setNamingModalOpen, setNamingModalOptions]);

  const onMovieFolderNamingModalOpenClick = useCallback(() => {
    setNamingModalOpen();

    setNamingModalOptions({
      name: 'movieFolderFormat',
      movie: true,
    });
  }, [setNamingModalOpen, setNamingModalOptions]);

  useEffect(() => {
    setChildSave(saveSettings);
  }, [saveSettings, setChildSave]);

  useEffect(() => {
    onChildStateChange({ isSaving, hasPendingChanges });
  }, [hasPendingChanges, isSaving, onChildStateChange]);

  const renameScenes = hasSettings && settings.renameScenes.value;
  const renameMovies = hasSettings && settings.renameMovies.value;
  const replaceIllegalCharacters =
    hasSettings && settings.replaceIllegalCharacters.value;

  const colonReplacementOptions = [
    { key: 'delete', value: translate('Delete') },
    { key: 'dash', value: translate('ReplaceWithDash') },
    { key: 'spaceDash', value: translate('ReplaceWithSpaceDash') },
    { key: 'spaceDashSpace', value: translate('ReplaceWithSpaceDashSpace') },
    {
      key: 'smart',
      value: translate('SmartReplace'),
      hint: translate('SmartReplaceHint'),
    },
  ];

  const standardMovieFormatHelpTexts = [];
  const standardMovieFormatErrors = [];
  const movieFolderFormatHelpTexts = [];
  const movieFolderFormatErrors = [];
  const maxFolderPathLengthHelpTexts = [];
  const maxFilePathLengthHelpTexts = [];
  const standardSceneFormatHelpTexts: string[] = [];
  const standardSceneFormatErrors: { message: string }[] = [];
  const sceneFolderFormatHelpTexts: string[] = [];
  const sceneFolderFormatErrors: { message: string }[] = [];
  const sceneImportFolderFormatHelpTexts: string[] = [];
  const sceneImportFolderFormatErrors: { message: string }[] = [];

  if (examplesPopulated) {
    if (examples.sceneExample) {
      standardSceneFormatHelpTexts.push(`Example: ${examples.sceneExample}`);
    } else {
      standardSceneFormatErrors.push({ message: translate('InvalidFormat') });
    }

    if (examples.sceneFolderExample) {
      sceneFolderFormatHelpTexts.push(
        `Example: ${examples.sceneFolderExample}`
      );
    } else {
      sceneFolderFormatErrors.push({ message: translate('InvalidFormat') });
    }

    if (examples.sceneImportFolderExample) {
      sceneImportFolderFormatHelpTexts.push(
        `Example: ${examples.sceneImportFolderExample}`
      );
    } else {
      sceneImportFolderFormatErrors.push({
        message: translate('InvalidFormat'),
      });
    }
  }

  if (examplesPopulated) {
    if (examples.movieExample) {
      standardMovieFormatHelpTexts.push(
        `${translate('Movie')}: ${examples.movieExample}`
      );
    } else {
      standardMovieFormatErrors.push({
        message: translate('MovieInvalidFormat'),
      });
    }

    if (examples.movieFolderExample) {
      movieFolderFormatHelpTexts.push(
        `${translate('Example')}: ${examples.movieFolderExample}`
      );
    } else {
      movieFolderFormatErrors.push({ message: translate('InvalidFormat') });
    }

    if (examples.maxFolderPathLengthExample) {
      maxFolderPathLengthHelpTexts.push(
        `${translate('Example')}: ${examples.maxFolderPathLengthExample}`
      );
    }

    if (examples.maxFilePathLengthExample) {
      maxFilePathLengthHelpTexts.push(
        `${translate('Example')}: ${examples.maxFilePathLengthExample}`
      );
    }
  }

  return (
    <FieldSet legend={translate('MovieNaming')}>
      {isFetching ? <LoadingIndicator /> : null}

      {!isFetching && error ? (
        <Alert kind={kinds.DANGER}>
          {translate('NamingSettingsLoadError')}
        </Alert>
      ) : null}

      {hasSettings && !isFetching && !error ? (
        <Form>
          <FormGroup size={sizes.MEDIUM}>
            <FormLabel>{translate('RenameMovies')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="renameMovies"
              helpText={translate('RenameMoviesHelpText')}
              onChange={handleInputChange}
              {...settings.renameMovies}
            />
          </FormGroup>

          <FormGroup size={sizes.MEDIUM}>
            <FormLabel>{translate('RenameScenes')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="renameScenes"
              helpText={translate('RenameScenesHelpText')}
              onChange={handleInputChange}
              {...settings.renameScenes}
            />
          </FormGroup>

          <FormGroup size={sizes.MEDIUM}>
            <FormLabel>{translate('ReplaceIllegalCharacters')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="replaceIllegalCharacters"
              helpText={translate('ReplaceIllegalCharactersHelpText')}
              onChange={handleInputChange}
              {...settings.replaceIllegalCharacters}
            />
          </FormGroup>

          {replaceIllegalCharacters ? (
            <FormGroup size={sizes.MEDIUM}>
              <FormLabel>{translate('ColonReplacement')}</FormLabel>

              <FormInputGroup
                type={inputTypes.SELECT}
                name="colonReplacementFormat"
                values={colonReplacementOptions}
                helpText={translate('ColonReplacementFormatHelpText')}
                onChange={handleInputChange}
                {...settings.colonReplacementFormat}
              />
            </FormGroup>
          ) : null}

          {renameMovies ? (
            <FormGroup size={sizes.LARGE}>
              <FormLabel>{translate('StandardMovieFormat')}</FormLabel>

              <FormInputGroup
                inputClassName={styles.namingInput}
                type={inputTypes.TEXT}
                name="standardMovieFormat"
                buttons={
                  <FormInputButton onPress={onStandardNamingModalOpenClick}>
                    ?
                  </FormInputButton>
                }
                onChange={handleInputChange}
                {...settings.standardMovieFormat}
                helpTexts={standardMovieFormatHelpTexts}
                errors={[
                  ...standardMovieFormatErrors,
                  ...settings.standardMovieFormat.errors,
                ]}
              />
            </FormGroup>
          ) : null}

          <FormGroup
            advancedSettings={advancedSettings}
            isAdvanced={true}
            size={sizes.LARGE}
          >
            <FormLabel>{translate('MovieFolderFormat')}</FormLabel>

            <FormInputGroup
              inputClassName={styles.namingInput}
              type={inputTypes.TEXT}
              name="movieFolderFormat"
              buttons={
                <FormInputButton onPress={onMovieFolderNamingModalOpenClick}>
                  ?
                </FormInputButton>
              }
              helpTextWarning={translate(
                'MovieFolderFormatHelpTextDeprecatedWarning'
              )}
              onChange={handleInputChange}
              {...settings.movieFolderFormat}
              helpTexts={[
                translate('MovieFolderFormatHelpText'),
                ...movieFolderFormatHelpTexts,
              ]}
              errors={[
                ...movieFolderFormatErrors,
                ...settings.movieFolderFormat.errors,
              ]}
            />
          </FormGroup>

          {renameScenes ? (
            <FormGroup size={sizes.LARGE}>
              <FormLabel>{translate('StandardSceneFormat')}</FormLabel>
              <FormInputGroup
                inputClassName={styles.namingInput}
                type={inputTypes.TEXT}
                name="standardSceneFormat"
                buttons={
                  <FormInputButton onPress={onSceneNamingModalOpenClick}>
                    ?
                  </FormInputButton>
                }
                onChange={handleInputChange}
                {...settings.standardSceneFormat}
                helpTexts={standardSceneFormatHelpTexts}
                errors={[
                  ...standardSceneFormatErrors,
                  ...settings.standardSceneFormat.errors,
                ]}
              />
            </FormGroup>
          ) : null}

          <FormGroup
            advancedSettings={advancedSettings}
            isAdvanced={true}
            size={sizes.LARGE}
          >
            <FormLabel>{translate('SceneFolderFormat')}</FormLabel>
            <FormInputGroup
              inputClassName={styles.namingInput}
              type={inputTypes.TEXT}
              name="sceneFolderFormat"
              buttons={
                <FormInputButton onPress={onSceneFolderNamingModalOpenClick}>
                  ?
                </FormInputButton>
              }
              helpTextWarning={translate(
                'SceneFolderFormatHelpTextDeprecatedWarning'
              )}
              onChange={handleInputChange}
              {...settings.sceneFolderFormat}
              helpTexts={sceneFolderFormatHelpTexts}
              errors={[
                ...sceneFolderFormatErrors,
                ...settings.sceneFolderFormat.errors,
              ]}
            />
          </FormGroup>

          <FormGroup
            advancedSettings={advancedSettings}
            isAdvanced={true}
            size={sizes.MEDIUM}
          >
            <FormLabel>{translate('SceneImportFolderFormat')}</FormLabel>
            <FormInputGroup
              inputClassName={styles.namingInput}
              type={inputTypes.TEXT}
              name="sceneImportFolderFormat"
              helpTextWarning={translate(
                'SceneImportFolderFormatHelpTextRelativePath'
              )}
              onChange={handleInputChange}
              {...settings.sceneImportFolderFormat}
              helpTexts={[
                translate('SceneImportFolderFormatHelpText'),
                ...sceneImportFolderFormatHelpTexts,
              ]}
              errors={[
                ...sceneImportFolderFormatErrors,
                ...settings.sceneImportFolderFormat.errors,
              ]}
            />
          </FormGroup>

          <FormGroup
            advancedSettings={advancedSettings}
            isAdvanced={true}
            size={sizes.MEDIUM}
          >
            <FormLabel>{translate('MaxFolderPathLength')}</FormLabel>
            <FormInputGroup
              inputClassName={styles.namingInput}
              type={inputTypes.NUMBER}
              name="maxFolderPathLength"
              onChange={handleInputChange}
              {...settings.maxFolderPathLength}
              helpTexts={[
                translate('MaxFolderPathLengthHelpText'),
                ...maxFolderPathLengthHelpTexts,
              ]}
            />
          </FormGroup>

          <FormGroup
            advancedSettings={advancedSettings}
            isAdvanced={true}
            size={sizes.MEDIUM}
          >
            <FormLabel>{translate('MaxFilePathLength')}</FormLabel>
            <FormInputGroup
              inputClassName={styles.namingInput}
              type={inputTypes.NUMBER}
              name="maxFilePathLength"
              onChange={handleInputChange}
              {...settings.maxFilePathLength}
              helpTexts={[
                translate('MaxFilePathLengthHelpText'),
                ...maxFilePathLengthHelpTexts,
              ]}
            />
          </FormGroup>

          {namingModalOptions ? (
            <NamingModal
              isOpen={isNamingModalOpen}
              {...namingModalOptions}
              value={settings[namingModalOptions.name].value}
              onInputChange={handleInputChange}
              onModalClose={setNamingModalClosed}
            />
          ) : null}
        </Form>
      ) : null}
    </FieldSet>
  );
}

export default Naming;
