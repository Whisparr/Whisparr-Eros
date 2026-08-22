import React from 'react';
import Modal from 'Components/Modal/Modal';
import CollectionOverviewOptionsModalContent from './CollectionOverviewOptionsModalContent';

interface CollectionOverviewOptionsModalProps {
  isOpen: boolean;
  onModalClose: () => void;
}

function CollectionOverviewOptionsModal({
  isOpen,
  onModalClose,
}: CollectionOverviewOptionsModalProps) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <CollectionOverviewOptionsModalContent onModalClose={onModalClose} />
    </Modal>
  );
}

export default CollectionOverviewOptionsModal;
