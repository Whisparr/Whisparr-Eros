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
import {
  setStudioDeleteOption,
  useStudioDeleteOptions,
} from 'Studio/studioDeleteOptionsStore';
import translate from 'Utilities/String/translate';
import styles from './DeleteStudioModal.css';

interface DeleteStudioModalContentProps {
  onDeletePress: (deleteFiles: boolean, addImportExclusion: boolean) => void;
  onModalClose: () => void;
}

function DeleteStudioModalContent({
  onDeletePress,
  onModalClose,
}: Readonly<DeleteStudioModalContentProps>) {
  const [deleteFiles, setDeleteFiles] = useState(false);

  // The exclusion preference is the same store the per-studio modal uses -- it
  // was one `studios.deleteOptions` blob before either converted.
  const { addImportExclusion } = useStudioDeleteOptions();

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

  const handleDeleteStudioConfirmed = useCallback(() => {
    setDeleteFiles(false);
    onDeletePress(deleteFiles, addImportExclusion);
  }, [deleteFiles, addImportExclusion, onDeletePress]);

  return (
    <ModalContent onModalClose={onModalClose}>
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
        <Button onPress={onModalClose}>{translate('Close')}</Button>
        <Button kind={kinds.DANGER} onPress={handleDeleteStudioConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteStudioModalContent;
