import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useSelect } from 'App/SelectContext';
import AppState from 'App/State/AppState';
import SpinnerButton from 'Components/Link/SpinnerButton';
import PageContentFooter from 'Components/Page/PageContentFooter';
import { kinds } from 'Helpers/Props';
import { savePerformerEditor } from 'Store/Actions/performerActions';
import { fetchRootFolders } from 'Store/Actions/rootFolderActions';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import { DeletePerformerModal } from './Delete/DeletePerformerModal';
import { useDeletePerformerModalFooterHandler } from './Delete/useDeletePerformerModalFooterHandler';
import EditPerformersModal from './Edit/EditPerformersModal';
import { useEditPerformersMutation } from './Edit/useEditPerformersModalMutation';
import TagsModal from './Tags/TagsModal';
import styles from './PerformerIndexSelectFooter.css';

interface SavePayload {
  monitored?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
}

const sceneEditorSelector = createSelector(
  (state: AppState) => state.performers,
  (performers) => {
    // Keep legacy isSaving for other features like tags and delete
    const { isSaving } = performers;

    return {
      isSaving,
    };
  }
);

function PerformerIndexSelectFooter() {
  const { isSaving: legacyIsSaving } = useSelector(sceneEditorSelector);

  const dispatch = useDispatch();
  const editMutation = useEditPerformersMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [isPerformerModalOpen, setIsPerformerModalOpen] = useState(false);

  const [selectState] = useSelect();
  const { selectedState } = selectState;

  const performerIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const selectedCount = performerIds.length ? performerIds.length : 0;

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
        performerIds,
        ...payload,
      });
    },
    [performerIds, editMutation]
  );

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
        savePerformerEditor({
          performerIds,
          tags,
          applyTags,
        })
      );
    },
    [performerIds, dispatch]
  );

  const onDeleteModalClose = useCallback(() => {
    setIsPerformerModalOpen(false);
  }, []);

  const onDeleteSelectedPress = useCallback(() => {
    setIsPerformerModalOpen(true);
  }, []);

  // Handler for when delete is confirmed in modal
  const { onDeletePress, isPending: isDeletePending } =
    useDeletePerformerModalFooterHandler({
      performerIds,
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
        {translate('PerformersSelectedInterp', { count: selectedCount })}
      </div>

      <EditPerformersModal
        isOpen={isEditModalOpen}
        performerIds={performerIds}
        onSavePress={onSavePress}
        onModalClose={onEditModalClose}
      />

      <TagsModal
        isOpen={isTagsModalOpen}
        performerIds={performerIds}
        onApplyTagsPress={onApplyTagsPress}
        onModalClose={onTagsModalClose}
      />

      <DeletePerformerModal
        isOpen={isPerformerModalOpen}
        performerIds={performerIds}
        onDeletePress={onDeletePress}
        onModalClose={onDeleteModalClose}
      />
    </PageContentFooter>
  );
}

export default PerformerIndexSelectFooter;
