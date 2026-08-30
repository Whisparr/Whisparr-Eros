import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import Studio from 'Studio/Studio';
import DeleteStudioModalContent from './DeleteStudioModalContent';

export interface DeleteStudioModalProps {
  isOpen: boolean;
  studio: Studio;
  onModalClose: () => void;
}

function DeleteStudioModal({
  isOpen,
  studio,
  onModalClose,
}: Readonly<DeleteStudioModalProps>) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeleteStudioModalContent studio={studio} onModalClose={onModalClose} />
    </Modal>
  );
}

export default DeleteStudioModal;
