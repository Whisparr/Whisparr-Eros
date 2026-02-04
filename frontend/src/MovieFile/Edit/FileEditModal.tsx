import React from 'react';
import Modal from 'Components/Modal/Modal';
import FileEditModalContentConnector from './FileEditModalContentConnector';

export interface FileEditModalProps {
  isOpen: boolean;
  onModalClose: (saved?: boolean) => void;
  movieFileId: number;
  [key: string]: unknown;
}

function FileEditModal({
  isOpen,
  onModalClose,
  movieFileId,
  ...otherProps
}: FileEditModalProps) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <FileEditModalContentConnector
        movieFileId={movieFileId}
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default FileEditModal;
