import React from 'react';
import Modal from 'Components/Modal/Modal';
import { ReviewCandidate } from 'typings/Review';
import SelectReviewSceneModalContent, {
  SelectReviewSceneModalContentProps,
} from './SelectReviewSceneModalContent';

interface SelectReviewSceneModalProps extends Omit<
  SelectReviewSceneModalContentProps,
  'onModalClose'
> {
  isOpen: boolean;
  onSceneSelect(scene: ReviewCandidate): void;
  onModalClose(): void;
}

function SelectReviewSceneModal(props: SelectReviewSceneModalProps) {
  const { isOpen, onModalClose, ...otherProps } = props;

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <SelectReviewSceneModalContent
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default SelectReviewSceneModal;
