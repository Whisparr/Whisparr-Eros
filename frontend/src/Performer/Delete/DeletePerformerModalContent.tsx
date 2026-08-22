import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  setPerformerDeleteOption,
  usePerformerDeleteOptions,
} from 'Performer/performerDeleteOptionsStore';
import translate from 'Utilities/String/translate';
import { useDeletePerformerMutation } from './useDeletePerformerMutation';
import styles from './DeletePerformerModal.css';

export interface DeletePerformerModalContentProps {
  performer: Performer;
  onModalClose: () => void;
}

function DeletePerformerModalContent({
  performer,
  onModalClose,
}: Readonly<DeletePerformerModalContentProps>) {
  const { fullName } = performer;

  const { addImportExclusion } = usePerformerDeleteOptions();
  const { mutate: deletePerformer } = useDeletePerformerMutation();
  const navigate = useNavigate();

  const [deleteFiles, setDeleteFiles] = useState(false);

  const handleDeleteOptionChange = useCallback(
    ({ value }: { value: boolean }) => {
      setPerformerDeleteOption('addImportExclusion', value);
    },
    []
  );

  const handleDeleteFilesChange = useCallback(
    ({ value }: { value: boolean }) => {
      setDeleteFiles(value);
    },
    []
  );

  // This modal is only opened from performer details, and that route is gone
  // once the performer is, so it navigates away -- as the thunk it replaces did.
  const handleDeletePerformerConfirmed = useCallback(() => {
    deletePerformer({ id: performer.id, deleteFiles, addImportExclusion });
    setDeleteFiles(false);
    onModalClose();
    navigate('/performers');
  }, [
    performer.id,
    deleteFiles,
    addImportExclusion,
    deletePerformer,
    onModalClose,
    navigate,
  ]);

  return (
    <ModalContent onModalClose={onModalClose}>
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
            onChange={handleDeleteOptionChange}
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
        <Button onPress={onModalClose}>{translate('Close')}</Button>

        <Button kind={kinds.DANGER} onPress={handleDeletePerformerConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeletePerformerModalContent;
