import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SelectProvider } from 'App/SelectContext';
import { Filter as AppStateFilter } from 'App/State/AppState';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import FilterMenu from 'Components/Menu/FilterMenu';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import TablePager from 'Components/Table/TablePager';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import usePrevious from 'Helpers/Hooks/usePrevious';
import useSelectState from 'Helpers/Hooks/useSelectState';
import { align, icons, kinds } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { CheckInputChanged } from 'typings/inputs';
import { SelectStateInputProps } from 'typings/props';
import { TableOptionsChangePayload } from 'typings/Table';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import BlocklistFilterModal from './BlocklistFilterModal';
import {
  setBlocklistOption,
  setBlocklistOptions,
  setBlocklistSort,
  useBlocklistOptions,
} from './blocklistOptionsStore';
import BlocklistRow from './BlocklistRow';
import useBlocklist, { FILTERS, useRemoveBlocklistItems } from './useBlocklist';

function Blocklist() {
  const executeCommand = useExecuteCommand();

  const { columns, pageSize, selectedFilterKey, sortKey, sortDirection } =
    useBlocklistOptions();

  const {
    records: items,
    totalPages,
    totalRecords,
    isFetching,
    isFetched,
    isLoading,
    error,
    refetch,
    page,
    goToPage,
  } = useBlocklist();

  const { removeBlocklistItems, isRemoving } = useRemoveBlocklistItems();

  const customFilters = useCustomFiltersList('blocklist');
  const isClearingBlocklistExecuting = useCommandExecuting(
    commandNames.CLEAR_BLOCKLIST
  );

  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [isConfirmClearModalOpen, setIsConfirmClearModalOpen] = useState(false);

  const [selectState, setSelectState] = useSelectState();
  const { allSelected, allUnselected, selectedState } = selectState;

  const selectedIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const wasClearingBlocklistExecuting = usePrevious(
    isClearingBlocklistExecuting
  );

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

  const handleRemoveSelectedPress = useCallback(() => {
    setIsConfirmRemoveModalOpen(true);
  }, [setIsConfirmRemoveModalOpen]);

  const handleRemoveSelectedConfirmed = useCallback(() => {
    removeBlocklistItems({ ids: selectedIds });
    setIsConfirmRemoveModalOpen(false);
  }, [selectedIds, setIsConfirmRemoveModalOpen, removeBlocklistItems]);

  const handleConfirmRemoveModalClose = useCallback(() => {
    setIsConfirmRemoveModalOpen(false);
  }, [setIsConfirmRemoveModalOpen]);

  const handleClearBlocklistPress = useCallback(() => {
    setIsConfirmClearModalOpen(true);
  }, [setIsConfirmClearModalOpen]);

  const handleClearBlocklistConfirmed = useCallback(() => {
    executeCommand({ name: commandNames.CLEAR_BLOCKLIST });
    setIsConfirmClearModalOpen(false);
  }, [setIsConfirmClearModalOpen, executeCommand]);

  const handleConfirmClearModalClose = useCallback(() => {
    setIsConfirmClearModalOpen(false);
  }, [setIsConfirmClearModalOpen]);

  const handleFilterSelect = useCallback(
    (selectedFilterKey: string | number) => {
      setBlocklistOption('selectedFilterKey', selectedFilterKey);
      goToPage(1);
    },
    [goToPage]
  );

  const handleSortPress = useCallback(
    (sortKey: string, sortDirection?: SortDirection) => {
      setBlocklistSort({ sortKey, sortDirection });
    },
    []
  );

  const handleTableOptionChange = useCallback(
    (payload: TableOptionsChangePayload) => {
      setBlocklistOptions(payload);

      if (payload.pageSize) {
        goToPage(1);
      }
    },
    [goToPage]
  );

  const handleFirstPagePress = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const handlePreviousPagePress = useCallback(() => {
    goToPage(Math.max(page - 1, 1));
  }, [goToPage, page]);

  const handleNextPagePress = useCallback(() => {
    goToPage(Math.min(page + 1, totalPages));
  }, [goToPage, page, totalPages]);

  const handleLastPagePress = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  useEffect(() => {
    if (wasClearingBlocklistExecuting && !isClearingBlocklistExecuting) {
      goToPage(1);
      refetch();
    }
  }, [
    isClearingBlocklistExecuting,
    wasClearingBlocklistExecuting,
    goToPage,
    refetch,
  ]);

  return (
    <SelectProvider items={items}>
      <PageContent title={translate('Blocklist')}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('RemoveSelected')}
              iconName={icons.REMOVE}
              isDisabled={!selectedIds.length}
              isSpinning={isRemoving}
              onPress={handleRemoveSelectedPress}
            />

            <PageToolbarButton
              label={translate('Clear')}
              iconName={icons.CLEAR}
              isDisabled={!items.length}
              isSpinning={isClearingBlocklistExecuting}
              onPress={handleClearBlocklistPress}
            />
          </PageToolbarSection>

          <PageToolbarSection alignContent={align.RIGHT}>
            <TableOptionsModalWrapper
              columns={columns}
              pageSize={pageSize}
              onTableOptionChange={handleTableOptionChange}
            >
              <PageToolbarButton
                label={translate('Options')}
                iconName={icons.TABLE}
              />
            </TableOptionsModalWrapper>

            <FilterMenu
              alignMenu={align.RIGHT}
              selectedFilterKey={selectedFilterKey}
              filters={FILTERS as unknown as AppStateFilter[]}
              customFilters={customFilters}
              filterModalConnectorComponent={BlocklistFilterModal}
              filterModalConnectorComponentProps={{ sectionItems: items }}
              onFilterSelect={handleFilterSelect}
            />
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody>
          {isLoading && !isFetched ? <LoadingIndicator /> : null}

          {!isLoading && !!error ? (
            <Alert kind={kinds.DANGER}>{translate('BlocklistLoadError')}</Alert>
          ) : null}

          {isFetched && !error && !items.length ? (
            <Alert kind={kinds.INFO}>
              {selectedFilterKey === 'all'
                ? translate('NoBlocklistItems')
                : translate('BlocklistFilterHasNoItems')}
            </Alert>
          ) : null}

          {isFetched && !error && !!items.length ? (
            <div>
              <Table
                selectAll={true}
                allSelected={allSelected}
                allUnselected={allUnselected}
                columns={columns}
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
                      <BlocklistRow
                        key={item.id}
                        isSelected={selectedState[item.id] || false}
                        columns={columns}
                        {...item}
                        onSelectedChange={handleSelectedChange}
                      />
                    );
                  })}
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
            </div>
          ) : null}
        </PageContentBody>

        <ConfirmModal
          isOpen={isConfirmRemoveModalOpen}
          kind={kinds.DANGER}
          title={translate('RemoveSelected')}
          message={translate('RemoveSelectedBlocklistMessageText')}
          confirmLabel={translate('RemoveSelected')}
          onConfirm={handleRemoveSelectedConfirmed}
          onCancel={handleConfirmRemoveModalClose}
        />

        <ConfirmModal
          isOpen={isConfirmClearModalOpen}
          kind={kinds.DANGER}
          title={translate('ClearBlocklist')}
          message={translate('ClearBlocklistMessageText')}
          confirmLabel={translate('Clear')}
          onConfirm={handleClearBlocklistConfirmed}
          onCancel={handleConfirmClearModalClose}
        />
      </PageContent>
    </SelectProvider>
  );
}

export default Blocklist;
