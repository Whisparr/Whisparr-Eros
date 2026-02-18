import { useState } from 'react';

function useMovieDetailsModals() {
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [isEditMovieModalOpen, setIsEditMovieModalOpen] = useState(false);
  const [isDeleteMovieModalOpen, setIsDeleteMovieModalOpen] = useState(false);
  const [isInteractiveImportModalOpen, setIsInteractiveImportModalOpen] =
    useState(false);
  const [isInteractiveSearchModalOpen, setIsInteractiveSearchModalOpen] =
    useState(false);
  const [isMovieHistoryModalOpen, setIsMovieHistoryModalOpen] = useState(false);
  // ... rest of modal state
  return {
    isOrganizeModalOpen,
    handleOrganizePress: () => setIsOrganizeModalOpen(true),
    handleOrganizeModalClose: () => setIsOrganizeModalOpen(false),

    isEditMovieModalOpen,
    handleEditMoviePress: () => setIsEditMovieModalOpen(true),
    handleEditMovieModalClose: () => setIsEditMovieModalOpen(false),

    isDeleteMovieModalOpen,
    handleDeleteMoviePress: () => {
      setIsEditMovieModalOpen(false);
      setIsDeleteMovieModalOpen(true);
    },
    handleDeleteMovieModalClose: () => setIsDeleteMovieModalOpen(false),

    isInteractiveImportModalOpen,
    handleInteractiveImportPress: () => setIsInteractiveImportModalOpen(true),
    handleInteractiveImportModalClose: () =>
      setIsInteractiveImportModalOpen(false),

    isInteractiveSearchModalOpen,
    handleInteractiveSearchPress: () => setIsInteractiveSearchModalOpen(true),
    handleInteractiveSearchModalClose: () =>
      setIsInteractiveSearchModalOpen(false),

    isMovieHistoryModalOpen,
    handleMovieHistoryPress: () => setIsMovieHistoryModalOpen(true),
    handleMovieHistoryModalClose: () => setIsMovieHistoryModalOpen(false),
  };
}

export default useMovieDetailsModals;
