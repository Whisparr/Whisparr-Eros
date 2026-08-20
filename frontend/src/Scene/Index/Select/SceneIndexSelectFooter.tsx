import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useSelect } from 'App/SelectContext';
import AppState from 'App/State/AppState';
import { RENAME_MOVIE } from 'Commands/commandNames';
import { useCommandExecuting } from 'Commands/useCommands';
import SpinnerButton from 'Components/Link/SpinnerButton';
import PageContentFooter from 'Components/Page/PageContentFooter';
import { kinds } from 'Helpers/Props';
import { saveMovieEditor } from 'Store/Actions/movieActions';
import { fetchRootFolders } from 'Store/Actions/rootFolderActions';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import { DeleteSceneModal } from './Delete/DeleteSceneModal';
import { useDeleteSceneModalFooterHandler } from './Delete/useDeleteSceneModalFooterHandler';
import EditScenesModal from './Edit/EditScenesModal';
import { useEditScenesModalMutation } from './Edit/useEditScenesModalMutation';
import OrganizeScenesModal from './Organize/OrganizeScenesModal';
import TagsModal from './Tags/TagsModal';
import styles from './SceneIndexSelectFooter.css';

interface SavePayload {
  monitored?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
}

const sceneEditorSelector = createSelector(
  (state: AppState) => state.movies,
  (movies) => {
    // Keep legacy isSaving for other features like tags and delete
    const { isSaving } = movies;

    return {
      isSaving,
    };
  }
);

function SceneIndexSelectFooter() {
  const { isSaving: legacyIsSaving } = useSelector(sceneEditorSelector);
  const isOrganizingMovies = useCommandExecuting(RENAME_MOVIE);

  const dispatch = useDispatch();
  const editMutation = useEditScenesModalMutation();

  const [isDeleteSceneModalOpen, setIsDeleteSceneModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isSavingTags, setIsSavingTags] = useState(false);

  const [selectState] = useSelect();
  const { selectedState } = selectState;

  const sceneIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const selectedCount = sceneIds.length ? sceneIds.length : 0;

  const onEditPress = useCallback(() => {
    setIsEditModalOpen(true);
  }, [setIsEditModalOpen]);

  const onEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, [setIsEditModalOpen]);

  const onSavePress = useCallback(
    (payload: SavePayload) => {
      setIsEditModalOpen(false);

      editMutation.mutate({
        movieIds: sceneIds,
        ...payload,
      });
    },
    [sceneIds, editMutation]
  );

  const onOrganizePress = useCallback(() => {
    setIsOrganizeModalOpen(true);
  }, [setIsOrganizeModalOpen]);

  const onOrganizeModalClose = useCallback(() => {
    setIsOrganizeModalOpen(false);
  }, [setIsOrganizeModalOpen]);

  const onTagsPress = useCallback(() => {
    setIsTagsModalOpen(true);
  }, [setIsTagsModalOpen]);

  const onTagsModalClose = useCallback(() => {
    setIsTagsModalOpen(false);
  }, [setIsTagsModalOpen]);

  const onApplyTagsPress = useCallback(
    (tags: number[], applyTags: string) => {
      setIsSavingTags(true);
      setIsTagsModalOpen(false);

      dispatch(
        saveMovieEditor({
          movieIds: sceneIds,
          tags,
          applyTags,
        })
      );
    },
    [sceneIds, dispatch]
  );

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteSceneModalOpen(false);
  }, []);

  const onDeleteSelectedPress = useCallback(() => {
    setIsDeleteSceneModalOpen(true);
  }, []);

  // Handler for when delete is confirmed in modal
  const { onDeletePress, isPending: isDeletePending } =
    useDeleteSceneModalFooterHandler({
      sceneIds,
      onModalClose: onDeleteModalClose,
    });

  useEffect(() => {
    // Legacy reducer-based isSaving for tags operation
    if (!legacyIsSaving) {
      setIsSavingTags(false);
    }
  }, [legacyIsSaving]);

  useEffect(() => {
    dispatch(fetchRootFolders());
  }, [dispatch]);

  const anySelected = selectedCount > 0;

  return (
    <PageContentFooter className={styles.footer}>
      <div className={styles.buttons}>
        <div className={styles.actionButtons}>
          <SpinnerButton
            isSpinning={editMutation.isPending}
            isDisabled={!anySelected}
            onPress={onEditPress}
          >
            {translate('Edit')}
          </SpinnerButton>
          <SpinnerButton
            kind={kinds.WARNING}
            isSpinning={isOrganizingMovies}
            isDisabled={!anySelected || isOrganizingMovies}
            onPress={onOrganizePress}
          >
            {translate('RenameFiles')}
          </SpinnerButton>

          <SpinnerButton
            isSpinning={legacyIsSaving && isSavingTags}
            isDisabled={!anySelected}
            onPress={onTagsPress}
          >
            {translate('SetTags')}
          </SpinnerButton>

          <SpinnerButton
            isSpinning={isDeletePending}
            isDisabled={!anySelected}
            kind={kinds.DANGER}
            onPress={onDeleteSelectedPress}
          >
            {translate('Delete')}
          </SpinnerButton>
        </div>
      </div>

      <div className={styles.selected}>
        {translate('ScenesSelectedInterp', { count: selectedCount })}
      </div>

      <EditScenesModal
        isOpen={isEditModalOpen}
        sceneIds={sceneIds}
        onSavePress={onSavePress}
        onModalClose={onEditModalClose}
      />

      <TagsModal
        isOpen={isTagsModalOpen}
        sceneIds={sceneIds}
        onApplyTagsPress={onApplyTagsPress}
        onModalClose={onTagsModalClose}
      />

      <OrganizeScenesModal
        isOpen={isOrganizeModalOpen}
        sceneIds={sceneIds}
        onModalClose={onOrganizeModalClose}
      />

      <DeleteSceneModal
        isOpen={isDeleteSceneModalOpen}
        sceneIds={sceneIds}
        onDeletePress={onDeletePress}
        onModalClose={onDeleteModalClose}
      />
    </PageContentFooter>
  );
}

export default SceneIndexSelectFooter;
