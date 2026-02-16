import React from 'react';
import Modal from 'Components/Modal/Modal';
import { Image } from 'Studio/Studio';
import AddNewStudioModalContent from './AddNewStudioModalContent';

interface AddNewStudioModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  foreignId: string;
  title: string;
  images: Image[];
}

function AddNewStudioModal(props: AddNewStudioModalProps) {
  const { isOpen, onModalClose, ...otherProps } = props;

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddNewStudioModalContent {...otherProps} onModalClose={onModalClose} />
    </Modal>
  );
}

export default AddNewStudioModal;
