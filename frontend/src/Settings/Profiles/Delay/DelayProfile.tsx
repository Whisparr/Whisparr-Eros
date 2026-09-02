import classNames from 'classnames';
import React, { useCallback } from 'react';
import { ConnectDragSource } from 'react-dnd';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, kinds } from 'Helpers/Props';
import { Tag } from 'Tags/useTags';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import EditDelayProfileModal from './EditDelayProfileModal';
import {
  DEFAULT_DELAY_PROFILE_ID,
  DelayProfile as DelayProfileModel,
  useDeleteDelayProfile,
} from './useDelayProfiles';
import styles from './DelayProfile.css';

function getDelay(enabled: boolean, delay: number) {
  if (!enabled) {
    return '-';
  }

  if (!delay) {
    return translate('NoDelay');
  }

  if (delay === 1) {
    return translate('OneMinute');
  }

  // TODO: use better units of time than just minutes
  return translate('DelayMinutes', { delay });
}

export interface DelayProfileProps {
  delayProfile: DelayProfileModel;
  tagList: readonly Tag[];
  isDragging: boolean;
  // The drag preview renders the row without a drag handle to connect.
  connectDragSource?: ConnectDragSource;
}

function DelayProfile({
  delayProfile,
  tagList,
  isDragging,
  connectDragSource,
}: Readonly<DelayProfileProps>) {
  const {
    id,
    enableUsenet,
    enableTorrent,
    preferredProtocol,
    usenetDelay,
    torrentDelay,
    tags,
  } = delayProfile;

  const { deleteDelayProfile } = useDeleteDelayProfile(id);

  const [
    isEditDelayProfileModalOpen,
    setEditDelayProfileModalOpen,
    setEditDelayProfileModalClosed,
  ] = useModalOpenState(false);

  const [
    isDeleteDelayProfileModalOpen,
    setDeleteDelayProfileModalOpen,
    setDeleteDelayProfileModalClosed,
  ] = useModalOpenState(false);

  const handleDeleteDelayProfilePress = useCallback(() => {
    setEditDelayProfileModalClosed();
    setDeleteDelayProfileModalOpen();
  }, [setEditDelayProfileModalClosed, setDeleteDelayProfileModalOpen]);

  const handleConfirmDeletePress = useCallback(() => {
    deleteDelayProfile();
  }, [deleteDelayProfile]);

  const dragHandle = (
    <div className={styles.dragHandle}>
      <Icon className={styles.dragIcon} name={icons.REORDER} />
    </div>
  );

  let preferred = titleCase(translate('PreferProtocol', { preferredProtocol }));

  if (!enableUsenet) {
    preferred = translate('OnlyTorrent');
  } else if (!enableTorrent) {
    preferred = translate('OnlyUsenet');
  }

  return (
    <div
      className={classNames(
        styles.delayProfile,
        isDragging && styles.isDragging
      )}
    >
      <div className={styles.column}>{preferred}</div>
      <div className={styles.column}>{getDelay(enableUsenet, usenetDelay)}</div>
      <div className={styles.column}>
        {getDelay(enableTorrent, torrentDelay)}
      </div>

      <TagList tags={tags} tagList={tagList} />

      <div className={styles.actions}>
        <IconButton
          name={icons.EDIT}
          className={
            id === DEFAULT_DELAY_PROFILE_ID ? styles.editButton : undefined
          }
          aria-label={translate('EditDelayProfile')}
          title={translate('EditDelayProfile')}
          onPress={setEditDelayProfileModalOpen}
        />

        {id === DEFAULT_DELAY_PROFILE_ID
          ? null
          : // The preview draws the same handle, connected to nothing.
            (connectDragSource?.(dragHandle) ?? dragHandle)}
      </div>

      <EditDelayProfileModal
        id={id}
        isOpen={isEditDelayProfileModalOpen}
        onModalClose={setEditDelayProfileModalClosed}
        onDeleteDelayProfilePress={handleDeleteDelayProfilePress}
      />

      <ConfirmModal
        isOpen={isDeleteDelayProfileModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteDelayProfile')}
        message={translate('DeleteDelayProfileMessageText')}
        confirmLabel={translate('Delete')}
        onConfirm={handleConfirmDeletePress}
        onCancel={setDeleteDelayProfileModalClosed}
      />
    </div>
  );
}

export default DelayProfile;
