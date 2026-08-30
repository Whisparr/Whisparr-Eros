import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import { SelectedSchema } from 'Settings/useProviderSchema';
import EditDownloadClientModalContent from './EditDownloadClientModalContent';

interface EditDownloadClientModalProps {
  id: number;
  isOpen: boolean;
  selectedSchema?: SelectedSchema;
  onDeleteDownloadClientPress?: () => void;
  onModalClose: () => void;
}

function EditDownloadClientModal({
  id,
  isOpen,
  selectedSchema,
  onDeleteDownloadClientPress,
  onModalClose,
}: Readonly<EditDownloadClientModalProps>) {
  // `Modal` renders nothing while closed, so the content -- and with it the
  // pending changes and pending fields stores -- unmounts on cancel, which is
  // what this modal's `clearPendingChanges` dispatch used to do. The
  // `cancelSaveDownloadClient` / `cancelTestDownloadClient` dispatches beside
  // it aborted the in-flight XHR so a late failure could not write `saveError`
  // into a section no longer on screen; that error state is per-instance now
  // and unmounts with the modal. Same trade as #521 and #538.
  return (
    <Modal size={sizes.MEDIUM} isOpen={isOpen} onModalClose={onModalClose}>
      <EditDownloadClientModalContent
        id={id}
        selectedSchema={selectedSchema}
        onDeleteDownloadClientPress={onDeleteDownloadClientPress}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditDownloadClientModal;
