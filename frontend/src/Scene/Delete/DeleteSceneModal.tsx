import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import DeleteSceneModalContent, {
  DeleteSceneModalContentProps,
} from './DeleteSceneModalContent';

interface DeleteSceneModalProps extends DeleteSceneModalContentProps {
  isOpen: boolean;
  scene: Movie;
}

function DeleteSceneModal({
  isOpen,
  onModalClose,
  scene,
  ...otherProps
}: DeleteSceneModalProps) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeleteSceneModalContent
        {...otherProps}
        scene={scene}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default DeleteSceneModal;
