import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppState from 'App/State/AppState';
import Performer from 'Performer/Performer';
import {
  deletePerformer,
  setDeleteOption,
} from 'Store/Actions/performerActions';

interface DeletePerformerModalContentProps {
  performer: Performer;
  onModalClose?: (deleted: boolean) => void;
}

// Custom hook to replace the connector
export function useDeletePerformerModalContent({
  performer,
  onModalClose,
}: DeletePerformerModalContentProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deleteOptions = useSelector(
    (state: AppState) => state.performers.deleteOptions
  );

  const onDeleteOptionChange = useCallback(
    (option: { name: string; value: unknown }) => {
      dispatch(setDeleteOption({ [option.name]: option.value }));
    },
    [dispatch]
  );

  const onDeletePress = useCallback(
    (deleteFiles: boolean, addImportExclusion: boolean) => {
      dispatch(
        deletePerformer({
          id: performer.id,
          deleteFiles,
          addImportExclusion,
        })
      );
      if (onModalClose) onModalClose(true);
      navigate('/performers');
    },
    [dispatch, performer.id, onModalClose, navigate]
  );

  return {
    ...performer,
    deleteOptions,
    onDeleteOptionChange,
    onDeletePress,
  };
}
