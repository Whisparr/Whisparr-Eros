import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import DeleteMovieModalContent from './DeleteMovieModalContent';
import { useDeleteMovieModal } from './useDeleteMovieModal';

export interface DeleteMovieModalProps {
  isOpen: boolean;
  movieIds: number[];
  onDeletePress: (deleteFiles: boolean, addImportExclusion: boolean) => void;
  onModalClose: () => void;
  [key: string]: string | unknown;
}

export function DeleteMovieModal({
  isOpen,
  onModalClose,
  movieIds,
  onDeletePress,
  ...otherProps
}: DeleteMovieModalProps) {
  const { onModalClose: enhancedOnModalClose } =
    useDeleteMovieModal(onModalClose);
  return (
    <Modal
      isOpen={isOpen}
      size={sizes.MEDIUM}
      onModalClose={enhancedOnModalClose}
    >
      <DeleteMovieModalContent
        {...otherProps}
        movieIds={movieIds}
        onDeletePress={onDeletePress}
        onModalClose={enhancedOnModalClose}
      />
    </Modal>
  );
}
