import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import React, { useCallback } from 'react';
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
import styles from './DelayProfile.module.css';

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
  // Position in the sortable list; the default profile sits outside it.
  index: number;
}

function DelayProfile({
  delayProfile,
  tagList,
  index,
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

  const isDefault = id === DEFAULT_DELAY_PROFILE_ID;

  const { ref, handleRef, isDragging } = useSortable({
    id,
    index,
    disabled: isDefault,
  });

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

  let preferred = titleCase(translate('PreferProtocol', { preferredProtocol }));

  if (!enableUsenet) {
    preferred = translate('OnlyTorrent');
  } else if (!enableTorrent) {
    preferred = translate('OnlyUsenet');
  }

  return (
    <div ref={ref} className={isDefault ? undefined : styles.container}>
      <div
        className={classNames(
          styles.delayProfile,
          isDragging && styles.isDragging
        )}
      >
        <div className={styles.column}>{preferred}</div>
        <div className={styles.column}>
          {getDelay(enableUsenet, usenetDelay)}
        </div>
        <div className={styles.column}>
          {getDelay(enableTorrent, torrentDelay)}
        </div>

        <TagList tags={tags} tagList={tagList} />

        <div className={styles.actions}>
          <IconButton
            name={icons.EDIT}
            className={isDefault ? styles.editButton : undefined}
            aria-label={translate('EditDelayProfile')}
            title={translate('EditDelayProfile')}
            onPress={setEditDelayProfileModalOpen}
          />

          {isDefault ? null : (
            <div ref={handleRef} className={styles.dragHandle}>
              <Icon className={styles.dragIcon} name={icons.REORDER} />
            </div>
          )}
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
    </div>
  );
}

export default DelayProfile;
