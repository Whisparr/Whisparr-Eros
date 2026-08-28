import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import ImportListExclusion from 'typings/ImportListExclusion';
import EditImportListExclusionModalContent from './EditImportListExclusionModalContent';

interface EditImportListExclusionModalProps {
  importListExclusion?: ImportListExclusion;
  isOpen: boolean;
  onModalClose: () => void;
  onDeleteImportListExclusionPress?: () => void;
}

// The pending changes live in the content, which the modal unmounts when it
// closes, so there is nothing left to clear on the way out.
function EditImportListExclusionModal({
  isOpen,
  onModalClose,
  ...otherProps
}: Readonly<EditImportListExclusionModalProps>) {
  return (
    <Modal size={sizes.MEDIUM} isOpen={isOpen} onModalClose={onModalClose}>
      <EditImportListExclusionModalContent
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditImportListExclusionModal;
