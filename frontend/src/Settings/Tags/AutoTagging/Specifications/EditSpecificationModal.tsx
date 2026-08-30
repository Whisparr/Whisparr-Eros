import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import { AutoTaggingSpecification } from 'typings/AutoTagging';
import EditSpecificationModalContent from './EditSpecificationModalContent';

interface EditSpecificationModalProps {
  isOpen: boolean;
  specification: AutoTaggingSpecification | null;
  onSave: (specification: AutoTaggingSpecification) => void;
  onDeleteSpecificationPress?: () => void;
  onModalClose: () => void;
}

export default function EditSpecificationModal({
  isOpen,
  specification,
  onSave,
  onDeleteSpecificationPress,
  onModalClose,
}: Readonly<EditSpecificationModalProps>) {
  if (!specification) {
    return null;
  }

  return (
    <Modal size={sizes.MEDIUM} isOpen={isOpen} onModalClose={onModalClose}>
      <EditSpecificationModalContent
        specification={specification}
        onSave={onSave}
        onDeleteSpecificationPress={onDeleteSpecificationPress}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}
