import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import DeleteStudioModalContentConnector from './DeleteStudioModalContentConnector';

interface DeleteStudioModalProps {
  studioIds: number[];
  isOpen: boolean;
  onModalClose: () => void;
  [key: string]: unknown;
}

function DeleteStudioModal({
  isOpen,
  onModalClose,
  studioIds,
  ...otherProps
}: DeleteStudioModalProps) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeleteStudioModalContentConnector
        {...otherProps}
        studioIds={studioIds}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default DeleteStudioModal;
