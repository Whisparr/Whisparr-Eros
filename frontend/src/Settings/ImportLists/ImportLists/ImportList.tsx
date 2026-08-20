import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import { icons, kinds } from 'Helpers/Props';
import { deleteImportList } from 'Store/Actions/settingsActions';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import { useTagList } from 'Tags/useTags';
import formatShortTimeSpan from 'Utilities/Date/formatShortTimeSpan';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import translate from 'Utilities/String/translate';
import EditImportListModal from './EditImportListModal';
import styles from './ImportList.css';

interface ImportListProps {
  id: number;
  name: string;
  enabled: boolean;
  enableAuto: boolean;
  tags: number[];
  minRefreshInterval: string;
  lastInfoSync: string;
  onCloneImportListPress: (id: number) => void;
}

function ImportList({
  id,
  name,
  enabled,
  enableAuto,
  tags,
  minRefreshInterval,
  lastInfoSync,
  onCloneImportListPress,
}: ImportListProps) {
  const dispatch = useDispatch();
  const tagList = useTagList();

  const { shortDateFormat, timeFormat } = useSelector(
    createUISettingsSelector()
  );

  const [isEditImportListModalOpen, setIsEditImportListModalOpen] =
    useState(false);

  const [isDeleteImportListModalOpen, setIsDeleteImportListModalOpen] =
    useState(false);

  const handleEditImportListPress = useCallback(() => {
    setIsEditImportListModalOpen(true);
  }, []);

  const handleEditImportListModalClose = useCallback(() => {
    setIsEditImportListModalOpen(false);
  }, []);

  const handleDeleteImportListPress = useCallback(() => {
    setIsEditImportListModalOpen(false);
    setIsDeleteImportListModalOpen(true);
  }, []);

  const handleDeleteImportListModalClose = useCallback(() => {
    setIsDeleteImportListModalOpen(false);
  }, []);

  const handleConfirmDeleteImportList = useCallback(() => {
    dispatch(deleteImportList({ id }));
  }, [id, dispatch]);

  const handleCloneImportListPress = useCallback(() => {
    onCloneImportListPress(id);
  }, [id, onCloneImportListPress]);

  return (
    <Card
      className={styles.list}
      overlayContent={true}
      onPress={handleEditImportListPress}
    >
      <div className={styles.nameContainer}>
        <div className={styles.name}>{name}</div>

        <IconButton
          className={styles.cloneButton}
          title={translate('CloneImportList')}
          name={icons.CLONE}
          onPress={handleCloneImportListPress}
        />
      </div>

      <div className={styles.enabled}>
        {enabled ? (
          <Label kind={kinds.SUCCESS}>{translate('Enabled')}</Label>
        ) : (
          <Label kind={kinds.DISABLED} outline={true}>
            {translate('Disabled')}
          </Label>
        )}

        {enableAuto ? (
          <Label kind={kinds.SUCCESS}>{translate('AutomaticAdd')}</Label>
        ) : null}
      </div>

      <TagList tags={tags} tagList={tagList} />

      <div className={styles.enabled}>
        <Label kind={kinds.DEFAULT} title={translate('ListRefreshInterval')}>
          {`${translate('Refresh')}: ${formatShortTimeSpan(
            minRefreshInterval
          )}`}
        </Label>
      </div>

      {lastInfoSync && (
        <div className={styles.enabled}>
          <Label kind={kinds.DEFAULT} title={translate('Refreshed')}>
            {`${translate('Refreshed')}: ${getRelativeDate({
              date: lastInfoSync,
              shortDateFormat,
              timeFormat,
              showRelativeDates: true,
              timeForToday: true,
            })}`}
          </Label>
        </div>
      )}

      <EditImportListModal
        id={id}
        isOpen={isEditImportListModalOpen}
        onModalClose={handleEditImportListModalClose}
        onDeleteImportListPress={handleDeleteImportListPress}
      />

      <ConfirmModal
        isOpen={isDeleteImportListModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteImportList')}
        message={translate('DeleteImportListMessageText', { name })}
        confirmLabel={translate('Delete')}
        onConfirm={handleConfirmDeleteImportList}
        onCancel={handleDeleteImportListModalClose}
      />
    </Card>
  );
}

export default ImportList;
