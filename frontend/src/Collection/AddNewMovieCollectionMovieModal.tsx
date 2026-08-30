import React from 'react';
import Modal from 'Components/Modal/Modal';
import AddNewMovieCollectionMovieModalContent, {
  AddNewMovieCollectionMovieModalContentProps,
} from './AddNewMovieCollectionMovieModalContent';

interface AddNewCollectionMovieModalProps extends AddNewMovieCollectionMovieModalContentProps {
  isOpen: boolean;
}

function AddNewMovieCollectionMovieModal({
  isOpen,
  onModalClose,
  ...otherProps
}: AddNewCollectionMovieModalProps) {
  return (
    // `Modal` renders nothing while closed, so the content unmounts and its
    // local state resets on every open. That is what the two
    // `clearPendingChanges` dispatches did.
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <AddNewMovieCollectionMovieModalContent
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default AddNewMovieCollectionMovieModal;
