import React from 'react';
import Modal from 'Components/Modal/Modal';
import { Image } from 'Movie/Movie';
import Performer from 'Performer/Performer';
import AddNewPerformerModalContent from './AddNewPerformerModalContent';

interface AddNewPerformerModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  performer: Performer;
  foreignId: string;
  fullName: string;
  images: Image[];
}

function AddNewPerformerModal({
  isOpen,
  onModalClose,
  performer,
  foreignId,
  fullName,
  images,
}: AddNewPerformerModalProps) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddNewPerformerModalContent
        performer={performer}
        foreignId={foreignId}
        fullName={fullName}
        images={images}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default AddNewPerformerModal;
