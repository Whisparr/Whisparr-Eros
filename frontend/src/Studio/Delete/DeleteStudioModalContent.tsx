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
import Studio from 'Studio/Studio';
import {
  setStudioDeleteOption,
  useStudioDeleteOptions,
} from 'Studio/studioDeleteOptionsStore';
import translate from 'Utilities/String/translate';
import { useDeleteStudioMutation } from './useDeleteStudioMutation';
import styles from './DeleteStudioModal.css';

export interface DeleteStudioModalContentProps {
  studio: Studio;
  onModalClose: () => void;
}

function DeleteStudioModalContent({
  studio,
  onModalClose,
}: Readonly<DeleteStudioModalContentProps>) {
  const { title } = studio;

  const { addImportExclusion } = useStudioDeleteOptions();
  const { mutate: deleteStudio } = useDeleteStudioMutation();
  const navigate = useNavigate();

  const [deleteFiles, setDeleteFiles] = useState(false);

  const handleDeleteOptionChange = useCallback(
    ({ value }: { value: boolean }) => {
      setStudioDeleteOption('addImportExclusion', value);
    },
    []
  );

  const handleDeleteFilesChange = useCallback(
    ({ value }: { value: boolean }) => {
      setDeleteFiles(value);
    },
    []
  );

  // This modal is opened from the index poster and from studio details, and the
  // details route is gone once the studio is, so it navigates either way -- as
  // the thunk it replaces did.
  const handleDeleteStudioConfirmed = useCallback(() => {
    deleteStudio({ id: studio.id, deleteFiles, addImportExclusion });
    setDeleteFiles(false);
    navigate('/studios');
  }, [studio.id, deleteFiles, addImportExclusion, deleteStudio, navigate]);

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
        <Button onPress={onModalClose}>{translate('Close')}</Button>
        <Button kind={kinds.DANGER} onPress={handleDeleteStudioConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteStudioModalContent;
