import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'Components/Modal/Modal';
import { clearPendingChanges } from 'Store/Actions/baseActions';
import Performer from '../Performer';
import EditPerformerModalContent from './EditPerformerModalContent';
import useEditPerformerModal from './useEditPerformerModal';

interface EditPerformerModalProps {
  isOpen: boolean;
  performer: Performer;
  showMovieMonitor: boolean;
  onModalClose: () => void;
}

function EditPerformerModal(props: EditPerformerModalProps) {
  const { isOpen, performer, showMovieMonitor, onModalClose } = props;
  const dispatch = useDispatch();

  // Get editing state and handlers from hook
  const modalData = useEditPerformerModal(performer);
  const prevIsSavingRef = useRef(modalData.isSaving);

  // Close modal on successful save
  useEffect(() => {
    if (
      prevIsSavingRef.current &&
      !modalData.isSaving &&
      !modalData.saveError
    ) {
      onModalClose();
    }
    prevIsSavingRef.current = modalData.isSaving;
  }, [modalData.isSaving, modalData.saveError, onModalClose]);

  // Handle modal close with cleanup
  function handleModalClose() {
    dispatch(clearPendingChanges({ section: 'performers' }));
    onModalClose();
  }

  return (
    <Modal isOpen={isOpen} onModalClose={handleModalClose}>
      <EditPerformerModalContent
        performerId={performer.id}
        showMovieMonitor={showMovieMonitor}
        fullName={modalData.fullName}
        images={modalData.images}
        overview={modalData.overview}
        item={modalData.item}
        isSaving={modalData.isSaving}
        saveError={modalData.saveError}
        isPathChanging={modalData.isPathChanging}
        originalPath={modalData.originalPath}
        isSmallScreen={modalData.isSmallScreen}
        safeForWorkMode={modalData.safeForWorkMode}
        onInputChange={modalData.onInputChange}
        onSavePress={modalData.onSavePress}
        onModalClose={handleModalClose}
      />
    </Modal>
  );
}

export default EditPerformerModal;
