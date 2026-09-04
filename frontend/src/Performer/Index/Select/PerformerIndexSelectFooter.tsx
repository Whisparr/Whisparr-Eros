import React, { useCallback, useMemo, useState } from 'react';
import { useSelect } from 'App/SelectContext';
import SpinnerButton from 'Components/Link/SpinnerButton';
import PageContentFooter from 'Components/Page/PageContentFooter';
import { kinds } from 'Helpers/Props';
import Performer from 'Performer/Performer';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import { DeletePerformerModal } from './Delete/DeletePerformerModal';
import { useDeletePerformerModalFooterHandler } from './Delete/useDeletePerformerModalFooterHandler';
import EditPerformersModal from './Edit/EditPerformersModal';
import { useEditPerformersMutation } from './Edit/useEditPerformersModalMutation';
import TagsModal from './Tags/TagsModal';
import styles from './PerformerIndexSelectFooter.css';

// Mirrors what `EditPerformersModalContent` builds. `moviesMonitored` was
// missing here and only survived because the modal types its callback as
// `object`; the key was reaching the request all along.
interface SavePayload {
  monitored?: boolean;
  moviesMonitored?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
  afterDate?: string;
}

interface PerformerIndexSelectFooterProps {
  items: Performer[];
}

function PerformerIndexSelectFooter({
  items,
}: Readonly<PerformerIndexSelectFooterProps>) {
  // `/performer/editor` serves both buttons, but they spin independently, so
  // each gets its own mutation rather than sharing one `isPending`.
  const editMutation = useEditPerformersMutation();
  const tagsMutation = useEditPerformersMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
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
      setIsTagsModalOpen(false);

      tagsMutation.mutate({
        performerIds,
        tags,
        applyTags: applyTags as 'add' | 'remove' | 'replace',
      });
    },
    [performerIds, tagsMutation]
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
        items={items}
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
