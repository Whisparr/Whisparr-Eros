import React from 'react';
import Modal from 'Components/Modal/Modal';
import EditStudioModalContentConnector from './EditStudioModalContentConnector';

interface EditStudioModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  studioId?: number;
  // Accepts any additional props for the content connector
  [key: string]: unknown;
}

function EditStudioModal({
  isOpen,
  onModalClose,
  ...otherProps
}: EditStudioModalProps) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <EditStudioModalContentConnector
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditStudioModal;
