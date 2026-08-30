import React from 'react';
import Modal from 'Components/Modal/Modal';
import { AutoTaggingSpecification } from 'typings/AutoTagging';
import AddSpecificationModalContent from './AddSpecificationModalContent';

interface AddSpecificationModalProps {
  isOpen: boolean;
  onModalClose: (selectedSpecification?: AutoTaggingSpecification) => void;
}

export default function AddSpecificationModal({
  isOpen,
  onModalClose,
}: Readonly<AddSpecificationModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddSpecificationModalContent onModalClose={onModalClose} />
    </Modal>
  );
}
