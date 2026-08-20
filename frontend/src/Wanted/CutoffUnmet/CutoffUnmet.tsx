import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import TablePager from 'Components/Table/TablePager';
import useSelectState from 'Helpers/Hooks/useSelectState';
import { align, icons, kinds } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { CheckInputChanged } from 'typings/inputs';
import { SelectStateInputProps } from 'typings/props';
import { TableOptionsChangePayload } from 'typings/Table';
import {
  registerPagePopulator,
  unregisterPagePopulator,
} from 'Utilities/pagePopulator';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import getMonitoredValue from 'Wanted/getMonitoredValue';
import useToggleMoviesMonitored from 'Wanted/useToggleMoviesMonitored';
import {
  setCutoffUnmetOption,
  setCutoffUnmetOptions,
  setCutoffUnmetSort,
  useCutoffUnmetOptions,
} from './cutoffUnmetOptionsStore';
import CutoffUnmetRow from './CutoffUnmetRow';
import useCutoffUnmet, { FILTERS } from './useCutoffUnmet';

function CutoffUnmet() {
  const executeCommand = useExecuteCommand();

  const { columns, pageSize, selectedFilterKey, sortKey, sortDirection } =
    useCutoffUnmetOptions();

  const {
    records: items,
    totalPages,
    totalRecords,
    isFetching,
    isLoading,
    error,
    refetch,
    page,
    goToPage,
    filters,
  } = useCutoffUnmet();

  const { toggleMoviesMonitored, isToggling } =
    useToggleMoviesMonitored('/wanted/cutoff');

  const isSearchingForAllMovies = useCommandExecuting(
    commandNames.CUTOFF_UNMET_MOVIES_SEARCH
  );
  const isSearchingForSelectedMovies = useCommandExecuting(
    commandNames.MOVIE_SEARCH
  );

  const [selectState, setSelectState] = useSelectState();
  const { allSelected, allUnselected, selectedState } = selectState;

  const [isConfirmSearchAllModalOpen, setIsConfirmSearchAllModalOpen] =
    useState(false);

  const selectedIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const itemsSelected = !!selectedIds.length;
  const isShowingMonitored = getMonitoredValue(filters);
  const isSearchingForMovies =
    isSearchingForAllMovies || isSearchingForSelectedMovies;

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

  const handleSearchSelectedPress = useCallback(() => {
    executeCommand({
      name: commandNames.MOVIE_SEARCH,
      movieIds: selectedIds,
      commandFinished: () => {
        refetch();
      },
    });
  }, [selectedIds, refetch, executeCommand]);

  const handleSearchAllPress = useCallback(() => {
    setIsConfirmSearchAllModalOpen(true);
  }, []);

  const handleConfirmSearchAllCutoffUnmetModalClose = useCallback(() => {
    setIsConfirmSearchAllModalOpen(false);
  }, []);

  const handleSearchAllCutoffUnmetConfirmed = useCallback(() => {
    executeCommand({
      name: commandNames.CUTOFF_UNMET_MOVIES_SEARCH,
      commandFinished: () => {
        refetch();
      },
    });

    setIsConfirmSearchAllModalOpen(false);
  }, [refetch, executeCommand]);

  const handleToggleSelectedPress = useCallback(() => {
    toggleMoviesMonitored({
      movieIds: selectedIds,
      monitored: !isShowingMonitored,
    });
  }, [isShowingMonitored, selectedIds, toggleMoviesMonitored]);

  const handleFilterSelect = useCallback(
    (filterKey: number | string) => {
      setCutoffUnmetOption('selectedFilterKey', filterKey);
      goToPage(1);
    },
    [goToPage]
  );

  const handleSortPress = useCallback(
    (sortKey: string, sortDirection?: SortDirection) => {
      setCutoffUnmetSort({ sortKey, sortDirection });
    },
    []
  );

  const handleTableOptionChange = useCallback(
    (payload: TableOptionsChangePayload) => {
      setCutoffUnmetOptions(payload);

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
    const repopulate = () => {
      refetch();
    };

    registerPagePopulator(repopulate, [
      'movieUpdated',
      'movieFileUpdated',
      'movieFileDeleted',
    ]);

    return () => {
      unregisterPagePopulator(repopulate);
    };
  }, [refetch]);

  return (
    <PageContent title={translate('CutoffUnmet')}>
      <PageToolbar>
        <PageToolbarSection>
          <PageToolbarButton
            label={
              itemsSelected
                ? translate('SearchSelected')
                : translate('SearchAll')
            }
            iconName={icons.SEARCH}
            isDisabled={isSearchingForMovies}
            isSpinning={isSearchingForMovies}
            onPress={
              itemsSelected ? handleSearchSelectedPress : handleSearchAllPress
            }
          />

          <PageToolbarSeparator />

          <PageToolbarButton
            label={
              isShowingMonitored
                ? translate('UnmonitorSelected')
                : translate('MonitorSelected')
            }
            iconName={icons.MONITORED}
            isDisabled={!itemsSelected}
            isSpinning={isToggling}
            onPress={handleToggleSelectedPress}
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
            customFilters={[]}
            onFilterSelect={handleFilterSelect}
          />
        </PageToolbarSection>
      </PageToolbar>

      <PageContentBody>
        {isFetching && isLoading ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>{translate('CutoffUnmetLoadError')}</Alert>
        ) : null}

        {!isLoading && !error && !items.length ? (
          <Alert kind={kinds.INFO}>{translate('CutoffUnmetNoItems')}</Alert>
        ) : null}

        {!isLoading && !error && !!items.length ? (
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
                    <CutoffUnmetRow
                      key={item.id}
                      isSelected={selectedState[item.id]}
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

            <ConfirmModal
              isOpen={isConfirmSearchAllModalOpen}
              kind={kinds.DANGER}
              title={translate('SearchForCutoffUnmetMovies')}
              message={
                <div>
                  <div>
                    {translate('SearchForCutoffUnmetMoviesConfirmationCount', {
                      totalRecords,
                    })}
                  </div>
                  <div>{translate('MassSearchCancelWarning')}</div>
                </div>
              }
              confirmLabel={translate('Search')}
              onConfirm={handleSearchAllCutoffUnmetConfirmed}
              onCancel={handleConfirmSearchAllCutoffUnmetModalClose}
            />
          </div>
        ) : null}
      </PageContentBody>
    </PageContent>
  );
}

export default CutoffUnmet;
