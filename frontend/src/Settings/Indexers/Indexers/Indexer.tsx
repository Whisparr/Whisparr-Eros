import React, { useCallback } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, kinds } from 'Helpers/Props';
import { useTagList } from 'Tags/useTags';
import IndexerModel from 'typings/Indexer';
import translate from 'Utilities/String/translate';
import EditIndexerModal from './EditIndexerModal';
import { useDeleteIndexer } from './useIndexers';
import styles from './Indexer.css';

interface IndexerProps {
  indexer: IndexerModel;
  showPriority: boolean;
  onCloneIndexerPress: (id: number) => void;
}

function Indexer({
  indexer,
  showPriority,
  onCloneIndexerPress,
}: Readonly<IndexerProps>) {
  const {
    id,
    name,
    enableRss,
    enableAutomaticSearch,
    enableInteractiveSearch,
    tags,
    supportsRss,
    supportsSearch,
    priority,
  } = indexer;

  const tagList = useTagList();
  const { deleteIndexer, isDeleting } = useDeleteIndexer(id);

  const [
    isEditIndexerModalOpen,
    setEditIndexerModalOpen,
    setEditIndexerModalClosed,
  ] = useModalOpenState(false);

  const [
    isDeleteIndexerModalOpen,
    setDeleteIndexerModalOpen,
    setDeleteIndexerModalClosed,
  ] = useModalOpenState(false);

  const handleDeleteIndexerPress = useCallback(() => {
    setEditIndexerModalClosed();
    setDeleteIndexerModalOpen();
  }, [setEditIndexerModalClosed, setDeleteIndexerModalOpen]);

  const handleConfirmDeleteIndexer = useCallback(() => {
    deleteIndexer();
  }, [deleteIndexer]);

  const handleCloneIndexerPress = useCallback(() => {
    onCloneIndexerPress(id);
  }, [id, onCloneIndexerPress]);

  return (
    <Card
      className={styles.indexer}
      overlayContent={true}
      onPress={setEditIndexerModalOpen}
    >
      <div className={styles.nameContainer}>
        <div className={styles.name}>{name}</div>

        <IconButton
          className={styles.cloneButton}
          title={translate('CloneIndexer')}
          name={icons.CLONE}
          onPress={handleCloneIndexerPress}
        />
      </div>

      <div className={styles.enabled}>
        {supportsRss && enableRss ? (
          <Label kind={kinds.SUCCESS}>{translate('Rss')}</Label>
        ) : null}

        {supportsSearch && enableAutomaticSearch ? (
          <Label kind={kinds.SUCCESS}>{translate('AutomaticSearch')}</Label>
        ) : null}

        {supportsSearch && enableInteractiveSearch ? (
          <Label kind={kinds.SUCCESS}>{translate('InteractiveSearch')}</Label>
        ) : null}

        {showPriority ? (
          <Label kind={kinds.DEFAULT}>
            {translate('Priority')}: {priority}
          </Label>
        ) : null}

        {!enableRss && !enableAutomaticSearch && !enableInteractiveSearch ? (
          <Label kind={kinds.DISABLED} outline={true}>
            {translate('Disabled')}
          </Label>
        ) : null}
      </div>

      <TagList tags={tags} tagList={tagList} />

      <EditIndexerModal
        id={id}
        isOpen={isEditIndexerModalOpen}
        onDeleteIndexerPress={handleDeleteIndexerPress}
        onModalClose={setEditIndexerModalClosed}
      />

      <ConfirmModal
        isOpen={isDeleteIndexerModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteIndexer')}
        message={translate('DeleteIndexerMessageText', { name })}
        confirmLabel={translate('Delete')}
        isSpinning={isDeleting}
        onConfirm={handleConfirmDeleteIndexer}
        onCancel={setDeleteIndexerModalClosed}
      />
    </Card>
  );
}

export default Indexer;
