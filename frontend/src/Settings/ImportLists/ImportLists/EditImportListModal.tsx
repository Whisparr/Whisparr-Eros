import React from 'react';
import Modal from 'Components/Modal/Modal';
import { SelectedSchema } from 'Settings/useProviderSchema';
import EditImportListModalContent from './EditImportListModalContent';

interface EditImportListModalProps {
  id: number;
  isOpen: boolean;
  selectedSchema?: SelectedSchema;
  cloneId?: number;
  onDeleteImportListPress?: () => void;
  onModalClose: () => void;
}

function EditImportListModal({
  id,
  isOpen,
  selectedSchema,
  cloneId,
  onDeleteImportListPress,
  onModalClose,
}: Readonly<EditImportListModalProps>) {
  // `Modal` renders nothing while closed, so the content -- and with it the
  // pending changes and pending fields stores -- unmounts on cancel. That is
  // what this modal's `clearPendingChanges` dispatch used to do.
  //
  // The `cancelSaveImportList` / `cancelTestImportList` dispatches beside it
  // aborted the in-flight XHR so a late failure could not write `saveError`
  // into a section that was no longer on screen. That error state is
  // per-instance now and unmounts with the modal, so there is nothing left for
  // a late failure to write to; the request itself is no longer aborted, the
  // same trade #521 and #538 made.
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <EditImportListModalContent
        id={id}
        selectedSchema={selectedSchema}
        cloneId={cloneId}
        onDeleteImportListPress={onDeleteImportListPress}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditImportListModal;
