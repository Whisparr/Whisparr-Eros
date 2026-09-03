import React from 'react';
import Modal from 'Components/Modal/Modal';
import Performer from 'Performer/Performer';
import EditPerformerModalContent from './EditPerformerModalContent';

interface EditPerformerModalProps {
  isOpen: boolean;
  performer: Performer;
  onModalClose: () => void;
}

function EditPerformerModal({
  isOpen,
  performer,
  onModalClose,
}: Readonly<EditPerformerModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <EditPerformerModalContent
        performer={performer}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditPerformerModal;
