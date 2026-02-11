import React from 'react';
import Modal from 'Components/Modal/Modal';
import { Image } from 'Movie/Movie';
import AddNewPerformerModalContent from './AddNewPerformerModalContent';

interface AddNewPerformerModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  foreignId: string;
  fullName: string;
  images: Image[];
}

function AddNewPerformerModal({
  isOpen,
  onModalClose,
  foreignId,
  fullName,
  images,
}: AddNewPerformerModalProps) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddNewPerformerModalContent
        foreignId={foreignId}
        fullName={fullName}
        images={images}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default AddNewPerformerModal;
