import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import AppState from 'App/State/AppState';
import { deleteStudio, setDeleteOption } from 'Store/Actions/studioActions';

export function useDeleteStudioModalContent(
  studioIds: number[],
  onModalClose: (deleted?: boolean) => void
) {
  const dispatch = useDispatch();
  const history = useHistory();
  const deleteOptions = useSelector(
    (state: AppState) => state.studios.deleteOptions
  );

  const onDeleteOptionChange = useCallback(
    (option: { name: string; value: boolean }) => {
      dispatch(setDeleteOption({ [option.name]: option.value }));
    },
    [dispatch]
  );

  const onDeletePress = useCallback(
    (deleteFiles: boolean, addImportExclusion: boolean) => {
      studioIds.forEach((id) => {
        dispatch(deleteStudio({ id, deleteFiles, addImportExclusion }));
      });

      if (onModalClose) {
        onModalClose(true);
      }

      history.push('/studios');
    },
    [dispatch, studioIds, onModalClose, history]
  );

  return {
    deleteOptions,
    onDeleteOptionChange,
    onDeletePress,
  };
}
