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
import { defaultState } from 'Store/Actions/studioActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';
import NoStudio from 'Studio/NoStudio';
import translate from 'Utilities/String/translate';
import StudioIndexFilterMenu from './Menus/StudioIndexFilterMenu';
import StudioIndexSortMenu from './Menus/StudioIndexSortMenu';
import StudioIndexViewMenu from './Menus/StudioIndexViewMenu';
import StudioIndexPosterOptionsModal from './Posters/Options/StudioIndexPosterOptionsModal';
import StudioIndexPosters from './Posters/StudioIndexPosters';
import StudioIndexSelectFooter from './Select/StudioIndexSelectFooter';
import StudioIndexRefreshStudioButton from './StudioIndexRefreshStudioButton';
import StudioIndexTable from './Table/StudioIndexTable';
import StudioIndexTableOptions from './Table/StudioIndexTableOptions';
import { useStudioIndex } from './useStudioIndex';
import styles from './StudioIndex.css';

function StudioIndex(): React.JSX.Element {
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
    selectedFilterKey,
    sortDirection,
    view,
    handleFirstPagePress,
    handleLastPagePress,
    handleNextPagePress,
    handlePageSelect,
    handlePreviousPagePress,
    handleSortPress,
    onAddStudioPress,
    onFilterSelect,
    onOptionsModalClose,
    onOptionsPress,
    onSelectModePress,
    onTableOptionChange,
    onViewSelect,
    StudioSelectModeReinitializer,
  } = useStudioIndex();

  const filters = defaultState.filters || [];
  const customFilters = useSelector(createCustomFiltersSelector('studios'));
  const hasNoStudio = items.length === 0;
  const isLoaded = !!items.length;
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <SelectProvider items={items}>
      <StudioSelectModeReinitializer
        isSelectMode={isSelectMode}
        items={items}
      />
      <PageContent className={styles.pageContent}>
        {/*
          HEADER TOOLBAR
        */}
        <PageToolbar>
          <PageToolbarSection>
            <StudioIndexRefreshStudioButton
              isSelectMode={isSelectMode}
              selectedFilterKey={selectedFilterKey}
              items={items}
              totalItems={totalItems}
            />
            <MovieIndexSelectModeButton
              label={
                isSelectMode
                  ? translate('StopSelecting')
                  : translate('EditStudios')
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
              label={translate('AddStudio')}
              iconName={icons.ADD}
              onPress={onAddStudioPress}
            />
          </PageToolbarSection>
          <PageToolbarSection
            alignContent={align.RIGHT}
            collapseButtons={false}
          >
            {view === 'table' ? (
              <TableOptionsModalWrapper
                columns={columns}
                optionsComponent={StudioIndexTableOptions}
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
                isDisabled={hasNoStudio}
                onPress={onOptionsPress}
              />
            )}

            <PageToolbarSeparator />

            <StudioIndexViewMenu
              view={view}
              isDisabled={hasNoStudio}
              onViewSelect={onViewSelect}
            />

            <StudioIndexSortMenu
              sortKey={sortKey}
              sortDirection={sortDirection}
              isDisabled={hasNoStudio}
              onSortSelect={handleSortPress}
            />

            <StudioIndexFilterMenu
              selectedFilterKey={selectedFilterKey}
              filters={filters}
              customFilters={customFilters}
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
              <StudioIndexTable
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
              <StudioIndexPosters
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
          {items.length === 0 && !isFetching ? (
            <NoStudio totalItems={0} />
          ) : null}

          {/*
          FOOTER - SELECT MODE
          */}
          {isSelectMode ? <StudioIndexSelectFooter /> : null}

          {/*
          MODALS
          */}
          {view === 'posters' ? (
            <StudioIndexPosterOptionsModal
              isOpen={isOptionsModalOpen}
              onModalClose={onOptionsModalClose}
            />
          ) : null}
        </PageContentBody>
      </PageContent>
    </SelectProvider>
  );
}
export default StudioIndex;
