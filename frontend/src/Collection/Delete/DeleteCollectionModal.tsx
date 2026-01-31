import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import DeleteCollectionModalContent, {
  DeleteCollectionModalContentProps,
} from './DeleteCollectionModalContent';

interface DeleteCollectionModalProps extends DeleteCollectionModalContentProps {
  isOpen: boolean;
}

function DeleteCollectionModal({
  isOpen,
  onModalClose,
  ...otherProps
}: DeleteCollectionModalProps) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeleteCollectionModalContent
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default DeleteCollectionModal;
