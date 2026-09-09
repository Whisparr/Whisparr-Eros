import React, { useCallback, useMemo, useState } from 'react';
import { useSelect } from 'App/SelectContext';
import SpinnerButton from 'Components/Link/SpinnerButton';
import PageContentFooter from 'Components/Page/PageContentFooter';
import { kinds } from 'Helpers/Props';
import Studio from 'Studio/Studio';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import DeleteStudioModal from './Delete/DeleteStudioModal';
import { useDeleteStudiosModalFooterHandler } from './Delete/useDeleteStudiosModalFooterHandler';
import EditStudiosModal from './Edit/EditStudiosModal';
import { useEditStudiosModalMutation } from './Edit/useEditStudiosModalMutation';
import TagsModal from './Tags/TagsModal';
import styles from './StudioIndexSelectFooter.css';

interface SavePayload {
  monitored?: boolean;
  moviesMonitored?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
  afterDate?: string;
}

interface StudioIndexSelectFooterProps {
  items: Studio[];
}

function StudioIndexSelectFooter({
  items,
}: Readonly<StudioIndexSelectFooterProps>) {
  // `/studio/editor` serves both buttons, but they spin independently, so each
  // gets its own mutation rather than sharing one `isPending`.
  const editMutation = useEditStudiosModalMutation();
  const tagsMutation = useEditStudiosModalMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectState] = useSelect();
  const { selectedState } = selectState;

  const studioIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const selectedCount = studioIds.length ? studioIds.length : 0;

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
        studioIds,
        ...payload,
      });
    },
    [studioIds, editMutation]
  );

  const onTagsPress = useCallback(() => {
    setIsTagsModalOpen(true);
  }, [setIsTagsModalOpen]);

  const onTagsModalClose = useCallback(() => {
    setIsTagsModalOpen(false);
  }, [setIsTagsModalOpen]);

  const onApplyTagsPress = useCallback(
    (tags: number[], applyTags: string) => {
      setIsTagsModalOpen(false);

      tagsMutation.mutate({
        studioIds,
        tags,
        applyTags: applyTags as 'add' | 'remove' | 'replace',
      });
    },
    [studioIds, tagsMutation]
  );

  const onDeletePress = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const { onDeletePress: onDeleteConfirmed, isPending: isDeletePending } =
    useDeleteStudiosModalFooterHandler({
      studioIds,
      onModalClose: onDeleteModalClose,
    });

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
            isSpinning={tagsMutation.isPending}
            isDisabled={!anySelected}
            onPress={onTagsPress}
          >
            {translate('SetTags')}
          </SpinnerButton>

          <SpinnerButton
            isSpinning={isDeletePending}
            isDisabled={!anySelected}
            kind={kinds.DANGER}
            onPress={onDeletePress}
          >
            {translate('Delete')}
          </SpinnerButton>
        </div>
      </div>

      <div className={styles.selected}>
        {translate('StudiosSelectedInterp', { count: selectedCount })}
      </div>

      <EditStudiosModal
        isOpen={isEditModalOpen}
        studioIds={studioIds}
        onSavePress={onSavePress}
        onModalClose={onEditModalClose}
      />

      <TagsModal
        isOpen={isTagsModalOpen}
        studioIds={studioIds}
        items={items}
        onApplyTagsPress={onApplyTagsPress}
        onModalClose={onTagsModalClose}
      />

      <DeleteStudioModal
        isOpen={isDeleteModalOpen}
        onDeletePress={onDeleteConfirmed}
        onModalClose={onDeleteModalClose}
      />
    </PageContentFooter>
  );
}

export default StudioIndexSelectFooter;
