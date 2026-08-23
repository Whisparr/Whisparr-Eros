import React, { useCallback, useState } from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import EditQualityProfileModalContent from './EditQualityProfileModalContent';

interface EditQualityProfileModalProps {
  id?: number;
  cloneId?: number;
  isOpen: boolean;
  onDeleteQualityProfilePress?: () => void;
  onModalClose: () => void;
}

function EditQualityProfileModal({
  id,
  cloneId,
  isOpen,
  onDeleteQualityProfilePress,
  onModalClose,
}: Readonly<EditQualityProfileModalProps>) {
  const [height, setHeight] = useState<'auto' | number>('auto');

  // Grow-only, as the class component was: the two halves of the modal measure
  // separately and switching into group editing must not shrink it mid-drag.
  const handleContentHeightChange = useCallback((newHeight: number) => {
    setHeight((currentHeight) =>
      currentHeight === 'auto' || newHeight > currentHeight
        ? newHeight
        : currentHeight
    );
  }, []);

  return (
    <Modal
      style={{ height: height === 'auto' ? 'auto' : `${height}px` }}
      isOpen={isOpen}
      size={sizes.EXTRA_LARGE}
      onModalClose={onModalClose}
    >
      <EditQualityProfileModalContent
        id={id}
        cloneId={cloneId}
        onContentHeightChange={handleContentHeightChange}
        onDeleteQualityProfilePress={onDeleteQualityProfilePress}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

export default EditQualityProfileModal;
