import React, { useCallback } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { kinds } from 'Helpers/Props';
import { useDeleteNotification } from 'Settings/Notifications/useNotifications';
import { useTagList } from 'Tags/useTags';
import NotificationModel from 'typings/Notification';
import translate from 'Utilities/String/translate';
import EditNotificationModal from './EditNotificationModal';
import styles from './Notification.css';

interface NotificationProps {
  notification: NotificationModel;
}

function Notification({ notification }: Readonly<NotificationProps>) {
  const {
    id,
    name,
    onGrab,
    onDownload,
    onUpgrade,
    onRename,
    onMovieAdded,
    onMovieDelete,
    onMovieFileDelete,
    onMovieFileDeleteForUpgrade,
    onHealthIssue,
    onHealthRestored,
    onApplicationUpdate,
    onManualInteractionRequired,
    supportsOnGrab,
    supportsOnDownload,
    supportsOnUpgrade,
    supportsOnRename,
    supportsOnMovieAdded,
    supportsOnMovieDelete,
    supportsOnMovieFileDelete,
    supportsOnMovieFileDeleteForUpgrade,
    supportsOnHealthIssue,
    supportsOnHealthRestored,
    supportsOnApplicationUpdate,
    supportsOnManualInteractionRequired,
    tags,
  } = notification;

  const tagList = useTagList();
  const { deleteNotification, isDeleting } = useDeleteNotification(id);

  const [
    isEditNotificationModalOpen,
    setEditNotificationModalOpen,
    setEditNotificationModalClosed,
  ] = useModalOpenState(false);

  const [
    isDeleteNotificationModalOpen,
    setDeleteNotificationModalOpen,
    setDeleteNotificationModalClosed,
  ] = useModalOpenState(false);

  const handleDeleteNotificationPress = useCallback(() => {
    setEditNotificationModalClosed();
    setDeleteNotificationModalOpen();
  }, [setEditNotificationModalClosed, setDeleteNotificationModalOpen]);

  const handleConfirmDeleteNotification = useCallback(() => {
    deleteNotification();
  }, [deleteNotification]);

  return (
    <Card
      className={styles.notification}
      overlayContent={true}
      aria-label={translate('EditConnectionName', { name })}
      onPress={setEditNotificationModalOpen}
    >
      <div className={styles.name}>{name}</div>

      {supportsOnGrab && onGrab ? (
        <Label kind={kinds.SUCCESS}>{translate('OnGrab')}</Label>
      ) : null}

      {supportsOnDownload && onDownload ? (
        <Label kind={kinds.SUCCESS}>{translate('OnImport')}</Label>
      ) : null}

      {supportsOnUpgrade && onDownload && onUpgrade ? (
        <Label kind={kinds.SUCCESS}>{translate('OnUpgrade')}</Label>
      ) : null}

      {supportsOnRename && onRename ? (
        <Label kind={kinds.SUCCESS}>{translate('OnRename')}</Label>
      ) : null}

      {supportsOnMovieAdded && onMovieAdded ? (
        <Label kind={kinds.SUCCESS}>{translate('OnMovieAdded')}</Label>
      ) : null}

      {supportsOnHealthIssue && onHealthIssue ? (
        <Label kind={kinds.SUCCESS}>{translate('OnHealthIssue')}</Label>
      ) : null}

      {supportsOnHealthRestored && onHealthRestored ? (
        <Label kind={kinds.SUCCESS}>{translate('OnHealthRestored')}</Label>
      ) : null}

      {supportsOnApplicationUpdate && onApplicationUpdate ? (
        <Label kind={kinds.SUCCESS}>{translate('OnApplicationUpdate')}</Label>
      ) : null}

      {supportsOnMovieDelete && onMovieDelete ? (
        <Label kind={kinds.SUCCESS}>{translate('OnMovieDelete')}</Label>
      ) : null}

      {supportsOnMovieFileDelete && onMovieFileDelete ? (
        <Label kind={kinds.SUCCESS}>{translate('OnMovieFileDelete')}</Label>
      ) : null}

      {supportsOnMovieFileDeleteForUpgrade &&
      onMovieFileDelete &&
      onMovieFileDeleteForUpgrade ? (
        <Label kind={kinds.SUCCESS}>
          {translate('OnMovieFileDeleteForUpgrade')}
        </Label>
      ) : null}

      {supportsOnManualInteractionRequired && onManualInteractionRequired ? (
        <Label kind={kinds.SUCCESS}>
          {translate('OnManualInteractionRequired')}
        </Label>
      ) : null}

      {!onGrab &&
      !onDownload &&
      !onRename &&
      !onHealthIssue &&
      !onHealthRestored &&
      !onApplicationUpdate &&
      !onMovieAdded &&
      !onMovieDelete &&
      !onMovieFileDelete &&
      !onManualInteractionRequired ? (
        <Label kind={kinds.DISABLED} outline={true}>
          {translate('Disabled')}
        </Label>
      ) : null}

      <TagList tags={tags} tagList={tagList} />

      <EditNotificationModal
        id={id}
        isOpen={isEditNotificationModalOpen}
        onDeleteNotificationPress={handleDeleteNotificationPress}
        onModalClose={setEditNotificationModalClosed}
      />

      <ConfirmModal
        isOpen={isDeleteNotificationModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteNotification')}
        message={translate('DeleteNotificationMessageText', { name })}
        confirmLabel={translate('Delete')}
        isSpinning={isDeleting}
        onConfirm={handleConfirmDeleteNotification}
        onCancel={setDeleteNotificationModalClosed}
      />
    </Card>
  );
}

export default Notification;
