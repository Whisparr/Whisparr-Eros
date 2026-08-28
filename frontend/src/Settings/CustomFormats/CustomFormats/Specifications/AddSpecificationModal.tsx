import React from 'react';
import Modal from 'Components/Modal/Modal';
import { CustomFormatSpecification } from 'typings/CustomFormat';
import AddSpecificationModalContent from './AddSpecificationModalContent';

interface AddSpecificationModalProps {
  isOpen: boolean;
  onModalClose: (selectedSpecification?: CustomFormatSpecification) => void;
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
