import React from 'react';
import Modal from 'Components/Modal/Modal';
import Performer from 'Performer/Performer';
import EditPerformerModalContent from './EditPerformerModalContent';

interface EditPerformerModalProps {
  isOpen: boolean;
  performer: Performer;
  showMovieMonitor: boolean;
  onModalClose: () => void;
}

function EditPerformerModal({
  isOpen,
  performer,
  showMovieMonitor,
  onModalClose,
}: Readonly<EditPerformerModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <EditPerformerModalContent
        performer={performer}
        showMovieMonitor={showMovieMonitor}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditPerformerModal;
