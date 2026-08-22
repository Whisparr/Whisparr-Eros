import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import DeletePerformerModalContent from './DeletePerformerModalContent';

export interface DeletePerformerModalProps {
  isOpen: boolean;
  performerIds: number[];
  onDeletePress: (deleteFiles: boolean, addImportExclusion: boolean) => void;
  onModalClose: () => void;
  [key: string]: string | unknown;
}

export function DeletePerformerModal({
  isOpen,
  onModalClose,
  performerIds,
  onDeletePress,
  ...otherProps
}: DeletePerformerModalProps) {
  return (
    <Modal isOpen={isOpen} size={sizes.MEDIUM} onModalClose={onModalClose}>
      <DeletePerformerModalContent
        {...otherProps}
        performerIds={performerIds}
        onDeletePress={onDeletePress}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}
