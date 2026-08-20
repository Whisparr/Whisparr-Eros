import React, { useCallback, useState } from 'react';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { icons, kinds } from 'Helpers/Props';
import ImportFile from 'typings/ImportFile';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import { useDeleteRootFolder, useRefreshRootFolder } from './useRootFolders';
import styles from './RootFolderRow.css';

interface RootFolderRowProps {
  id: number;
  path: string;
  accessible: boolean;
  freeSpace?: number;
  importFiles: ImportFile[];
}

function RootFolderRow(props: RootFolderRowProps) {
  const { id, path, accessible, freeSpace = 0, importFiles = [] } = props;

  const isUnavailable = !accessible;

  const { deleteRootFolder } = useDeleteRootFolder(id);
  const { refreshRootFolder } = useRefreshRootFolder();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onRefreshPress = useCallback(() => {
    refreshRootFolder({ id });
  }, [refreshRootFolder, id]);

  const onDeletePress = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, [setIsDeleteModalOpen]);

  const onConfirmDelete = useCallback(() => {
    deleteRootFolder();

    setIsDeleteModalOpen(false);
  }, [deleteRootFolder]);

  return (
    <TableRow>
      <TableRowCell>
        {isUnavailable ? (
          <div className={styles.unavailablePath}>
            {path}

            <Label className={styles.unavailableLabel} kind={kinds.DANGER}>
              {translate('Unavailable')}
            </Label>
          </div>
        ) : (
          <Link className={styles.link} to={`/add/import/${id}`}>
            {path}
          </Link>
        )}
      </TableRowCell>

      <TableRowCell className={styles.freeSpace}>
        {isUnavailable || Number.isNaN(Number(freeSpace))
          ? '-'
          : formatBytes(freeSpace)}
      </TableRowCell>

      <TableRowCell className={styles.importFiles}>
        {isUnavailable ? '-' : importFiles.length}
      </TableRowCell>

      <TableRowCell className={styles.actions}>
        <IconButton
          title={translate('ScanImportFolder')}
          name={icons.REFRESH}
          onPress={onRefreshPress}
        />
        <IconButton
          title={translate('RemoveRootFolder')}
          name={icons.REMOVE}
          onPress={onDeletePress}
        />
      </TableRowCell>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('RemoveRootFolder')}
        message={translate('RemoveRootFolderMoviesMessageText', { path })}
        confirmLabel={translate('Remove')}
        onConfirm={onConfirmDelete}
        onCancel={onDeleteModalClose}
      />
    </TableRow>
  );
}

export default RootFolderRow;
