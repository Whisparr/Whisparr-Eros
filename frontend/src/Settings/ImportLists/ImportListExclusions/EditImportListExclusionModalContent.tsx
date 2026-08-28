import React, { useCallback, useEffect } from 'react';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { inputTypes, kinds } from 'Helpers/Props';
import ImportListExclusion from 'typings/ImportListExclusion';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import { useManageImportListExclusion } from './useImportListExclusions';
import styles from './EditImportListExclusionModalContent.css';

const typeOptions = [
  { key: 'movie', value: translate('Movie') },
  { key: 'scene', value: translate('Scene') },
  { key: 'studio', value: translate('Studio') },
  { key: 'performer', value: translate('Performer') },
  { key: 'tag', value: translate('Tag') },
];

interface EditImportListExclusionModalContentProps {
  importListExclusion?: ImportListExclusion;
  onModalClose: () => void;
  onDeleteImportListExclusionPress?: () => void;
}

function EditImportListExclusionModalContent({
  importListExclusion,
  onModalClose,
  onDeleteImportListExclusionPress,
}: Readonly<EditImportListExclusionModalContentProps>) {
  const {
    item,
    isSaving,
    saveError,
    validationErrors,
    validationWarnings,
    updateValue,
    save,
  } = useManageImportListExclusion(importListExclusion);

  const { movieTitle, foreignId, type } = item;

  const wasSaving = usePrevious(isSaving);

  useEffect(() => {
    if (wasSaving && !isSaving && !saveError) {
      onModalClose();
    }
  }, [wasSaving, isSaving, saveError, onModalClose]);

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateValue(
        name as keyof ImportListExclusion,
        value as ImportListExclusion[keyof ImportListExclusion]
      );
    },
    [updateValue]
  );

  const handleSavePress = useCallback(() => {
    save();
  }, [save]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {importListExclusion
          ? translate('EditImportListExclusion')
          : translate('AddImportListExclusion')}
      </ModalHeader>

      <ModalBody className={styles.body}>
        <Form
          validationErrors={validationErrors}
          validationWarnings={validationWarnings}
        >
          <FormGroup>
            <FormLabel>{translate('ForeignId')}</FormLabel>

            <FormInputGroup
              type={inputTypes.TEXT}
              name="foreignId"
              helpText={translate('ForiegnIdHelpText')}
              {...foreignId}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('Title')}</FormLabel>

            <FormInputGroup
              type={inputTypes.TEXT}
              name="movieTitle"
              helpText={translate('MovieTitleToExcludeHelpText')}
              {...movieTitle}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('ExclusionType')}</FormLabel>

            <FormInputGroup
              type={inputTypes.SELECT}
              name="type"
              {...type}
              values={typeOptions}
              helpText={translate('ExclusionTypeHelpText')}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        {importListExclusion ? (
          <Button
            className={styles.deleteButton}
            kind={kinds.DANGER}
            onPress={onDeleteImportListExclusionPress}
          >
            {translate('Delete')}
          </Button>
        ) : null}

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

export default EditImportListExclusionModalContent;
