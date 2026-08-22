import React from 'react';
import Modal from 'Components/Modal/Modal';
import Performer from 'Performer/Performer';
import AddNewPerformerModalContent from './AddNewPerformerModalContent';

interface AddNewPerformerModalProps {
  isOpen: boolean;
  performer: Performer;
  onModalClose: () => void;
}

function AddNewPerformerModal({
  isOpen,
  performer,
  onModalClose,
}: Readonly<AddNewPerformerModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddNewPerformerModalContent
        performer={performer}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default AddNewPerformerModal;
