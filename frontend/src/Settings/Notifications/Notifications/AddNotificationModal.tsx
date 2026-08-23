import React from 'react';
import Modal from 'Components/Modal/Modal';
import { SelectedSchema } from 'Settings/useProviderSchema';
import AddNotificationModalContent from './AddNotificationModalContent';

interface AddNotificationModalProps {
  isOpen: boolean;
  onNotificationSelect: (selectedSchema: SelectedSchema) => void;
  onModalClose: () => void;
}

function AddNotificationModal({
  isOpen,
  onNotificationSelect,
  onModalClose,
}: Readonly<AddNotificationModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddNotificationModalContent
        onNotificationSelect={onNotificationSelect}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default AddNotificationModal;
