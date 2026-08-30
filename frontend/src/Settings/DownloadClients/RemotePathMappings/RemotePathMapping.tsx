import classNames from 'classnames';
import React, { useCallback } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditRemotePathMappingModal from './EditRemotePathMappingModal';
import { useDeleteRemotePathMapping } from './useRemotePathMappings';
import styles from './RemotePathMapping.css';

interface RemotePathMappingProps {
  id: number;
  host: string;
  remotePath: string;
  localPath: string;
}

function RemotePathMapping({
  id,
  host,
  remotePath,
  localPath,
}: Readonly<RemotePathMappingProps>) {
  const { deleteRemotePathMapping } = useDeleteRemotePathMapping(id);

  const [
    isEditRemotePathMappingModalOpen,
    setEditRemotePathMappingModalOpen,
    setEditRemotePathMappingModalClosed,
  ] = useModalOpenState(false);

  const [
    isDeleteRemotePathMappingModalOpen,
    setDeleteRemotePathMappingModalOpen,
    setDeleteRemotePathMappingModalClosed,
  ] = useModalOpenState(false);

  const handleDeleteRemotePathMappingPress = useCallback(() => {
    setEditRemotePathMappingModalClosed();
    setDeleteRemotePathMappingModalOpen();
  }, [
    setEditRemotePathMappingModalClosed,
    setDeleteRemotePathMappingModalOpen,
  ]);

  const handleConfirmDeleteRemotePathMapping = useCallback(() => {
    deleteRemotePathMapping();
  }, [deleteRemotePathMapping]);

  return (
    <div className={classNames(styles.remotePathMapping)}>
      <div className={styles.host}>{host}</div>
      <div className={styles.path}>{remotePath}</div>
      <div className={styles.path}>{localPath}</div>

      <div className={styles.actions}>
        <Link onPress={setEditRemotePathMappingModalOpen}>
          <Icon name={icons.EDIT} />
        </Link>
      </div>

      <EditRemotePathMappingModal
        id={id}
        isOpen={isEditRemotePathMappingModalOpen}
        onModalClose={setEditRemotePathMappingModalClosed}
        onDeleteRemotePathMappingPress={handleDeleteRemotePathMappingPress}
      />

      <ConfirmModal
        isOpen={isDeleteRemotePathMappingModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteRemotePathMapping')}
        message={translate('DeleteRemotePathMappingMessageText')}
        confirmLabel={translate('Delete')}
        onConfirm={handleConfirmDeleteRemotePathMapping}
        onCancel={setDeleteRemotePathMappingModalClosed}
      />
    </div>
  );
}

export default RemotePathMapping;
