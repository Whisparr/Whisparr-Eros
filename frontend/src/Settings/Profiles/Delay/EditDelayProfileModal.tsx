import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import EditDelayProfileModalContent from './EditDelayProfileModalContent';

interface EditDelayProfileModalProps {
  id?: number;
  isOpen: boolean;
  onModalClose: () => void;
  onDeleteDelayProfilePress?: () => void;
}

function EditDelayProfileModal({
  isOpen,
  onModalClose,
  ...otherProps
}: Readonly<EditDelayProfileModalProps>) {
  return (
    <Modal size={sizes.MEDIUM} isOpen={isOpen} onModalClose={onModalClose}>
      <EditDelayProfileModalContent
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditDelayProfileModal;
