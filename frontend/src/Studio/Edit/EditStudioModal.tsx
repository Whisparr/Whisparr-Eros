import React, { useCallback } from 'react';
import Modal from 'Components/Modal/Modal';
import EditStudioModalContent, {
  EditStudioModalContentProps,
} from './EditStudioModalContent';

interface EditStudioModalProps extends EditStudioModalContentProps {
  isOpen: boolean;
}

function EditStudioModal({
  isOpen,
  onModalClose,
  ...otherProps
}: Readonly<EditStudioModalProps>) {
  const handleModalClose = useCallback(() => {
    onModalClose();
  }, [onModalClose]);

  return (
    <Modal isOpen={isOpen} onModalClose={handleModalClose}>
      <EditStudioModalContent {...otherProps} onModalClose={handleModalClose} />
    </Modal>
  );
}

export default EditStudioModal;
