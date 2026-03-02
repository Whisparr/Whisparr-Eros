import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'Components/Modal/Modal';
import { clearPendingChanges } from 'Store/Actions/baseActions';
import Studio from 'Studio/Studio';
import EditStudioModalContent from './EditStudioModalContent';
import useEditStudioModal from './useEditStudioModal';

interface EditStudioModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  studio: Studio;
  // Accepts any additional props for the content connector
  [key: string]: unknown;
}

function EditStudioModal({
  isOpen,
  onModalClose,
  studio,
  ...otherProps
}: Readonly<EditStudioModalProps>) {
  const dispatch = useDispatch();
  const modalData = useEditStudioModal(studio);
  const prevIsSavingRef = useRef(modalData.isSaving);

  useEffect(() => {
    if (
      prevIsSavingRef.current &&
      !modalData.isSaving &&
      !modalData.saveError
    ) {
      onModalClose();
    }

    prevIsSavingRef.current = modalData.isSaving;
  }, [modalData, onModalClose]);

  function handleModalClose() {
    dispatch(clearPendingChanges({ section: 'studios' }));
    onModalClose();
  }

  return (
    <Modal isOpen={isOpen} onModalClose={handleModalClose}>
      <EditStudioModalContent
        studioId={studio.id}
        title={modalData.title}
        images={modalData.images}
        overview={modalData.overview}
        item={modalData.item}
        showMovieMonitor={modalData.showMovieMonitor}
        isSaving={modalData.isSaving}
        saveError={modalData.saveError}
        isPathChanging={modalData.isPathChanging}
        originalPath={modalData.originalPath}
        isSmallScreen={modalData.isSmallScreen}
        onInputChange={modalData.onInputChange}
        onSavePress={modalData.onSavePress}
        onModalClose={handleModalClose}
        {...otherProps}
      />
    </Modal>
  );
}

export default EditStudioModal;
