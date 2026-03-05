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
import styles from './DeleteMovieModal.css';

export interface DeleteMovieModalContentProps {
  movieIds: number[];
  onModalClose: () => void;
  onDeletePress: (deleteFiles: boolean, addImportExclusion: boolean) => void;
}

export function DeleteMovieModalContent({
  onModalClose,
  onDeletePress,
}: DeleteMovieModalContentProps) {
  const [deleteFiles, setDeleteFiles] = useState(false);
  const [addImportExclusion, setAddImportExclusion] = useState(false);

  function handleDeleteFilesChange({ value }: { value: boolean }) {
    setDeleteFiles(value);
  }

  function handleDeleteOptionChange({ value }: { value: boolean }) {
    setAddImportExclusion(value);
  }

  function handleDeleteMovieConfirmed() {
    onDeletePress(deleteFiles, addImportExclusion);
  }

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('DeleteMoviesModalHeader')}</ModalHeader>
      <ModalBody>
        <FormGroup>
          <InfoLabel size={sizes.LARGE} className={styles.warningText} name="">
            {translate('DeleteMoviesModalWarning')}
          </InfoLabel>
        </FormGroup>
        <FormGroup>
          <FormLabel>{translate('AddListExclusion')}</FormLabel>
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
            {translate('DeleteFilesLabel', { name: translate('All') })}
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
        <Button onPress={onModalClose}>{translate('Close')}</Button>
        <Button kind={kinds.DANGER} onPress={handleDeleteMovieConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteMovieModalContent;
