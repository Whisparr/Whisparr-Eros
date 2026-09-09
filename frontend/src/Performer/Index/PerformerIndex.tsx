import React, { useEffect, useRef } from 'react';
import { SelectProvider, useSelect } from 'App/SelectContext';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import TablePager from 'Components/Table/TablePager';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import { align, icons } from 'Helpers/Props';
import MovieIndexSelectAllButton from 'Movie/Index/Select/MovieIndexSelectAllButton';
import MovieIndexSelectAllMenuItem from 'Movie/Index/Select/MovieIndexSelectAllMenuItem';
import MovieIndexSelectModeButton from 'Movie/Index/Select/MovieIndexSelectModeButton';
import MovieIndexSelectModeMenuItem from 'Movie/Index/Select/MovieIndexSelectModeMenuItem';
import NoPerformer from 'Performer/NoPerformer';
import translate from 'Utilities/String/translate';
import PerformerIndexFilterMenu from './Menus/PerformerIndexFilterMenu';
import PerformerIndexSortMenu from './Menus/PerformerIndexSortMenu';
import PerformerIndexViewMenu from './Menus/PerformerIndexViewMenu';
import PerformerIndexRefreshPerformerButton from './PerformerIndexRefreshPerformerButton';
import PerformerIndexPosterOptionsModal from './Posters/Options/PerformerIndexPosterOptionsModal';
import PerformerIndexPosters from './Posters/PerformerIndexPosters';
import PerformerIndexSelectFooter from './Select/PerformerIndexSelectFooter';
import PerformerIndexTable from './Table/PerformerIndexTable';
import PerformerIndexTableOptions from './Table/PerformerIndexTableOptions';
import { usePerformerIndex } from './usePerformerIndex';
import styles from './PerformerIndex.css';

function SelectModeReinitializer({
  isSelectMode,
  items,
}: {
  isSelectMode: boolean;
  items: { id: number }[];
}) {
  const [, selectDispatch] = useSelect();

  useEffect(() => {
    if (isSelectMode) {
      selectDispatch({ type: 'updateItems', items });
    }
  }, [isSelectMode, items, selectDispatch]);

  return null;
}

function PerformerIndex(): React.JSX.Element {
  const {
    items,
    totalItems,
    page,
    totalPages,
    sortKey,
    columns,
    filters,
    isLoading,
    isOptionsModalOpen,
    isSelectMode,
    selectedFilterKey,
    sortDirection,
    view,
    handleFirstPagePress,
    handleLastPagePress,
    handleNextPagePress,
    handlePageSelect,
    handlePreviousPagePress,
    handleSortPress,
    handleAddPerformerPress,
    handleFilterSelect,
    handleOptionsModalClose,
    handleOptionsPress,
    handleSelectModePress,
    handleTableOptionChange,
    handleViewSelect,
  } = usePerformerIndex();

  const customFilters = useCustomFiltersList('performers');
  const hasNoPerformer = items.length === 0;
  const isLoaded = !!items.length;
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <SelectProvider items={items}>
      <SelectModeReinitializer isSelectMode={isSelectMode} items={items} />
      <PageContent
        className={styles.pageContent}
        title={translate('Performers')}
      >
        {/*
          HEADER TOOLBAR
        */}
        <PageToolbar>
          <PageToolbarSection>
            <PerformerIndexRefreshPerformerButton
              isSelectMode={isSelectMode}
              selectedFilterKey={selectedFilterKey}
              items={items}
              totalItems={totalItems}
            />
            <MovieIndexSelectModeButton
              label={
                isSelectMode
                  ? translate('StopSelecting')
                  : translate('EditPerformers')
              }
              iconName={isSelectMode ? icons.SERIES_ENDED : icons.EDIT}
              isSelectMode={isSelectMode}
              overflowComponent={MovieIndexSelectModeMenuItem}
              onPress={handleSelectModePress}
            />
            <MovieIndexSelectAllButton
              label="SelectAll"
              isSelectMode={isSelectMode}
              overflowComponent={MovieIndexSelectAllMenuItem}
            />
            <PageToolbarButton
              label={translate('AddPerformer')}
              iconName={icons.ADD}
              onPress={handleAddPerformerPress}
            />
          </PageToolbarSection>
          <PageToolbarSection
            alignContent={align.RIGHT}
            collapseButtons={false}
          >
            {view === 'table' ? (
              <TableOptionsModalWrapper
                columns={columns}
                optionsComponent={PerformerIndexTableOptions}
                onTableOptionChange={handleTableOptionChange}
              >
                <PageToolbarButton
                  label={translate('Options')}
                  iconName={icons.TABLE}
                />
              </TableOptionsModalWrapper>
            ) : (
              <PageToolbarButton
                label={translate('Options')}
                iconName={view === 'posters' ? icons.POSTER : icons.OVERVIEW}
                onPress={handleOptionsPress}
              />
            )}

            <PageToolbarSeparator />

            <PerformerIndexViewMenu
              view={view}
              isDisabled={hasNoPerformer}
              onViewSelect={handleViewSelect}
            />

            <PerformerIndexSortMenu
              sortKey={sortKey}
              sortDirection={sortDirection}
              isDisabled={hasNoPerformer}
              onSortSelect={handleSortPress}
            />

            <PerformerIndexFilterMenu
              selectedFilterKey={selectedFilterKey}
              filters={filters}
              customFilters={customFilters || ''}
              isDisabled={false}
              onFilterSelect={handleFilterSelect}
            />
          </PageToolbarSection>
        </PageToolbar>

        {/*
        MAIN PAGE BODY
        */}
        <PageContentBody ref={scrollerRef}>
          {isLoading ? <LoadingIndicator /> : null}

          {/*
          TABLE VIEW
          */}
          {isLoaded && items.length > 0 && view === 'table' ? (
            <div>
              <PerformerIndexTable
                items={items}
                isSelectMode={isSelectMode}
                sortKey={sortKey}
                sortDirection={sortDirection}
                columns={columns}
                onSortPress={handleSortPress}
              />
              <TablePager
                page={page}
                totalRecords={totalItems}
                totalPages={totalPages}
                isFetching={isLoading}
                onFirstPagePress={handleFirstPagePress}
                onPreviousPagePress={handlePreviousPagePress}
                onNextPagePress={handleNextPagePress}
                onLastPagePress={handleLastPagePress}
                onPageSelect={handlePageSelect}
              />
            </div>
          ) : null}

          {/* POSTER VIEW */}
          {isLoaded && items.length > 0 && view === 'posters' ? (
            <div>
              <PerformerIndexPosters
                items={items}
                scrollerRef={scrollerRef}
                isSmallScreen={false}
                isSelectMode={isSelectMode}
                sortKey={sortKey}
                sortDirection={sortDirection}
              />
              <TablePager
                page={page}
                totalRecords={totalItems}
                totalPages={totalPages}
                isFetching={isLoading}
                onFirstPagePress={handleFirstPagePress}
                onPreviousPagePress={handlePreviousPagePress}
                onNextPagePress={handleNextPagePress}
                onLastPagePress={handleLastPagePress}
                onPageSelect={handlePageSelect}
              />
            </div>
          ) : null}

          {/*
          NO ITEMS PLACEHOLDER
          */}
          {items.length === 0 && !isLoading ? <NoPerformer /> : null}

          {/*
          FOOTER - SELECT MODE
          */}
          {isSelectMode ? <PerformerIndexSelectFooter items={items} /> : null}

          {/*
          MODALS
          */}
          {view === 'posters' ? (
            <PerformerIndexPosterOptionsModal
              isOpen={isOptionsModalOpen}
              onModalClose={handleOptionsModalClose}
            />
          ) : null}
        </PageContentBody>
      </PageContent>
    </SelectProvider>
  );
}
export default PerformerIndex;
