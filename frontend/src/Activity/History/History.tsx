// TODO: Move functions like page handlers, sort handlers, filter handlers, and table option handlers to a custom hook (e.g., useHistoryHandlers) to keep the component cleaner and more focused on rendering.
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { queryClient } from 'App/queryClient';
import AppState from 'App/State/AppState';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import FilterMenu from 'Components/Menu/FilterMenu';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import TablePager from 'Components/Table/TablePager';
import { PropertyFilter } from 'Filters/Filter';
import { align, icons, kinds } from 'Helpers/Props';
import {
  setHistoryFilter,
  setHistorySort,
  setHistoryTableOption,
} from 'Store/Actions/historyActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';
import { TableOptionsChangePayload } from 'typings/Table';
import findSelectedFilters from 'Utilities/Filter/findSelectedFilters';
import {
  registerPagePopulator,
  unregisterPagePopulator,
} from 'Utilities/pagePopulator';
import translate from 'Utilities/String/translate';
import HistoryFilterModal from './HistoryFilterModal';
import HistoryRow from './HistoryRow';
import { useHistory } from './useHistory';

interface HistoryHandlerProps {
  handleFirstPagePress?: () => void;
  handlePreviousPagePress?: () => void;
  handleNextPagePress?: () => void;
  handleLastPagePress?: () => void;
  handlePageSelect?: (page: number) => void;
  handleSortPress?: (sortKey: string) => void;
  handleFilterSelect?: (selectedFilterKey: string | number) => void;
  handleTableOptionChange?: (payload: TableOptionsChangePayload) => void;
}

function History(props: Partial<HistoryHandlerProps>) {
  const [page, setPage] = useState(1);

  const {
    columns,
    selectedFilterKey,
    filters,
    sortKey,
    sortDirection,
    pageSize,
  } = useSelector((state: AppState) => state.history);

  const customFilters = useSelector(createCustomFiltersSelector('history'));
  const dispatch = useDispatch();

  const resolvedFilters = findSelectedFilters(
    selectedFilterKey,
    filters,
    customFilters
  ) as PropertyFilter[];

  const { data, isFetching, isSuccess, isError } = useHistory({
    page,
    pageSize,
    sortKey,
    sortDirection,
    filters: resolvedFilters,
  });

  const items = data?.records ?? [];
  const totalRecords = data?.totalRecords ?? 0;
  const totalPages = Math.max(Math.ceil(totalRecords / pageSize), 1);

  const isFetchingAny = isFetching;
  const isAllPopulated = isSuccess;
  const hasError = isError;

  const {
    handleFirstPagePress: propFirstPage,
    handlePreviousPagePress: propPrevPage,
    handleNextPagePress: propNextPage,
    handleLastPagePress: propLastPage,
    handlePageSelect: propPageSelect,
    handleSortPress: propSort,
    handleFilterSelect: propFilter,
    handleTableOptionChange: propTableOption,
  } = props;

  const internalFirstPagePress = useCallback(() => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ['/history'] });
  }, []);

  const firstPageHandler = propFirstPage ?? internalFirstPagePress;
  const prevPageHandler =
    propPrevPage ?? (() => setPage((p) => Math.max(p - 1, 1)));
  const nextPageHandler =
    propNextPage ?? (() => setPage((p) => Math.min(p + 1, totalPages)));
  const lastPageHandler = propLastPage ?? (() => setPage(totalPages));
  const pageSelectHandler = propPageSelect ?? setPage;

  const handleFilterSelect = useCallback(
    (selectedFilterKey: string | number) => {
      dispatch(setHistoryFilter({ selectedFilterKey }));
      setPage(1);
    },
    [dispatch]
  );

  const handleSortPress = useCallback(
    (sortKey: string) => {
      dispatch(setHistorySort({ sortKey }));
      setPage(1);
    },
    [dispatch]
  );

  const handleTableOptionChange = useCallback(
    (payload: TableOptionsChangePayload) => {
      dispatch(setHistoryTableOption(payload));
      if (payload.pageSize) {
        setPage(1);
      }
    },
    [dispatch]
  );

  const sortHandler = propSort ?? handleSortPress;
  const filterHandler = propFilter ?? handleFilterSelect;
  const tableOptionHandler = propTableOption ?? handleTableOptionChange;

  useEffect(() => {
    const repopulate = () => {
      queryClient.invalidateQueries({ queryKey: ['/history'] });
    };

    registerPagePopulator(repopulate);

    return () => {
      unregisterPagePopulator(repopulate);
    };
  }, []);

  return (
    <PageContent title={translate('History')}>
      <PageToolbar>
        <PageToolbarSection>
          <PageToolbarButton
            label={translate('Refresh')}
            iconName={icons.REFRESH}
            isSpinning={isFetching}
            onPress={firstPageHandler}
          />
        </PageToolbarSection>

        <PageToolbarSection alignContent={align.RIGHT}>
          <TableOptionsModalWrapper
            columns={columns}
            pageSize={pageSize}
            onTableOptionChange={tableOptionHandler}
          >
            <PageToolbarButton
              label={translate('Options')}
              iconName={icons.TABLE}
            />
          </TableOptionsModalWrapper>

          <FilterMenu
            alignMenu={align.RIGHT}
            selectedFilterKey={selectedFilterKey}
            filters={filters}
            customFilters={customFilters}
            filterModalConnectorComponent={HistoryFilterModal}
            onFilterSelect={filterHandler}
          />
        </PageToolbarSection>
      </PageToolbar>

      <PageContentBody>
        {isFetchingAny && !isAllPopulated ? <LoadingIndicator /> : null}

        {!isFetchingAny && hasError ? (
          <Alert kind={kinds.DANGER}>{translate('HistoryLoadError')}</Alert>
        ) : null}

        {isSuccess && !hasError && !items.length ? (
          <Alert kind={kinds.INFO}>{translate('NoHistoryFound')}</Alert>
        ) : null}

        {isAllPopulated && !hasError && items.length ? (
          <div>
            <Table
              columns={columns}
              pageSize={pageSize}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onTableOptionChange={tableOptionHandler}
              onSortPress={sortHandler}
            >
              <TableBody>
                {items.map((item) => {
                  return (
                    <HistoryRow key={item.id} columns={columns} {...item} />
                  );
                })}
              </TableBody>
            </Table>

            <TablePager
              page={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              isFetching={isFetching}
              onFirstPagePress={firstPageHandler}
              onPreviousPagePress={prevPageHandler}
              onNextPagePress={nextPageHandler}
              onLastPagePress={lastPageHandler}
              onPageSelect={pageSelectHandler}
            />
          </div>
        ) : null}
      </PageContentBody>
    </PageContent>
  );
}

export default History;
