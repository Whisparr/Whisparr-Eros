import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { clearPendingChanges } from 'Store/Actions/baseActions';

export function useDeletePerformerModal(onModalClose: () => void) {
  const dispatch = useDispatch();

  const handleModalClose = useCallback(() => {
    dispatch(clearPendingChanges({ section: 'performers' }));
    onModalClose();
  }, [dispatch, onModalClose]);

  return {
    onModalClose: handleModalClose,
  };
}
