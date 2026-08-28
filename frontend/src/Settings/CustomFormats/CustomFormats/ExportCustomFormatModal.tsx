import React from 'react';
import Modal from 'Components/Modal/Modal';
import CustomFormat from 'typings/CustomFormat';
import ExportCustomFormatModalContent from './ExportCustomFormatModalContent';

interface ExportCustomFormatModalProps {
  isOpen: boolean;
  customFormat: CustomFormat;
  onModalClose: () => void;
}

export default function ExportCustomFormatModal({
  isOpen,
  customFormat,
  onModalClose,
}: Readonly<ExportCustomFormatModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <ExportCustomFormatModalContent
        customFormat={customFormat}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}
