import React, { useCallback, useEffect } from 'react';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import ProviderFieldFormGroup from 'Components/Form/ProviderFieldFormGroup';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { inputTypes } from 'Helpers/Props';
import { useShowAdvancedSettings } from 'Settings/advancedSettingsStore';
import { useManageMetadata } from 'Settings/Metadata/useMetadata';
import { EnhancedSelectInputChanged, InputChanged } from 'typings/inputs';
import Metadata from 'typings/Metadata';
import translate from 'Utilities/String/translate';

interface EditMetadataModalContentProps {
  id: number;
  onModalClose: () => void;
}

function EditMetadataModalContent({
  id,
  onModalClose,
}: Readonly<EditMetadataModalContentProps>) {
  const showAdvancedSettings = useShowAdvancedSettings();

  const {
    item,
    isSaving,
    saveError,
    validationErrors,
    validationWarnings,
    updateValue,
    updateFieldValue,
    saveProvider,
  } = useManageMetadata(id);

  const wasSaving = usePrevious(isSaving);

  const { name, enable, fields } = item;

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateValue(name as keyof Metadata, value as Metadata[keyof Metadata]);
    },
    [updateValue]
  );

  const handleFieldChange = useCallback(
    ({ name, value }: EnhancedSelectInputChanged<unknown>) => {
      updateFieldValue(name, value);
    },
    [updateFieldValue]
  );

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
        {translate('EditMetadata', { metadataType: name.value })}
      </ModalHeader>

      <ModalBody>
        <Form
          validationErrors={validationErrors}
          validationWarnings={validationWarnings}
        >
          <FormGroup>
            <FormLabel>{translate('Enable')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="enable"
              helpText={translate('EnableMetadataHelpText')}
              {...enable}
              onChange={handleInputChange}
            />
          </FormGroup>

          {fields?.map((field) => {
            return (
              <ProviderFieldFormGroup
                key={field.name}
                {...field}
                advancedSettings={showAdvancedSettings}
                provider="metadata"
                isDisabled={!enable.value}
                onChange={handleFieldChange}
              />
            );
          })}
        </Form>
      </ModalBody>

      <ModalFooter>
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

export default EditMetadataModalContent;
