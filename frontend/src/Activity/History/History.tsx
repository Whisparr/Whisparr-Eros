import React, { useCallback } from 'react';
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
import { Filter as AppStateFilter } from 'Filters/Filter';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import { align, icons, kinds } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { TableOptionsChangePayload } from 'typings/Table';
import translate from 'Utilities/String/translate';
import HistoryFilterModal from './HistoryFilterModal';
import {
  setHistoryOption,
  setHistoryOptions,
  setHistorySort,
  useHistoryOptions,
} from './historyOptionsStore';
import HistoryRow from './HistoryRow';
import useHistory, { FILTERS } from './useHistory';

function History() {
  const { columns, pageSize, selectedFilterKey, sortKey, sortDirection } =
    useHistoryOptions();

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
  } = useHistory();

  const customFilters = useCustomFiltersList('history');

  const handleFilterSelect = useCallback(
    (selectedFilterKey: string | number) => {
      setHistoryOption('selectedFilterKey', selectedFilterKey);
      goToPage(1);
    },
    [goToPage]
  );

  const handleSortPress = useCallback(
    (sortKey: string, sortDirection?: SortDirection) => {
      setHistorySort({ sortKey, sortDirection });
    },
    []
  );

  const handleTableOptionChange = useCallback(
    (payload: TableOptionsChangePayload) => {
      setHistoryOptions(payload);

      if (payload.pageSize) {
        goToPage(1);
      }
    },
    [goToPage]
  );

  const handleRefreshPress = useCallback(() => {
    goToPage(1);
    refetch();
  }, [goToPage, refetch]);

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

  return (
    <PageContent title={translate('History')}>
      <PageToolbar>
        <PageToolbarSection>
          <PageToolbarButton
            label={translate('Refresh')}
            iconName={icons.REFRESH}
            isSpinning={isFetching}
            onPress={handleRefreshPress}
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
            filterModalConnectorComponent={HistoryFilterModal}
            filterModalConnectorComponentProps={{ sectionItems: items }}
            onFilterSelect={handleFilterSelect}
          />
        </PageToolbarSection>
      </PageToolbar>

      <PageContentBody>
        {isLoading && !isFetched ? <LoadingIndicator /> : null}

        {!isLoading && !!error ? (
          <Alert kind={kinds.DANGER}>{translate('HistoryLoadError')}</Alert>
        ) : null}

        {isFetched && !error && !items.length ? (
          <Alert kind={kinds.INFO}>{translate('NoHistoryFound')}</Alert>
        ) : null}

        {isFetched && !error && !!items.length ? (
          <div>
            <Table
              columns={columns}
              pageSize={pageSize}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onTableOptionChange={handleTableOptionChange}
              onSortPress={handleSortPress}
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
              onFirstPagePress={handleFirstPagePress}
              onPreviousPagePress={handlePreviousPagePress}
              onNextPagePress={handleNextPagePress}
              onLastPagePress={handleLastPagePress}
              onPageSelect={goToPage}
            />
          </div>
        ) : null}
      </PageContentBody>
    </PageContent>
  );
}

export default History;
