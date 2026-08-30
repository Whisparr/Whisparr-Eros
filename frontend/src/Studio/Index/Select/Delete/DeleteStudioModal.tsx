import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import DeleteStudioModalContent from './DeleteStudioModalContent';

export interface DeleteStudioModalProps {
  isOpen: boolean;
  onDeletePress: (deleteFiles: boolean, addImportExclusion: boolean) => void;
  onModalClose: () => void;
}

function DeleteStudioModal({
  isOpen,
  onDeletePress,
  onModalClose,
}: Readonly<DeleteStudioModalProps>) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeleteStudioModalContent
        onDeletePress={onDeletePress}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default DeleteStudioModal;
