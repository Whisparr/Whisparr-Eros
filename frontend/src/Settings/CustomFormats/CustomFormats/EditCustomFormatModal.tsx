import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import EditCustomFormatModalContent, {
  EditCustomFormatModalContentProps,
} from './EditCustomFormatModalContent';

interface EditCustomFormatModalProps extends EditCustomFormatModalContentProps {
  isOpen: boolean;
  onModalClose: () => void;
}

export default function EditCustomFormatModal({
  isOpen,
  onModalClose,
  ...otherProps
}: Readonly<EditCustomFormatModalProps>) {
  return (
    <Modal isOpen={isOpen} size={sizes.LARGE} onModalClose={onModalClose}>
      <EditCustomFormatModalContent
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}
