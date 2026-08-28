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
import { inputTypes, kinds } from 'Helpers/Props';
import AdvancedSettingsButton from 'Settings/AdvancedSettingsButton';
import { useShowAdvancedSettings } from 'Settings/advancedSettingsStore';
import { useManageNotification } from 'Settings/Notifications/useNotifications';
import { SelectedSchema } from 'Settings/useProviderSchema';
import AppError from 'typings/AppError';
import { EnhancedSelectInputChanged, InputChanged } from 'typings/inputs';
import Notification from 'typings/Notification';
import translate from 'Utilities/String/translate';
import NotificationEventItems from './NotificationEventItems';
import styles from './EditNotificationModalContent.css';

interface EditNotificationModalContentProps {
  id: number;
  selectedSchema?: SelectedSchema;
  onDeleteNotificationPress?: () => void;
  onModalClose: () => void;
}

function EditNotificationModalContent({
  id,
  selectedSchema,
  onDeleteNotificationPress,
  onModalClose,
}: Readonly<EditNotificationModalContentProps>) {
  const showAdvancedSettings = useShowAdvancedSettings();

  const {
    item,
    isFetching,
    isFetched,
    error,
    isSaving,
    saveError,
    setSaveError,
    isTesting,
    validationErrors,
    validationWarnings,
    updateValue,
    updateFieldValue,
    updateFieldValues,
    saveProvider,
    testProvider,
  } = useManageNotification(id, selectedSchema);

  const wasSaving = usePrevious(isSaving);

  const { implementationName, name, tags, fields, message } = item;

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateValue(
        name as keyof Notification,
        value as Notification[keyof Notification]
      );
    },
    [updateValue]
  );

  // A field that answers with more than its own value -- an OAuth exchange
  // that returns a token and the account it belongs to -- goes up as a batch;
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

  const handleOAuthSaveError = useCallback(
    (oAuthError: AppError | null) => {
      setSaveError(oAuthError);
    },
    [setSaveError]
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
  }, [wasSaving, isSaving, saveError, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {id
          ? translate('EditConnectionImplementation', { implementationName })
          : translate('AddConnectionImplementation', { implementationName })}
      </ModalHeader>

      <ModalBody>
        {isFetching ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>{translate('AddNotificationError')}</Alert>
        ) : null}

        {isFetched && !error ? (
          <Form
            validationErrors={validationErrors}
            validationWarnings={validationWarnings}
          >
            {message ? (
              <Alert className={styles.message} kind={message.value.type}>
                {message.value.message}
              </Alert>
            ) : null}

            <FormGroup>
              <FormLabel>{translate('Name')}</FormLabel>

              <FormInputGroup
                type={inputTypes.TEXT}
                name="name"
                {...name}
                onChange={handleInputChange}
              />
            </FormGroup>

            <NotificationEventItems
              item={item}
              onInputChange={handleInputChange}
            />

            <FormGroup>
              <FormLabel>{translate('Tags')}</FormLabel>

              <FormInputGroup
                type={inputTypes.TAG}
                name="tags"
                helpText={translate('NotificationsTagsMovieHelpText')}
                {...tags}
                onChange={handleInputChange}
              />
            </FormGroup>

            {fields?.map((field) => {
              return (
                <ProviderFieldFormGroup
                  key={field.name}
                  {...field}
                  advancedSettings={showAdvancedSettings}
                  provider="notification"
                  providerData={item}
                  onSaveError={handleOAuthSaveError}
                  onChange={handleFieldChange}
                />
              );
            })}
          </Form>
        ) : null}
      </ModalBody>

      <ModalFooter>
        {id ? (
          <Button
            className={styles.deleteButton}
            kind={kinds.DANGER}
            onPress={onDeleteNotificationPress}
          >
            {translate('Delete')}
          </Button>
        ) : null}

        <AdvancedSettingsButton showLabel={false} />

        <SpinnerErrorButton
          isSpinning={isTesting}
          error={saveError ?? undefined}
          onPress={handleTestPress}
        >
          {translate('Test')}
        </SpinnerErrorButton>

        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <SpinnerErrorButton
          isSpinning={isSaving}
          error={saveError ?? undefined}
          onPress={handleSavePress}
        >
          {translate('Save')}
        </SpinnerErrorButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default EditNotificationModalContent;
