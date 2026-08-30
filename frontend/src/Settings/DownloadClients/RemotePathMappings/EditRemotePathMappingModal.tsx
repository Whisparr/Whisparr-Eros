import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import EditRemotePathMappingModalContent from './EditRemotePathMappingModalContent';

interface EditRemotePathMappingModalProps {
  id?: number;
  isOpen: boolean;
  onModalClose: () => void;
  onDeleteRemotePathMappingPress?: () => void;
}

function EditRemotePathMappingModal({
  isOpen,
  onModalClose,
  ...otherProps
}: Readonly<EditRemotePathMappingModalProps>) {
  return (
    <Modal size={sizes.MEDIUM} isOpen={isOpen} onModalClose={onModalClose}>
      <EditRemotePathMappingModalContent
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditRemotePathMappingModal;
