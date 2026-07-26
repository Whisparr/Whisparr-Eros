import React from 'react';
import Modal from 'Components/Modal/Modal';
import Movie from 'Movie/Movie';
import OrganizeMoviesModalContent from './OrganizeMoviesModalContent';

interface OrganizeMoviesModalProps {
  isOpen: boolean;
  movieIds: number[];
  items: Movie[];
  onModalClose: () => void;
}

function OrganizeMoviesModal(props: Readonly<OrganizeMoviesModalProps>) {
  const { isOpen, onModalClose, ...otherProps } = props;

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <OrganizeMoviesModalContent {...otherProps} onModalClose={onModalClose} />
    </Modal>
  );
}

export default OrganizeMoviesModal;
