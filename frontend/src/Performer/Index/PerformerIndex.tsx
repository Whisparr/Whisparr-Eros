import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { SelectProvider } from 'App/SelectContext';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import TablePager from 'Components/Table/TablePager';
import { align, icons } from 'Helpers/Props';
import MovieIndexSelectAllButton from 'Movie/Index/Select/MovieIndexSelectAllButton';
import MovieIndexSelectAllMenuItem from 'Movie/Index/Select/MovieIndexSelectAllMenuItem';
import MovieIndexSelectModeButton from 'Movie/Index/Select/MovieIndexSelectModeButton';
import MovieIndexSelectModeMenuItem from 'Movie/Index/Select/MovieIndexSelectModeMenuItem';
import NoPerformer from 'Performer/NoPerformer';
import { defaultState } from 'Store/Actions/performerActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';
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

interface PerformerIndexProps {
  initialScrollTop?: number;
}

function PerformerIndex(_: PerformerIndexProps): JSX.Element {
  const {
    items,
    totalItems,
    page,
    totalPages,
    sortKey,
    columns,
    isFetching,
    isOptionsModalOpen,
    isSelectMode,
    safeForWorkMode,
    selectedFilterKey,
    sortDirection,
    view,
    showMovieMonitorToggle,
    handleFirstPagePress,
    handleLastPagePress,
    handleNextPagePress,
    handlePageSelect,
    handlePreviousPagePress,
    handleSortPress,
    onAddPerformerPress,
    onFilterSelect,
    onOptionsModalClose,
    onOptionsPress,
    onSelectModePress,
    onTableOptionChange,
    onViewSelect,
    PerformerSelectModeReinitializer,
  } = usePerformerIndex();

  const filters = defaultState.filters || [];
  const customFilters = useSelector(createCustomFiltersSelector('performers'));
  const hasNoPerformer = items.length === 0;
  const isLoaded = !!items.length;
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <SelectProvider items={items}>
      <PerformerSelectModeReinitializer
        isSelectMode={isSelectMode}
        items={items}
      />
      <PageContent className={styles.pageContent}>
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
              onPress={onSelectModePress}
            />
            <MovieIndexSelectAllButton
              label="SelectAll"
              isSelectMode={isSelectMode}
              overflowComponent={MovieIndexSelectAllMenuItem}
            />
            <PageToolbarButton
              label={translate('AddPerformer')}
              iconName={icons.ADD}
              onPress={onAddPerformerPress}
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
                onTableOptionChange={onTableOptionChange}
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
                onPress={onOptionsPress}
              />
            )}

            <PageToolbarSeparator />

            <PerformerIndexViewMenu
              view={view}
              isDisabled={hasNoPerformer}
              onViewSelect={onViewSelect}
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
              onFilterSelect={onFilterSelect}
            />
          </PageToolbarSection>
        </PageToolbar>

        {/*
        MAIN PAGE BODY
        */}
        <PageContentBody ref={scrollerRef}>
          {isFetching ? <LoadingIndicator /> : null}

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
                showMovieMonitorToggle={showMovieMonitorToggle}
                onSortPress={handleSortPress}
              />
              <TablePager
                page={page}
                totalRecords={totalItems}
                totalPages={totalPages}
                isFetching={isFetching}
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
                safeForWorkMode={safeForWorkMode}
                sortKey={sortKey}
                sortDirection={sortDirection}
              />
              <TablePager
                page={page}
                totalRecords={totalItems}
                totalPages={totalPages}
                isFetching={isFetching}
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
          {items.length === 0 && !isFetching ? <NoPerformer /> : null}

          {/*
          FOOTER - SELECT MODE
          */}
          {isSelectMode ? <PerformerIndexSelectFooter /> : null}

          {/*
          MODALS
          */}
          {view === 'posters' ? (
            <PerformerIndexPosterOptionsModal
              isOpen={isOptionsModalOpen}
              onModalClose={onOptionsModalClose}
            />
          ) : null}
        </PageContentBody>
      </PageContent>
    </SelectProvider>
  );
}
export default PerformerIndex;
