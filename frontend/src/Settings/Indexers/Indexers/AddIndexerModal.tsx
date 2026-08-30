import React from 'react';
import Modal from 'Components/Modal/Modal';
import { SelectedSchema } from 'Settings/useProviderSchema';
import AddIndexerModalContent from './AddIndexerModalContent';

interface AddIndexerModalProps {
  isOpen: boolean;
  onIndexerSelect: (selectedSchema: SelectedSchema) => void;
  onModalClose: () => void;
}

function AddIndexerModal({
  isOpen,
  onIndexerSelect,
  onModalClose,
}: Readonly<AddIndexerModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddIndexerModalContent
        onIndexerSelect={onIndexerSelect}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default AddIndexerModal;
