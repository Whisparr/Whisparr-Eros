import React from 'react';
import Modal from 'Components/Modal/Modal';
import Performer from 'Performer/Performer';
import TagsModalContent from './TagsModalContent';

interface TagsModalProps {
  isOpen: boolean;
  performerIds: number[];
  items: Performer[];
  onApplyTagsPress: (tags: number[], applyTags: string) => void;
  onModalClose: () => void;
}

function TagsModal(props: TagsModalProps) {
  const { isOpen, onModalClose, ...otherProps } = props;

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <TagsModalContent {...otherProps} onModalClose={onModalClose} />
    </Modal>
  );
}

export default TagsModal;
