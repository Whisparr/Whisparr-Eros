import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import { SelectedSchema } from 'Settings/useProviderSchema';
import EditNotificationModalContent from './EditNotificationModalContent';

interface EditNotificationModalProps {
  id: number;
  isOpen: boolean;
  selectedSchema?: SelectedSchema;
  onDeleteNotificationPress?: () => void;
  onModalClose: () => void;
}

function EditNotificationModal({
  id,
  isOpen,
  selectedSchema,
  onDeleteNotificationPress,
  onModalClose,
}: Readonly<EditNotificationModalProps>) {
  // `Modal` renders nothing while closed, so the content -- and with it the
  // pending changes and pending fields stores -- unmounts on cancel. That is
  // what the connector's `clearPendingChanges` dispatch used to do.
  return (
    <Modal size={sizes.MEDIUM} isOpen={isOpen} onModalClose={onModalClose}>
      <EditNotificationModalContent
        id={id}
        selectedSchema={selectedSchema}
        onDeleteNotificationPress={onDeleteNotificationPress}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditNotificationModal;
