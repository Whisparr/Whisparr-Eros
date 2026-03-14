import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppState from 'App/State/AppState';
import {
  deletePerformer,
  setDeleteOption,
} from 'Store/Actions/performerActions';

export function useDeletePerformerModalContent(
  performerIds: number[],
  onModalClose: (deleted: boolean) => void
) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const deleteOptions = useSelector(
    (state: AppState) => state.performers.deleteOptions
  );

  const onDeleteOptionChange = useCallback(
    (option: { name: string; value: boolean }) => {
      dispatch(setDeleteOption({ [option.name]: option.value }));
    },
    [dispatch]
  );

  const onDeletePress = useCallback(
    (deleteFiles: boolean, addImportExclusion: boolean) => {
      performerIds.forEach((id) => {
        dispatch(deletePerformer({ id, deleteFiles, addImportExclusion }));
      });
      if (onModalClose) onModalClose(true);
      navigate('/performers');
    },
    [dispatch, performerIds, onModalClose, navigate]
  );

  return {
    deleteOptions,
    performerIds,
    onDeleteOptionChange,
    onDeletePress,
  };
}
