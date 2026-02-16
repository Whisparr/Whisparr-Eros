import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import Studio from 'Studio/Studio';
import DeleteStudioModalContent from './DeleteStudioModalContent';
import useDeleteStudioModal from './useDeleteStudioModal';

export interface DeleteStudioModalProps {
  isOpen: boolean;
  studio: Studio;
  onModalClose: () => void;
  [key: string]: unknown;
}

function DeleteStudioModal({
  isOpen,
  studio,
  onModalClose,
  ...otherProps
}: DeleteStudioModalProps) {
  const { deleteOptions, onDeleteOptionChange, onDeletePress } =
    useDeleteStudioModal(studio);

  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeleteStudioModalContent
        title={studio.title}
        deleteOptions={deleteOptions}
        onDeleteOptionChange={onDeleteOptionChange}
        onDeletePress={onDeletePress}
        onModalClose={onModalClose}
        {...otherProps}
      />
    </Modal>
  );
}

export default DeleteStudioModal;
