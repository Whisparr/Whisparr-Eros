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
import Indexer from 'typings/Indexer';
import { EnhancedSelectInputChanged, InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import { useManageIndexer } from './useIndexers';
import styles from './EditIndexerModalContent.css';

interface EditIndexerModalContentProps {
  id: number;
  selectedSchema?: SelectedSchema;
  cloneId?: number;
  onDeleteIndexerPress?: () => void;
  onModalClose: () => void;
}

function EditIndexerModalContent({
  id,
  selectedSchema,
  cloneId,
  onDeleteIndexerPress,
  onModalClose,
}: Readonly<EditIndexerModalContentProps>) {
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
  } = useManageIndexer(id, selectedSchema, cloneId);

  const wasSaving = usePrevious(isSaving);

  const {
    implementationName = '',
    name,
    enableRss,
    enableAutomaticSearch,
    enableInteractiveSearch,
    supportsRss,
    supportsSearch,
    tags,
    fields,
    priority,
    protocol,
    downloadClientId,
  } = item;

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateValue(name as keyof Indexer, value as Indexer[keyof Indexer]);
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

  const handleSavePress = useCallback(() => {
    saveProvider();
  }, [saveProvider]);

  const handleTestPress = useCallback(() => {
    testProvider();
  }, [testProvider]);

  useEffect(() => {
    if (wasSaving && !isSaving && !saveError) {
      onModalClose();
    }
  }, [wasSaving, isSaving, saveError, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {id
          ? translate('EditIndexerImplementation', { implementationName })
          : translate('AddIndexerImplementation', { implementationName })}
      </ModalHeader>

      <ModalBody>
        {isFetching ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>{translate('AddIndexerError')}</Alert>
        ) : null}

        {!isFetching && !error ? (
          <Form
            validationErrors={validationErrors}
            validationWarnings={validationWarnings}
          >
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
              <FormLabel>{translate('EnableRss')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="enableRss"
                helpText={
                  supportsRss.value ? translate('EnableRssHelpText') : undefined
                }
                helpTextWarning={
                  supportsRss.value
                    ? undefined
                    : translate('RssIsNotSupportedWithThisIndexer')
                }
                isDisabled={!supportsRss.value}
                {...enableRss}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('EnableAutomaticSearch')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="enableAutomaticSearch"
                helpText={
                  supportsSearch.value
                    ? translate('EnableAutomaticSearchHelpText')
                    : undefined
                }
                helpTextWarning={
                  supportsSearch.value
                    ? undefined
                    : translate('SearchIsNotSupportedWithThisIndexer')
                }
                isDisabled={!supportsSearch.value}
                {...enableAutomaticSearch}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('EnableInteractiveSearch')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="enableInteractiveSearch"
                helpText={
                  supportsSearch.value
                    ? translate('EnableInteractiveSearchHelpText')
                    : undefined
                }
                helpTextWarning={
                  supportsSearch.value
                    ? undefined
                    : translate('SearchIsNotSupportedWithThisIndexer')
                }
                isDisabled={!supportsSearch.value}
                {...enableInteractiveSearch}
                onChange={handleInputChange}
              />
            </FormGroup>

            {fields?.map((field) => {
              return (
                <ProviderFieldFormGroup
                  key={field.name}
                  advancedSettings={showAdvancedSettings}
                  provider="indexer"
                  providerData={item}
                  {...field}
                  onChange={handleFieldChange}
                />
              );
            })}

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('IndexerPriority')}</FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="priority"
                helpText={translate('IndexerPriorityHelpText')}
                min={1}
                max={50}
                {...priority}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup
              advancedSettings={showAdvancedSettings}
              isAdvanced={true}
            >
              <FormLabel>{translate('DownloadClient')}</FormLabel>

              <FormInputGroup
                type={inputTypes.DOWNLOAD_CLIENT_SELECT}
                name="downloadClientId"
                helpText={translate('IndexerDownloadClientHelpText')}
                {...downloadClientId}
                includeAny={true}
                protocol={protocol.value}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('Tags')}</FormLabel>

              <FormInputGroup
                type={inputTypes.TAG}
                name="tags"
                helpText={translate('IndexerTagMovieHelpText')}
                {...tags}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Form>
        ) : null}
      </ModalBody>

      <ModalFooter>
        {id ? (
          <Button
            className={styles.deleteButton}
            kind={kinds.DANGER}
            onPress={onDeleteIndexerPress}
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

export default EditIndexerModalContent;
