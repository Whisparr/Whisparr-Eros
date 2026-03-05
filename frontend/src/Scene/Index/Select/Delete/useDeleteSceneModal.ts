import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { clearPendingChanges } from 'Store/Actions/baseActions';

export function useDeleteSceneModal(onModalClose: () => void) {
  const dispatch = useDispatch();

  const handleModalClose = useCallback(() => {
    dispatch(clearPendingChanges({ section: 'scenes' }));
    onModalClose();
  }, [dispatch, onModalClose]);

  return {
    onModalClose: handleModalClose,
  };
}
