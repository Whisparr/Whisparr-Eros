import React, { useCallback, useEffect } from 'react';
import Alert from 'Components/Alert';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import ProviderFieldFormGroup from 'Components/Form/ProviderFieldFormGroup';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import usePrevious from 'Helpers/Hooks/usePrevious';
import useShowAdvancedSettings from 'Helpers/Hooks/useShowAdvancedSettings';
import { inputTypes, kinds } from 'Helpers/Props';
import AdvancedSettingsButton from 'Settings/AdvancedSettingsButton';
import { SelectedSchema } from 'Settings/useProviderSchema';
import ImportList from 'typings/ImportList';
import { EnhancedSelectInputChanged, InputChanged } from 'typings/inputs';
import formatShortTimeSpan from 'Utilities/Date/formatShortTimeSpan';
import translate from 'Utilities/String/translate';
import { useManageImportList } from './useImportLists';
import styles from './EditImportListModalContent.css';

interface EditImportListModalContentProps {
  id: number;
  selectedSchema?: SelectedSchema;
  cloneId?: number;
  onDeleteImportListPress?: () => void;
  onModalClose: () => void;
}

function EditImportListModalContent({
  id,
  selectedSchema,
  cloneId,
  onDeleteImportListPress,
  onModalClose,
}: Readonly<EditImportListModalContentProps>) {
  const showAdvancedSettings = useShowAdvancedSettings();

  const {
    item,
    isFetching,
    error,
    isSaving,
    saveError,
    isTesting,
    validationErrors,
    validationWarnings,
    updateValue,
    updateFieldValue,
    updateFieldValues,
    saveProvider,
    testProvider,
  } = useManageImportList(id, selectedSchema, cloneId);

  const wasSaving = usePrevious(isSaving);

  const {
    implementationName,
    name,
    enabled,
    enableAuto,
    minRefreshInterval,
    monitor,
    rootFolderPath,
    qualityProfileId,
    searchOnAdd,
    tags,
    tagExisting,
    fields,
  } = item;

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateValue(
        name as keyof ImportList,
        value as ImportList[keyof ImportList]
      );
    },
    [updateValue]
  );

  // A field that answers with more than its own value goes up as a batch;
  // anything else is a single edit, which can be reverted back to the saved
  // value and dropped from the pending set.
  const handleFieldChange = useCallback(
    ({
      name,
      value,
      additionalProperties,
    }: EnhancedSelectInputChanged<unknown>) => {
      if (additionalProperties) {
        updateFieldValues({
          ...(additionalProperties as Record<string, unknown>),
          [name]: value,
        });

        return;
      }

      updateFieldValue(name, value);
    },
    [updateFieldValue, updateFieldValues]
  );

  const handleTestPress = useCallback(() => {
    testProvider();
  }, [testProvider]);

  const handleSavePress = useCallback(() => {
    saveProvider();
  }, [saveProvider]);

  useEffect(() => {
    if (wasSaving && !isSaving && !saveError) {
      onModalClose();
    }
  }, [isSaving, wasSaving, saveError, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {id
          ? translate('EditImportListImplementation', {
              implementationName: implementationName ?? '',
            })
          : translate('AddImportListImplementation', {
              implementationName: implementationName ?? '',
            })}
      </ModalHeader>

      <ModalBody>
        {isFetching ? <LoadingIndicator /> : null}

        {!isFetching && !!error ? (
          <Alert kind={kinds.DANGER}>{translate('AddListError')}</Alert>
        ) : null}

        {!isFetching && !error ? (
          <Form
            validationErrors={validationErrors}
            validationWarnings={validationWarnings}
          >
            <Alert kind={kinds.INFO} className={styles.message}>
              {translate('ListWillRefreshEveryInterval', {
                refreshInterval: formatShortTimeSpan(minRefreshInterval.value),
              })}
            </Alert>

            <FormGroup>
              <FormLabel>{translate('Name')}</FormLabel>

              <FormInputGroup
                type={inputTypes.TEXT}
                name="name"
                {...name}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('Enable')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="enabled"
                helpText={translate('ListEnabledHelpText')}
                {...enabled}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('EnableAutomaticAdd')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="enableAuto"
                helpText={translate('EnableAutomaticAddMovieHelpText')}
                {...enableAuto}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('Monitor')}</FormLabel>

              <FormInputGroup
                type={inputTypes.MONITOR_MOVIES_SELECT}
                name="monitor"
                helpText={translate('ListMonitorMovieHelpText')}
                {...monitor}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('SearchOnAdd')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="searchOnAdd"
                helpText={translate('ListSearchOnAddMovieHelpText')}
                {...searchOnAdd}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('QualityProfile')}</FormLabel>

              <FormInputGroup
                type={inputTypes.QUALITY_PROFILE_SELECT}
                name="qualityProfileId"
                helpText={translate('ListQualityProfileHelpText')}
                {...qualityProfileId}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('RootFolder')}</FormLabel>

              <FormInputGroup
                type={inputTypes.ROOT_FOLDER_SELECT}
                name="rootFolderPath"
                helpText={translate('ListRootFolderHelpText')}
                {...rootFolderPath}
                includeMissingValue={true}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('WhisparrTags')}</FormLabel>

              <FormInputGroup
                type={inputTypes.TAG}
                name="tags"
                helpText={translate('ListTagsHelpText')}
                {...tags}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('TagExisting')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="tagExisting"
                helpText={translate('TagExistingHelpText')}
                {...tagExisting}
                onChange={handleInputChange}
              />
            </FormGroup>

            {fields?.length ? (
              <div>
                {fields.map((field) => {
                  return (
                    <ProviderFieldFormGroup
                      key={field.name}
                      {...field}
                      advancedSettings={showAdvancedSettings}
                      provider="importList"
                      providerData={item}
                      onChange={handleFieldChange}
                    />
                  );
                })}
              </div>
            ) : null}
          </Form>
        ) : null}
      </ModalBody>
      <ModalFooter>
        {id ? (
          <Button
            className={styles.deleteButton}
            kind={kinds.DANGER}
            onPress={onDeleteImportListPress}
          >
            {translate('Delete')}
          </Button>
        ) : null}

        <AdvancedSettingsButton showLabel={false} />

        <SpinnerErrorButton
          isSpinning={isTesting}
          error={saveError}
          onPress={handleTestPress}
        >
          {translate('Test')}
        </SpinnerErrorButton>

        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <SpinnerErrorButton
          isSpinning={isSaving}
          error={saveError}
          onPress={handleSavePress}
        >
          {translate('Save')}
        </SpinnerErrorButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default EditImportListModalContent;
