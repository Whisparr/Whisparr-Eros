import React from 'react';
import Modal from 'Components/Modal/Modal';
import PerformerPosterOptionsModalContent from './PerformerPosterOptionsModalContent';

interface PerformerPosterOptionsModalProps {
  isOpen: boolean;
  size: string;
  onSizeChange(size: string): void;
  onModalClose(...args: unknown[]): unknown;
}

function PerformerPosterOptionsModal({
  isOpen,
  size,
  onSizeChange,
  onModalClose,
}: PerformerPosterOptionsModalProps) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <PerformerPosterOptionsModalContent
        size={size}
        onSizeChange={onSizeChange}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default PerformerPosterOptionsModal;
