import React from 'react';
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
import Performer from 'Performer/Performer';
import translate from 'Utilities/String/translate';
import { useDeletePerformerModalContent } from './useDeletePerformerModalContent';
import styles from './DeletePerformerModal.css';

export interface DeletePerformerModalContentProps {
  performer: Performer;
  onModalClose: (deleted: boolean) => void;
}

function DeletePerformerModalContent({
  performer,
  onModalClose,
}: DeletePerformerModalContentProps) {
  const [deleteFiles, setDeleteFiles] = React.useState(false);
  const { fullName, deleteOptions, onDeleteOptionChange, onDeletePress } =
    useDeletePerformerModalContent({ performer, onModalClose });

  const addImportExclusion = deleteOptions?.addImportExclusion ?? false;

  function handleDeleteFilesChange({ value }: { value: boolean }) {
    setDeleteFiles(value);
  }

  // Ensure the handler matches the () => void signature expected by ModalContent
  const handleModalClose = () => {
    onModalClose(false);
  };

  function handleDeletePerformerConfirmed() {
    onDeletePress(deleteFiles, addImportExclusion);
    setDeleteFiles(false);
  }

  return (
    // eslint-disable-next-line react/jsx-no-bind
    <ModalContent onModalClose={handleModalClose}>
      <ModalHeader>{translate('DeleteHeader', { name: fullName })}</ModalHeader>

      <ModalBody>
        <FormGroup>
          <InfoLabel size={sizes.LARGE} className={styles.warningText} name="">
            {translate('DeletePerformerModalWarning', { name: fullName })}
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
            onChange={onDeleteOptionChange}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>
            {translate('DeleteFiles', { name: translate('All') })}
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
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <Button onPress={handleModalClose}>{translate('Close')}</Button>
        <Button kind={kinds.DANGER} onPress={handleDeletePerformerConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeletePerformerModalContent;
