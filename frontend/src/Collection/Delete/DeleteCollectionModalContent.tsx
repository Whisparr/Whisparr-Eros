import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds } from 'Helpers/Props';
import {
  deleteCollection,
  setDeleteOption,
} from 'Store/Actions/movieCollectionActions';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';

export interface DeleteCollectionModalContentProps {
  collectionIds: number[];
  onModalClose: () => void;
}

const selectDeleteOptions = createSelector(
  (state: AppState) => state.movieCollections.deleteOptions,
  (deleteOptions) => deleteOptions
);

function DeleteCollectionModalContent({
  collectionIds,
  onModalClose,
}: DeleteCollectionModalContentProps) {
  const dispatch = useDispatch();
  const { addImportExclusion } = useSelector(selectDeleteOptions);

  const [deleteFiles, setDeleteFiles] = useState(false);

  const onDeleteFilesChange = useCallback(
    ({ value }: InputChanged<boolean>) => {
      setDeleteFiles(value);
    },
    [setDeleteFiles]
  );

  const onDeleteOptionChange = useCallback(
    ({ name, value }: { name: string; value: boolean }) => {
      dispatch(
        setDeleteOption({
          [name]: value,
        })
      );
    },
    [dispatch]
  );

  const handleDeleteCollectionConfirmed = useCallback(() => {
    collectionIds.forEach((id) => {
      dispatch(
        deleteCollection({
          id,
          deleteFiles,
          addImportExclusion,
        })
      );
    });

    onModalClose();
  }, [collectionIds, addImportExclusion, deleteFiles, dispatch, onModalClose]);

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
            onChange={onDeleteOptionChange}
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
            onChange={onDeleteFilesChange}
          />
        </FormGroup>
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>

        <Button kind={kinds.DANGER} onPress={handleDeleteCollectionConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteCollectionModalContent;
