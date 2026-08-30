import React, { useCallback, useEffect, useState } from 'react';
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
import AutoTaggingModel, {
  AutoTaggingSpecification,
} from 'typings/AutoTagging';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import AddSpecificationModal from './Specifications/AddSpecificationModal';
import EditSpecificationModal from './Specifications/EditSpecificationModal';
import Specification from './Specifications/Specification';
import { useManageAutoTagging } from './useAutoTaggings';
import styles from './EditAutoTaggingModalContent.css';

export interface EditAutoTaggingModalContentProps {
  id?: number;
  cloneId?: number;
  onModalClose: () => void;
  onDeleteAutoTaggingPress?: () => void;
}

export default function EditAutoTaggingModalContent({
  id,
  cloneId,
  onModalClose,
  onDeleteAutoTaggingPress,
}: Readonly<EditAutoTaggingModalContentProps>) {
  const {
    item,
    validationErrors,
    validationWarnings,
    updateValue,
    saveAutoTagging,
    isSaving,
    saveError,
    specifications,
    saveSpecification,
    deleteSpecification,
    cloneSpecification,
  } = useManageAutoTagging(id, cloneId);

  const [isAddSpecificationModalOpen, setIsAddSpecificationModalOpen] =
    useState(false);
  const [newSpecification, setNewSpecification] =
    useState<AutoTaggingSpecification | null>(null);

  const handleAddSpecificationPress = useCallback(() => {
    setIsAddSpecificationModalOpen(true);
  }, []);

  // Picking a condition off the schema does not add it. It opens the edit
  // modal on a copy with `id: 0`, and only Save there puts it in the list --
  // which is what `selectedSchema` plus `saveAutoTaggingSpecification` did,
  // minus the slice the schema had to be parked in between the two modals.
  const handleAddSpecificationModalClose = useCallback(
    (selectedSpecification?: AutoTaggingSpecification) => {
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

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateValue(
        name as keyof AutoTaggingModel,
        value as AutoTaggingModel[keyof AutoTaggingModel]
      );
    },
    [updateValue]
  );

  const handleSavePress = useCallback(() => {
    saveAutoTagging();
  }, [saveAutoTagging]);

  const wasSaving = usePrevious(isSaving);

  useEffect(() => {
    if (wasSaving && !isSaving && !saveError) {
      onModalClose();
    }
  }, [isSaving, wasSaving, saveError, onModalClose]);

  const { name, removeTagsAutomatically, tags } = item;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {id ? translate('EditAutoTag') : translate('AddAutoTag')}
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
              <FormLabel>{translate('RemoveTagsAutomatically')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="removeTagsAutomatically"
                helpText={translate('RemoveTagsAutomaticallyHelpText')}
                {...removeTagsAutomatically}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>{translate('Tags')}</FormLabel>

              <FormInputGroup
                type={inputTypes.TAG}
                name="tags"
                onChange={handleInputChange}
                {...tags}
              />
            </FormGroup>
          </Form>

          <FieldSet legend={translate('Conditions')}>
            <div className={styles.autoTaggings}>
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
        </div>
      </ModalBody>

      <ModalFooter>
        <div className={styles.rightButtons}>
          {id ? (
            <Button
              className={styles.deleteButton}
              kind={kinds.DANGER}
              onPress={onDeleteAutoTaggingPress}
            >
              {translate('Delete')}
            </Button>
          ) : null}
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
