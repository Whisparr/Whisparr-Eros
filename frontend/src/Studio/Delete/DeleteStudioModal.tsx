import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import DeleteStudioModalContentConnector from './DeleteStudioModalContentConnector';

export interface DeleteStudioModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  [key: string]: unknown;
}

function DeleteStudioModal({
  isOpen,
  onModalClose,
  ...otherProps
}: DeleteStudioModalProps) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeleteStudioModalContentConnector
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default DeleteStudioModal;
