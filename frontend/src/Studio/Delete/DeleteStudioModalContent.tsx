import React, { useCallback, useState } from 'react';
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
import styles from './DeleteStudioModal.css';

interface DeleteStudioModalContentProps {
  title: string;
  deleteOptions: { addImportExclusion: boolean };
  onDeleteOptionChange: (option: { name: string; value: boolean }) => void;
  onDeletePress: (deleteFiles: boolean, addImportExclusion: boolean) => void;
  onModalClose: () => void;
}

function DeleteStudioModalContent({
  title,
  deleteOptions,
  onModalClose,
  onDeleteOptionChange,
  onDeletePress,
}: DeleteStudioModalContentProps) {
  const [deleteFiles, setDeleteFiles] = useState(false);

  const onDeleteFilesChange = useCallback(({ value }: { value: boolean }) => {
    setDeleteFiles(value);
  }, []);

  const onDeleteStudioConfirmed = useCallback(() => {
    const addImportExclusion = deleteOptions.addImportExclusion;
    setDeleteFiles(false);
    onDeletePress(deleteFiles, addImportExclusion);
  }, [deleteFiles, deleteOptions.addImportExclusion, onDeletePress]);

  const addImportExclusion = deleteOptions.addImportExclusion;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('DeleteHeader', { title })}</ModalHeader>

      <ModalBody>
        <FormGroup>
          <InfoLabel name="" size={sizes.LARGE} className={styles.warningText}>
            {translate('DeleteStudioModalWarning', { title })}
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
            onChange={onDeleteOptionChange}
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
            onChange={onDeleteFilesChange}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>
        <Button kind={kinds.DANGER} onPress={onDeleteStudioConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteStudioModalContent;
