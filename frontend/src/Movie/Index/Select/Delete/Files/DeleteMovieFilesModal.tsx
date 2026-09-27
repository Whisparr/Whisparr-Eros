import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import DeleteMovieFilesModalContent, {
  DeleteMovieFilesModalContentProps,
} from './DeleteMovieFilesModalContent';

interface DeleteMovieFilesModalProps extends DeleteMovieFilesModalContentProps {
  isOpen: boolean;
}

function DeleteMovieFilesModal({
  isOpen,
  ...otherProps
}: Readonly<DeleteMovieFilesModalProps>) {
  return (
    <Modal
      isOpen={isOpen}
      size={sizes.MEDIUM}
      onModalClose={otherProps.onModalClose}
    >
      <DeleteMovieFilesModalContent {...otherProps} />
    </Modal>
  );
}

export default DeleteMovieFilesModal;
