import React from 'react';
import Modal from 'Components/Modal/Modal';
import RestoreBackupModalContent from './RestoreBackupModalContent';

interface RestoreBackupModalProps {
  isOpen: boolean;
  id?: number;
  name?: string;
  onModalClose: () => void;
}

function RestoreBackupModal({
  isOpen,
  onModalClose,
  ...otherProps
}: RestoreBackupModalProps) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <RestoreBackupModalContent {...otherProps} onModalClose={onModalClose} />
    </Modal>
  );
}

export default RestoreBackupModal;
