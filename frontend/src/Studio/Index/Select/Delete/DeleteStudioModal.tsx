import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import DeleteStudioModalContent from './DeleteStudioModalContent';

interface DeleteStudioModalProps {
  studioIds: number[];
  isOpen: boolean;
  onModalClose: () => void;
}

function DeleteStudioModal({
  isOpen,
  onModalClose,
  studioIds,
}: DeleteStudioModalProps) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeleteStudioModalContent
        studioIds={studioIds}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default DeleteStudioModal;
