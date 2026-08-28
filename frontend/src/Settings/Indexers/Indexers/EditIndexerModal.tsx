import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import { SelectedSchema } from 'Settings/useProviderSchema';
import EditIndexerModalContent from './EditIndexerModalContent';

interface EditIndexerModalProps {
  id: number;
  isOpen: boolean;
  selectedSchema?: SelectedSchema;
  cloneId?: number;
  onDeleteIndexerPress?: () => void;
  onModalClose: () => void;
}

function EditIndexerModal({
  id,
  isOpen,
  selectedSchema,
  cloneId,
  onDeleteIndexerPress,
  onModalClose,
}: Readonly<EditIndexerModalProps>) {
  // `Modal` renders nothing while closed, so the content -- and with it the
  // pending changes and pending fields stores -- unmounts on cancel. That is
  // what this modal's `clearPendingChanges` dispatch used to do.
  //
  // The `cancelSaveIndexer` / `cancelTestIndexer` dispatches beside it aborted
  // the in-flight XHR so a late failure could not write `saveError` into a
  // section that was no longer on screen. That error state is per-instance now
  // and unmounts with the modal, so there is nothing left for a late failure to
  // write to; the request itself is no longer aborted. Connections has worked
  // this way since #521.
  return (
    <Modal size={sizes.MEDIUM} isOpen={isOpen} onModalClose={onModalClose}>
      <EditIndexerModalContent
        id={id}
        selectedSchema={selectedSchema}
        cloneId={cloneId}
        onDeleteIndexerPress={onDeleteIndexerPress}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditIndexerModal;
