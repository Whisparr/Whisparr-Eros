import React from 'react';
import Modal from 'Components/Modal/Modal';
import EditMovieCollectionModalContent, {
  EditMovieCollectionModalContentProps,
} from './EditMovieCollectionModalContent';

interface EditMovieCollectionModalProps extends EditMovieCollectionModalContentProps {
  isOpen: boolean;
}

function EditMovieCollectionModal({
  isOpen,
  onModalClose,
  ...otherProps
}: EditMovieCollectionModalProps) {
  return (
    // `Modal` renders nothing while closed, so the content unmounts and its
    // local state resets on every open. That is what `clearPendingChanges` did.
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <EditMovieCollectionModalContent
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditMovieCollectionModal;
