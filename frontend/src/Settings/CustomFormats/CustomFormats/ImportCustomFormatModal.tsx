import React from 'react';
import Modal from 'Components/Modal/Modal';
import ImportCustomFormatModalContent, {
  ImportedCustomFormat,
} from './ImportCustomFormatModalContent';

interface ImportCustomFormatModalProps {
  isOpen: boolean;
  onImport: (customFormat: ImportedCustomFormat) => void;
  onModalClose: () => void;
}

export default function ImportCustomFormatModal({
  isOpen,
  onImport,
  onModalClose,
}: Readonly<ImportCustomFormatModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <ImportCustomFormatModalContent
        onImport={onImport}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}
