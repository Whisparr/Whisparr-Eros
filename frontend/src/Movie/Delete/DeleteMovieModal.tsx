import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import DeleteMovieModalContent, {
  DeleteMovieModalContentProps,
} from './DeleteMovieModalContent';

interface DeleteMovieModalProps extends DeleteMovieModalContentProps {
  isOpen: boolean;
  movie: Movie;
}

function DeleteMovieModal({
  isOpen,
  onModalClose,
  movie,
  ...otherProps
}: DeleteMovieModalProps) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeleteMovieModalContent
        {...otherProps}
        movie={movie}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default DeleteMovieModal;
