import React from 'react';
import Modal from 'Components/Modal/Modal';
import { SelectedSchema } from 'Settings/useProviderSchema';
import AddImportListModalContent from './AddImportListModalContent';

interface AddImportListModalProps {
  isOpen: boolean;
  onImportListSelect: (selectedSchema: SelectedSchema) => void;
  onModalClose: () => void;
}

function AddImportListModal({
  isOpen,
  onImportListSelect,
  onModalClose,
}: Readonly<AddImportListModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddImportListModalContent
        onImportListSelect={onImportListSelect}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default AddImportListModal;
