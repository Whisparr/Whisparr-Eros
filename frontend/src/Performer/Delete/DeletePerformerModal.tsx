import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import Performer from 'Performer/Performer';
import DeletePerformerModalContent from './DeletePerformerModalContent';

export interface DeletePerformerModalProps {
  isOpen: boolean;
  performer: Performer;
  onModalClose: (deleted: boolean) => void;
  [key: string]: string | unknown;
}

function DeletePerformerModal({
  isOpen,
  performer,
  onModalClose,
  ...otherProps
}: DeletePerformerModalProps) {
  // Adapt the signature for Modal
  const handleModalClose = () => {
    onModalClose(false);
  };
  return (
    // eslint-disable-next-line react/jsx-no-bind
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={handleModalClose}>
      <DeletePerformerModalContent
        performer={performer}
        onModalClose={onModalClose}
        {...otherProps}
      />
    </Modal>
  );
}

export default DeletePerformerModal;
