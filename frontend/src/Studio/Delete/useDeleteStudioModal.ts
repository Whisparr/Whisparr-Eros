import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import AppState from 'App/State/AppState';
import { deleteStudio, setDeleteOption } from 'Store/Actions/studioActions';
import Studio from 'Studio/Studio';

interface UseDeleteStudioModalResult {
  deleteOptions: { addImportExclusion: boolean };
  onDeleteOptionChange: (option: { name: string; value: boolean }) => void;
  onDeletePress: (deleteFiles: boolean, addImportExclusion: boolean) => void;
}

export default function useDeleteStudioModal(
  studio: Studio
): UseDeleteStudioModalResult {
  const dispatch = useDispatch();
  const history = useHistory();
  const deleteOptions = useSelector(
    (state: AppState) => state.studios.deleteOptions
  );

  const onDeleteOptionChange = useCallback(
    (option: { name: string; value: boolean }) => {
      dispatch(
        setDeleteOption({
          [option.name]: option.value,
        })
      );
    },
    [dispatch]
  );

  const onDeletePress = useCallback(
    (deleteFiles: boolean, addImportExclusion: boolean) => {
      dispatch(
        deleteStudio({
          id: studio.id,
          deleteFiles,
          addImportExclusion,
        })
      );
      history.push('/studios');
    },
    [dispatch, studio.id, history]
  );

  return {
    deleteOptions,
    onDeleteOptionChange,
    onDeletePress,
  };
}
