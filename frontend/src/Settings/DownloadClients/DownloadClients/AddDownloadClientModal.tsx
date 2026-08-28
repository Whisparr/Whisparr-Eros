import React from 'react';
import Modal from 'Components/Modal/Modal';
import { SelectedSchema } from 'Settings/useProviderSchema';
import AddDownloadClientModalContent from './AddDownloadClientModalContent';

interface AddDownloadClientModalProps {
  isOpen: boolean;
  onDownloadClientSelect: (selectedSchema: SelectedSchema) => void;
  onModalClose: () => void;
}

function AddDownloadClientModal({
  isOpen,
  onDownloadClientSelect,
  onModalClose,
}: Readonly<AddDownloadClientModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddDownloadClientModalContent
        onDownloadClientSelect={onDownloadClientSelect}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default AddDownloadClientModal;
