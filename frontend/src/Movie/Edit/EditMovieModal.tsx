import React, { useCallback } from 'react';
import Modal from 'Components/Modal/Modal';
import Movie from 'Movie/Movie';
import EditMovieModalContent, {
  EditMovieModalContentProps,
} from './EditMovieModalContent';

interface EditMovieModalProps extends EditMovieModalContentProps {
  isOpen: boolean;
  movie: Movie;
}

function EditMovieModal({
  isOpen,
  onModalClose,
  ...otherProps
}: EditMovieModalProps) {
  const handleModalClose = useCallback(() => {
    onModalClose();
  }, [onModalClose]);

  return (
    <Modal isOpen={isOpen} onModalClose={handleModalClose}>
      <EditMovieModalContent {...otherProps} onModalClose={handleModalClose} />
    </Modal>
  );
}

export default EditMovieModal;
