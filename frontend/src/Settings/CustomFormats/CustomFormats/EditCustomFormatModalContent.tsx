import React, { useCallback, useEffect, useState } from 'react';
import Alert from 'Components/Alert';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { icons, inputTypes, kinds } from 'Helpers/Props';
import CustomFormat, { CustomFormatSpecification } from 'typings/CustomFormat';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import ImportCustomFormatModal from './ImportCustomFormatModal';
import { ImportedCustomFormat } from './ImportCustomFormatModalContent';
import AddSpecificationModal from './Specifications/AddSpecificationModal';
import EditSpecificationModal from './Specifications/EditSpecificationModal';
import Specification from './Specifications/Specification';
import { useManageCustomFormat } from './useCustomFormats';
import styles from './EditCustomFormatModalContent.css';

export interface EditCustomFormatModalContentProps {
  id?: number;
  cloneId?: number;
  onModalClose: () => void;
  onDeleteCustomFormatPress?: () => void;
}

export default function EditCustomFormatModalContent({
  id,
  cloneId,
  onModalClose,
  onDeleteCustomFormatPress,
}: Readonly<EditCustomFormatModalContentProps>) {
  const {
    item,
    validationErrors,
    validationWarnings,
    updateValue,
    saveCustomFormat,
    isSaving,
    saveError,
    specifications,
    setSpecifications,
    saveSpecification,
    deleteSpecification,
    cloneSpecification,
  } = useManageCustomFormat(id, cloneId);

  const [isAddSpecificationModalOpen, setIsAddSpecificationModalOpen] =
    useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newSpecification, setNewSpecification] =
    useState<CustomFormatSpecification | null>(null);

  const handleAddSpecificationPress = useCallback(() => {
    setIsAddSpecificationModalOpen(true);
  }, []);

  // Picking a condition off the schema does not add it. It opens the edit modal
  // on a copy with `id: 0`, and only Save there puts it in the list -- which is
  // what `selectedSchema` plus `saveCustomFormatSpecification` did, minus the
  // slice the schema had to be parked in between the two modals.
  const handleAddSpecificationModalClose = useCallback(
    (selectedSpecification?: CustomFormatSpecification) => {
      setIsAddSpecificationModalOpen(false);

      if (selectedSpecification) {
        setNewSpecification({ ...selectedSpecification, id: 0 });
      }
    },
    []
  );

  const handleNewSpecificationModalClose = useCallback(() => {
    setNewSpecification(null);
  }, []);

  const handleImportPress = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  const handleImportModalClose = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  // An import replaces the form rather than adding to it, which is what the
  // connector's `clearPending` -- clear the format's pending changes, clear the
  // condition's, then delete every condition -- amounted to.
  const handleImport = useCallback(
    ({ specifications: imported, ...values }: ImportedCustomFormat) => {
      Object.entries(values).forEach(([key, value]) => {
        updateValue(
          key as keyof CustomFormat,
          value as CustomFormat[keyof CustomFormat]
        );
      });

      setSpecifications(imported);
    },
    [updateValue, setSpecifications]
  );

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateValue(
        name as keyof CustomFormat,
        value as CustomFormat[keyof CustomFormat]
      );
    },
    [updateValue]
  );

  const handleSavePress = useCallback(() => {
    saveCustomFormat();
  }, [saveCustomFormat]);

  const wasSaving = usePrevious(isSaving);

  useEffect(() => {
    if (wasSaving && !isSaving && !saveError) {
      onModalClose();
    }
  }, [isSaving, wasSaving, saveError, onModalClose]);

  const { name, includeCustomFormatWhenRenaming } = item;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {id ? translate('EditCustomFormat') : translate('AddCustomFormat')}
      </ModalHeader>

      <ModalBody>
        <div>
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
              <FormLabel>
                {translate('IncludeCustomFormatWhenRenaming')}
              </FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="includeCustomFormatWhenRenaming"
                helpText={translate('IncludeCustomFormatWhenRenamingHelpText')}
                {...includeCustomFormatWhenRenaming}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Form>

          <FieldSet legend={translate('Conditions')}>
            <Alert kind={kinds.INFO}>
              <div>{translate('CustomFormatsSettingsTriggerInfo')}</div>
            </Alert>

            <div className={styles.customFormats}>
              {specifications.map((specification) => {
                return (
                  <Specification
                    key={specification.id}
                    specification={specification}
                    onSaveSpecification={saveSpecification}
                    onCloneSpecificationPress={cloneSpecification}
                    onConfirmDeleteSpecification={deleteSpecification}
                  />
                );
              })}

              <Card
                className={styles.addSpecification}
                onPress={handleAddSpecificationPress}
              >
                <div className={styles.center}>
                  <Icon name={icons.ADD} size={45} />
                </div>
              </Card>
            </div>
          </FieldSet>

          <AddSpecificationModal
            isOpen={isAddSpecificationModalOpen}
            onModalClose={handleAddSpecificationModalClose}
          />

          <EditSpecificationModal
            isOpen={newSpecification !== null}
            specification={newSpecification}
            onSave={saveSpecification}
            onModalClose={handleNewSpecificationModalClose}
          />

          <ImportCustomFormatModal
            isOpen={isImportModalOpen}
            onImport={handleImport}
            onModalClose={handleImportModalClose}
          />
        </div>
      </ModalBody>

      <ModalFooter>
        <div className={styles.rightButtons}>
          {id ? (
            <Button
              className={styles.deleteButton}
              kind={kinds.DANGER}
              onPress={onDeleteCustomFormatPress}
            >
              {translate('Delete')}
            </Button>
          ) : null}

          <Button className={styles.deleteButton} onPress={handleImportPress}>
            {translate('Import')}
          </Button>
        </div>

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
