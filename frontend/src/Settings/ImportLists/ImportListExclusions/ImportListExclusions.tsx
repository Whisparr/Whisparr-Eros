import React, { useCallback, useMemo, useState } from 'react';
import FieldSet from 'Components/FieldSet';
import IconButton from 'Components/Link/IconButton';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageSectionContent from 'Components/Page/PageSectionContent';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TablePager from 'Components/Table/TablePager';
import TableRow from 'Components/Table/TableRow';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import useSelectState from 'Helpers/Hooks/useSelectState';
import { icons, kinds } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { CheckInputChanged } from 'typings/inputs';
import { SelectStateInputProps } from 'typings/props';
import { TableOptionsChangePayload } from 'typings/Table';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import EditImportListExclusionModal from './EditImportListExclusionModal';
import {
  setImportListExclusionOption,
  setImportListExclusionSort,
  useImportListExclusionOptions,
} from './importListExclusionOptionsStore';
import ImportListExclusionRow from './ImportListExclusionRow';
import useImportListExclusions, {
  useDeleteImportListExclusions,
} from './useImportListExclusions';
import styles from './ImportListExclusions.css';

const COLUMNS: Column[] = [
  {
    name: 'movieTitle',
    label: () => translate('Title'),
    isVisible: true,
    isSortable: true,
  },
  {
    name: 'foreignId',
    label: () => translate('ForeignId'),
    isVisible: true,
    isSortable: true,
  },
  {
    name: 'type',
    label: () => translate('Type'),
    isVisible: true,
    isSortable: true,
  },
  {
    name: 'reason',
    label: () => translate('Reason'),
    isVisible: true,
    isSortable: true,
  },
  {
    className: styles.actions,
    name: 'actions',
    label: '',
    isVisible: true,
    isSortable: false,
  },
];

function ImportListExclusions() {
  const {
    records: items,
    totalPages,
    totalRecords,
    isFetching,
    isFetched,
    error,
    page,
    goToPage,
  } = useImportListExclusions();

  const { pageSize, sortKey, sortDirection } = useImportListExclusionOptions();

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);

  const [selectState, setSelectState] = useSelectState();
  const { allSelected, allUnselected, selectedState } = selectState;

  const selectedIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const handleDeleteSelectedSuccess = useCallback(() => {
    setSelectState({ type: 'unselectAll', items });
  }, [items, setSelectState]);

  const { deleteImportListExclusions, isDeleting } =
    useDeleteImportListExclusions(handleDeleteSelectedSuccess);

  const handleSelectAllChange = useCallback(
    ({ value }: CheckInputChanged) => {
      setSelectState({ type: value ? 'selectAll' : 'unselectAll', items });
    },
    [items, setSelectState]
  );

  const handleSelectedChange = useCallback(
    ({ id, value, shiftKey = false }: SelectStateInputProps) => {
      setSelectState({
        type: 'toggleSelected',
        items,
        id,
        isSelected: value,
        shiftKey,
      });
    },
    [items, setSelectState]
  );

  const handleDeleteSelectedPress = useCallback(() => {
    setIsConfirmDeleteModalOpen(true);
  }, []);

  const handleDeleteSelectedConfirmed = useCallback(() => {
    deleteImportListExclusions(selectedIds);
    setIsConfirmDeleteModalOpen(false);
  }, [selectedIds, deleteImportListExclusions]);

  const handleConfirmDeleteModalClose = useCallback(() => {
    setIsConfirmDeleteModalOpen(false);
  }, []);

  const handleFirstPagePress = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const handlePreviousPagePress = useCallback(() => {
    goToPage(Math.max(page - 1, 1));
  }, [page, goToPage]);

  const handleNextPagePress = useCallback(() => {
    goToPage(Math.min(page + 1, totalPages));
  }, [page, totalPages, goToPage]);

  const handleLastPagePress = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);

  const handleSortPress = useCallback(
    (sortKey: string, sortDirection?: SortDirection) => {
      setImportListExclusionSort({ sortKey, sortDirection });
    },
    []
  );

  // The table cannot modify its columns, so a page size is the only option it
  // can change -- and changing it invalidates which page the user is on.
  const handleTableOptionChange = useCallback(
    ({ pageSize }: TableOptionsChangePayload) => {
      if (pageSize) {
        setImportListExclusionOption('pageSize', pageSize);
        goToPage(1);
      }
    },
    [goToPage]
  );

  const [
    isAddImportListExclusionModalOpen,
    setAddImportListExclusionModalOpen,
    setAddImportListExclusionModalClosed,
  ] = useModalOpenState(false);

  return (
    <FieldSet legend={translate('ImportListExclusions')}>
      <PageSectionContent
        errorMessage={translate('ImportListExclusionsLoadError')}
        isFetching={isFetching}
        isPopulated={isFetched}
        error={error ?? undefined}
      >
        <Table
          selectAll={true}
          allSelected={allSelected}
          allUnselected={allUnselected}
          columns={COLUMNS}
          canModifyColumns={false}
          pageSize={pageSize}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onTableOptionChange={handleTableOptionChange}
          onSelectAllChange={handleSelectAllChange}
          onSortPress={handleSortPress}
        >
          <TableBody>
            {items.map((item) => {
              return (
                <ImportListExclusionRow
                  key={item.id}
                  importListExclusion={item}
                  isSelected={selectedState[item.id] || false}
                  onSelectedChange={handleSelectedChange}
                />
              );
            })}

            <TableRow>
              <TableRowCell colSpan={5}>
                <SpinnerButton
                  kind={kinds.DANGER}
                  isSpinning={isDeleting}
                  isDisabled={!selectedIds.length}
                  onPress={handleDeleteSelectedPress}
                >
                  {translate('Delete')}
                </SpinnerButton>
              </TableRowCell>

              <TableRowCell>
                <IconButton
                  name={icons.ADD}
                  aria-label={translate('Add')}
                  onPress={setAddImportListExclusionModalOpen}
                />
              </TableRowCell>
            </TableRow>
          </TableBody>
        </Table>

        <TablePager
          page={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          isFetching={isFetching}
          onFirstPagePress={handleFirstPagePress}
          onPreviousPagePress={handlePreviousPagePress}
          onNextPagePress={handleNextPagePress}
          onLastPagePress={handleLastPagePress}
          onPageSelect={goToPage}
        />

        <EditImportListExclusionModal
          isOpen={isAddImportListExclusionModalOpen}
          onModalClose={setAddImportListExclusionModalClosed}
        />

        <ConfirmModal
          isOpen={isConfirmDeleteModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteSelected')}
          message={translate('DeleteSelectedImportListExclusionsMessageText')}
          confirmLabel={translate('DeleteSelected')}
          onConfirm={handleDeleteSelectedConfirmed}
          onCancel={handleConfirmDeleteModalClose}
        />
      </PageSectionContent>
    </FieldSet>
  );
}

export default ImportListExclusions;
