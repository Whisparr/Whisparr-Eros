import React, { useCallback } from 'react';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableSelectCell from 'Components/Table/Cells/TableSelectCell';
import TableRow from 'Components/Table/TableRow';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, kinds } from 'Helpers/Props';
import ImportListExclusion from 'typings/ImportListExclusion';
import { SelectStateInputProps } from 'typings/props';
import translate from 'Utilities/String/translate';
import EditImportListExclusionModal from './EditImportListExclusionModal';
import { useDeleteImportListExclusion } from './useImportListExclusions';
import styles from './ImportListExclusionRow.css';

interface ImportListExclusionRowProps {
  importListExclusion: ImportListExclusion;
  isSelected: boolean;
  onSelectedChange: (options: SelectStateInputProps) => void;
}

// The whole record rather than its fields, because the edit modal saves what
// it was handed: the row is the only place the exclusion is held now that
// there is no store to read it back out of.
function ImportListExclusionRow({
  importListExclusion,
  isSelected,
  onSelectedChange,
}: Readonly<ImportListExclusionRowProps>) {
  const { id, foreignId, type, reason, movieTitle } = importListExclusion;

  const { deleteImportListExclusion } = useDeleteImportListExclusion(id);

  const [
    isEditImportListExclusionModalOpen,
    setEditImportListExclusionModalOpen,
    setEditImportListExclusionModalClosed,
  ] = useModalOpenState(false);

  const [
    isDeleteImportListExclusionModalOpen,
    setDeleteImportListExclusionModalOpen,
    setDeleteImportListExclusionModalClosed,
  ] = useModalOpenState(false);

  const handleDeletePress = useCallback(() => {
    deleteImportListExclusion();
  }, [deleteImportListExclusion]);

  return (
    <TableRow>
      <TableSelectCell
        id={id}
        isSelected={isSelected}
        onSelectedChange={onSelectedChange}
      />

      <TableRowCell>{movieTitle}</TableRowCell>
      <TableRowCell className={styles.foreignId}>{foreignId}</TableRowCell>
      <TableRowCell>{type}</TableRowCell>
      <TableRowCell>{reason}</TableRowCell>

      <TableRowCell className={styles.actions}>
        <IconButton
          name={icons.EDIT}
          onPress={setEditImportListExclusionModalOpen}
        />
      </TableRowCell>

      <EditImportListExclusionModal
        importListExclusion={importListExclusion}
        isOpen={isEditImportListExclusionModalOpen}
        onModalClose={setEditImportListExclusionModalClosed}
        onDeleteImportListExclusionPress={setDeleteImportListExclusionModalOpen}
      />

      <ConfirmModal
        isOpen={isDeleteImportListExclusionModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteImportListExclusion')}
        message={translate('DeleteImportListExclusionMessageText')}
        confirmLabel={translate('Delete')}
        onConfirm={handleDeletePress}
        onCancel={setDeleteImportListExclusionModalClosed}
      />
    </TableRow>
  );
}

export default ImportListExclusionRow;
