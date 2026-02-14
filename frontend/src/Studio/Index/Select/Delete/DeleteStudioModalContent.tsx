import React, { useState } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import InfoLabel from 'Components/InfoLabel';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import { useDeleteStudioModalContent } from './useDeleteStudioModalContent';
import styles from './DeleteStudioModal.css';

interface DeleteStudioModalContentProps {
  studioIds: number[];
  onModalClose: (deleted?: boolean) => void;
}

function DeleteStudioModalContent({
  studioIds,
  onModalClose,
}: DeleteStudioModalContentProps) {
  const [deleteFiles, setDeleteFiles] = useState(false);
  const { deleteOptions, onDeleteOptionChange, onDeletePress } =
    useDeleteStudioModalContent(studioIds, onModalClose);

  const addImportExclusion = deleteOptions?.addImportExclusion ?? false;

  function handleDeleteOptionChange({ value }: { value: boolean }) {
    onDeleteOptionChange({ name: 'addImportExclusion', value });
  }

  function handleDeleteFilesChange({ value }: { value: boolean }) {
    setDeleteFiles(value);
  }

  function handleDeleteStudioConfirmed() {
    onDeletePress(deleteFiles, addImportExclusion);
    setDeleteFiles(false);
  }

  function handleModalClose() {
    onModalClose(false);
  }

  return (
    <ModalContent onModalClose={handleModalClose}>
      <ModalHeader>{translate('DeleteStudiosModalHeader')}</ModalHeader>
      <ModalBody>
        <FormGroup>
          <InfoLabel name="" size={sizes.LARGE} className={styles.warningText}>
            {translate('DeleteStudiosModalWarning')}
          </InfoLabel>
        </FormGroup>
        <FormGroup>
          <FormLabel>{translate('AddImportListExclusion')}</FormLabel>
          <FormInputGroup
            type={inputTypes.CHECK}
            name="addImportExclusion"
            value={addImportExclusion}
            helpText={translate('AddImportExclusionHelpText')}
            kind={kinds.DANGER}
            onChange={handleDeleteOptionChange}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>
            {translate('DeleteFiles', { all: translate('All') })}
          </FormLabel>
          <FormInputGroup
            type={inputTypes.CHECK}
            name="deleteFiles"
            value={deleteFiles}
            helpText={translate('DeleteFilesHelpText')}
            kind={kinds.DANGER}
            onChange={handleDeleteFilesChange}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button onPress={handleModalClose}>{translate('Close')}</Button>
        <Button kind={kinds.DANGER} onPress={handleDeleteStudioConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteStudioModalContent;
