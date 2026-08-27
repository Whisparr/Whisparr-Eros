import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import EditMetadataModalContent from './EditMetadataModalContent';

interface EditMetadataModalProps {
  id: number;
  isOpen: boolean;
  onModalClose: () => void;
}

function EditMetadataModal({
  id,
  isOpen,
  onModalClose,
}: Readonly<EditMetadataModalProps>) {
  // `Modal` renders nothing while closed, so the content -- and with it the
  // pending changes and pending fields stores -- unmounts on cancel. That is
  // what the connector's `clearPendingChanges` dispatch used to do.
  return (
    <Modal size={sizes.MEDIUM} isOpen={isOpen} onModalClose={onModalClose}>
      <EditMetadataModalContent id={id} onModalClose={onModalClose} />
    </Modal>
  );
}

export default EditMetadataModal;
