import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import MovieInteractiveSearchModalContent, {
  MovieInteractiveSearchModalContentProps,
} from './MovieInteractiveSearchModalContent';

interface MovieInteractiveSearchModalProps extends MovieInteractiveSearchModalContentProps {
  isOpen: boolean;
}

function MovieInteractiveSearchModal({
  isOpen,
  movieId,
  onModalClose,
}: MovieInteractiveSearchModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      closeOnBackgroundClick={false}
      size={sizes.EXTRA_EXTRA_LARGE}
      onModalClose={onModalClose}
    >
      <MovieInteractiveSearchModalContent
        movieId={movieId}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default MovieInteractiveSearchModal;
