import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import Performer from 'Performer/Performer';
import DeletePerformerModalContent from './DeletePerformerModalContent';

export interface DeletePerformerModalProps {
  isOpen: boolean;
  performer: Performer;
  onModalClose: () => void;
}

function DeletePerformerModal({
  isOpen,
  performer,
  onModalClose,
}: Readonly<DeletePerformerModalProps>) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeletePerformerModalContent
        performer={performer}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default DeletePerformerModal;
