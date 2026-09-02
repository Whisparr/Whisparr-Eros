import React, { useCallback } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, kinds } from 'Helpers/Props';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import { useTagList } from 'Tags/useTags';
import ImportListModel from 'typings/ImportList';
import formatShortTimeSpan from 'Utilities/Date/formatShortTimeSpan';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import translate from 'Utilities/String/translate';
import EditImportListModal from './EditImportListModal';
import { useDeleteImportList } from './useImportLists';
import styles from './ImportList.css';

interface ImportListProps {
  importList: ImportListModel;
  onCloneImportListPress: (id: number) => void;
}

function ImportList({
  importList,
  onCloneImportListPress,
}: Readonly<ImportListProps>) {
  const {
    id,
    name,
    enabled,
    enableAuto,
    tags,
    minRefreshInterval,
    lastInfoSync,
  } = importList;

  const tagList = useTagList();
  const { deleteImportList, isDeleting } = useDeleteImportList(id);

  const { shortDateFormat, timeFormat } = useUiSettingsValues();

  const [
    isEditImportListModalOpen,
    setEditImportListModalOpen,
    setEditImportListModalClosed,
  ] = useModalOpenState(false);

  const [
    isDeleteImportListModalOpen,
    setDeleteImportListModalOpen,
    setDeleteImportListModalClosed,
  ] = useModalOpenState(false);

  const handleDeleteImportListPress = useCallback(() => {
    setEditImportListModalClosed();
    setDeleteImportListModalOpen();
  }, [setEditImportListModalClosed, setDeleteImportListModalOpen]);

  const handleConfirmDeleteImportList = useCallback(() => {
    deleteImportList();
  }, [deleteImportList]);

  const handleCloneImportListPress = useCallback(() => {
    onCloneImportListPress(id);
  }, [id, onCloneImportListPress]);

  return (
    <Card
      className={styles.list}
      overlayContent={true}
      aria-label={translate('EditImportListName', { name })}
      onPress={setEditImportListModalOpen}
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
        onDeleteImportListPress={handleDeleteImportListPress}
        onModalClose={setEditImportListModalClosed}
      />

      <ConfirmModal
        isOpen={isDeleteImportListModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteImportList')}
        message={translate('DeleteImportListMessageText', { name })}
        confirmLabel={translate('Delete')}
        isSpinning={isDeleting}
        onConfirm={handleConfirmDeleteImportList}
        onCancel={setDeleteImportListModalClosed}
      />
    </Card>
  );
}

export default ImportList;
