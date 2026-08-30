import React, { useCallback } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { kinds } from 'Helpers/Props';
import { useTagList } from 'Tags/useTags';
import DownloadClientModel from 'typings/DownloadClient';
import translate from 'Utilities/String/translate';
import EditDownloadClientModal from './EditDownloadClientModal';
import { useDeleteDownloadClient } from './useDownloadClients';
import styles from './DownloadClient.css';

interface DownloadClientProps {
  downloadClient: DownloadClientModel;
}

function DownloadClient({ downloadClient }: Readonly<DownloadClientProps>) {
  const { id, name, enable, priority, tags } = downloadClient;

  const tagList = useTagList();
  const { deleteDownloadClient } = useDeleteDownloadClient(id);

  const [
    isEditDownloadClientModalOpen,
    setEditDownloadClientModalOpen,
    setEditDownloadClientModalClosed,
  ] = useModalOpenState(false);

  const [
    isDeleteDownloadClientModalOpen,
    setDeleteDownloadClientModalOpen,
    setDeleteDownloadClientModalClosed,
  ] = useModalOpenState(false);

  const handleDeleteDownloadClientPress = useCallback(() => {
    setEditDownloadClientModalClosed();
    setDeleteDownloadClientModalOpen();
  }, [setEditDownloadClientModalClosed, setDeleteDownloadClientModalOpen]);

  const handleConfirmDeleteDownloadClient = useCallback(() => {
    deleteDownloadClient();
  }, [deleteDownloadClient]);

  return (
    <Card
      className={styles.downloadClient}
      overlayContent={true}
      onPress={setEditDownloadClientModalOpen}
    >
      <div className={styles.name}>{name}</div>

      <div className={styles.enabled}>
        {enable ? (
          <Label kind={kinds.SUCCESS}>{translate('Enabled')}</Label>
        ) : (
          <Label kind={kinds.DISABLED} outline={true}>
            {translate('Disabled')}
          </Label>
        )}

        {priority > 1 ? (
          <Label kind={kinds.DISABLED} outline={true}>
            {translate('PrioritySettings', { priority })}
          </Label>
        ) : null}
      </div>

      <TagList tags={tags} tagList={tagList} />

      <EditDownloadClientModal
        id={id}
        isOpen={isEditDownloadClientModalOpen}
        onDeleteDownloadClientPress={handleDeleteDownloadClientPress}
        onModalClose={setEditDownloadClientModalClosed}
      />

      <ConfirmModal
        isOpen={isDeleteDownloadClientModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteDownloadClient')}
        message={translate('DeleteDownloadClientMessageText', { name })}
        confirmLabel={translate('Delete')}
        onConfirm={handleConfirmDeleteDownloadClient}
        onCancel={setDeleteDownloadClientModalClosed}
      />
    </Card>
  );
}

export default DownloadClient;
