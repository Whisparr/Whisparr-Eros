import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import DeleteSceneModalContent from './DeleteSceneModalContent';
import { useDeleteSceneModal } from './useDeleteSceneModal';

export interface DeleteSceneModalProps {
  isOpen: boolean;
  sceneIds: number[];
  onDeletePress: (deleteFiles: boolean, addImportExclusion: boolean) => void;
  onModalClose: () => void;
  [key: string]: string | unknown;
}

export function DeleteSceneModal({
  isOpen,
  onModalClose,
  sceneIds,
  onDeletePress,
  ...otherProps
}: DeleteSceneModalProps) {
  const { onModalClose: enhancedOnModalClose } =
    useDeleteSceneModal(onModalClose);
  return (
    <Modal
      isOpen={isOpen}
      size={sizes.MEDIUM}
      onModalClose={enhancedOnModalClose}
    >
      <DeleteSceneModalContent
        {...otherProps}
        sceneIds={sceneIds}
        onDeletePress={onDeletePress}
        onModalClose={enhancedOnModalClose}
      />
    </Modal>
  );
}
