import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { clearPendingChanges } from 'Store/Actions/baseActions';

export function useDeleteMovieModal(onModalClose: () => void) {
  const dispatch = useDispatch();

  const handleModalClose = useCallback(() => {
    dispatch(clearPendingChanges({ section: 'movies' }));
    onModalClose();
  }, [dispatch, onModalClose]);

  return {
    onModalClose: handleModalClose,
  };
}
