import React, { useCallback, useState } from 'react';
import {
  setCollectionDeleteOption,
  useCollectionDeleteOption,
} from 'Collection/collectionDeleteOptionsStore';
import { useDeleteMovieCollection } from 'Collection/useMovieCollections';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds } from 'Helpers/Props';
import { CheckInputChanged, InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';

export interface DeleteCollectionModalContentProps {
  collectionIds: number[];
  onModalClose: () => void;
}

function DeleteCollectionModalContent({
  collectionIds,
  onModalClose,
}: DeleteCollectionModalContentProps) {
  const addImportExclusion = useCollectionDeleteOption('addImportExclusion');

  const [deleteFiles, setDeleteFiles] = useState(false);

  const deleteCollection = useDeleteMovieCollection();

  const handleDeleteFilesChange = useCallback(
    ({ value }: InputChanged<boolean>) => {
      setDeleteFiles(value);
    },
    []
  );

  const handleDeleteOptionChange = useCallback(
    ({ name, value }: CheckInputChanged) => {
      setCollectionDeleteOption({ [name]: value });
    },
    []
  );

  const handleDeleteConfirmed = useCallback(() => {
    collectionIds.forEach((id) => {
      deleteCollection.mutate({ id, deleteFiles, addImportExclusion });
    });

    onModalClose();
  }, [
    collectionIds,
    addImportExclusion,
    deleteFiles,
    deleteCollection,
    onModalClose,
  ]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('DeleteCollectionsModalHeader')}</ModalHeader>

      <ModalBody>
        <FormGroup>
          <FormLabel>{translate('AddListExclusion')}</FormLabel>

          <FormInputGroup
            type={inputTypes.CHECK}
            name="addImportExclusion"
            value={addImportExclusion}
            helpText={translate('AddListExclusionMovieHelpText')}
            kind={kinds.DANGER}
            onChange={handleDeleteOptionChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{translate('DeleteFiles')}</FormLabel>

          <FormInputGroup
            type={inputTypes.CHECK}
            name="deleteFiles"
            value={deleteFiles}
            helpText={translate('DeleteMovieFilesHelpText')}
            kind={kinds.DANGER}
            onChange={handleDeleteFilesChange}
          />
        </FormGroup>
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>

        <Button kind={kinds.DANGER} onPress={handleDeleteConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteCollectionModalContent;
