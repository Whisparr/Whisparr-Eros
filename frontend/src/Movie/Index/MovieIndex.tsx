import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectProvider } from 'App/SelectContext';
import { RSS_SYNC } from 'Commands/commandNames';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import TablePager from 'Components/Table/TablePager';
import { align, icons, kinds } from 'Helpers/Props';
import InteractiveImportModal from 'InteractiveImport/InteractiveImportModal';
import NoMovie from 'Movie/NoMovie';
import { executeCommand } from 'Store/Actions/commandActions';
import { fetchQueueDetails } from 'Store/Actions/queueActions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import translate from 'Utilities/String/translate';
import MovieIndexFilterMenu from './Menus/MovieIndexFilterMenu';
import MovieIndexSortMenu from './Menus/MovieIndexSortMenu';
import MovieIndexViewMenu from './Menus/MovieIndexViewMenu';
import MovieIndexFooter from './MovieIndexFooter';
import MovieIndexRefreshMovieButton from './MovieIndexRefreshMovieButton';
import MovieIndexSearchButton from './MovieIndexSearchButton';
import MovieIndexSearchMenuItem from './MovieIndexSearchMenuItem';
import MovieIndexOverviews from './Overview/MovieIndexOverviews';
import MovieIndexOverviewOptionsModal from './Overview/Options/MovieIndexOverviewOptionsModal';
import MovieIndexPosters from './Posters/MovieIndexPosters';
import MovieIndexPosterOptionsModal from './Posters/Options/MovieIndexPosterOptionsModal';
import MovieIndexSelectAllButton from './Select/MovieIndexSelectAllButton';
import MovieIndexSelectAllMenuItem from './Select/MovieIndexSelectAllMenuItem';
import MovieIndexSelectFooter from './Select/MovieIndexSelectFooter';
import MovieIndexSelectModeButton from './Select/MovieIndexSelectModeButton';
import MovieIndexSelectModeMenuItem from './Select/MovieIndexSelectModeMenuItem';
import MovieIndexTable from './Table/MovieIndexTable';
import MovieIndexTableOptions from './Table/MovieIndexTableOptions';
import { useMovieIndex } from './useMovieIndex';
import styles from './MovieIndex.css';

function MovieIndex() {
  const {
    items,
    totalItems,
    page,
    totalPages,
    sortKey,
    sortDirection,
    view,
    columns,
    filters,
    customFilters,
    selectedFilterKey,
    isLoading,
    isError,
    isSelectMode,
    scrollerRef,
    handleFirstPagePress,
    handlePreviousPagePress,
    handleNextPagePress,
    handleLastPagePress,
    handlePageSelect,
    handleSortPress,
    handleFilterSelect,
    handleViewSelect,
    handleTableOptionChange,
    handleSelectModePress,
  } = useMovieIndex();

  const isRssSyncExecuting = useSelector(
    createCommandExecutingSelector(RSS_SYNC)
  );
  const { isSmallScreen } = useSelector(createDimensionsSelector());
  const dispatch = useDispatch();

  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isInteractiveImportModalOpen, setIsInteractiveImportModalOpen] =
    useState(false);

  useEffect(() => {
    dispatch(fetchQueueDetails({ all: true }));
  }, [dispatch]);

  const handleRssSyncPress = useCallback(() => {
    dispatch(executeCommand({ name: RSS_SYNC }));
  }, [dispatch]);

  const handleOptionsPress = useCallback(() => {
    setIsOptionsModalOpen(true);
  }, []);

  const handleOptionsModalClose = useCallback(() => {
    setIsOptionsModalOpen(false);
  }, []);

  const handleInteractiveImportPress = useCallback(() => {
    setIsInteractiveImportModalOpen(true);
  }, []);

  const handleInteractiveImportModalClose = useCallback(() => {
    setIsInteractiveImportModalOpen(false);
  }, []);

  const hasNoMovie = totalItems === 0 && !isLoading;

  const pager = (
    <TablePager
      page={page}
      totalPages={totalPages}
      totalRecords={totalItems}
      isFetching={isLoading}
      onFirstPagePress={handleFirstPagePress}
      onPreviousPagePress={handlePreviousPagePress}
      onNextPagePress={handleNextPagePress}
      onLastPagePress={handleLastPagePress}
      onPageSelect={handlePageSelect}
    />
  );

  return (
    <SelectProvider items={items}>
      <PageContent>
        <PageToolbar>
          <PageToolbarSection>
            <MovieIndexRefreshMovieButton
              isSelectMode={isSelectMode}
              selectedFilterKey={selectedFilterKey}
              items={items}
            />

            <PageToolbarButton
              label={translate('RssSync')}
              iconName={icons.RSS}
              isSpinning={isRssSyncExecuting}
              isDisabled={isRssSyncExecuting}
              onPress={handleRssSyncPress}
            />

            <PageToolbarSeparator />

            <MovieIndexSearchButton
              isSelectMode={isSelectMode}
              selectedFilterKey={selectedFilterKey}
              overflowComponent={MovieIndexSearchMenuItem}
              items={items}
            />

            <PageToolbarButton
              label={translate('ManualImport')}
              iconName={icons.INTERACTIVE}
              onPress={handleInteractiveImportPress}
            />

            <PageToolbarSeparator />

            <MovieIndexSelectModeButton
              label={
                isSelectMode
                  ? translate('StopSelecting')
                  : translate('EditMovies')
              }
              iconName={isSelectMode ? icons.SERIES_ENDED : icons.EDIT}
              isSelectMode={isSelectMode}
              isDisabled={hasNoMovie}
              overflowComponent={MovieIndexSelectModeMenuItem}
              onPress={handleSelectModePress}
            />

            <MovieIndexSelectAllButton
              label={translate('SelectAll')}
              isSelectMode={isSelectMode}
              overflowComponent={MovieIndexSelectAllMenuItem}
            />
          </PageToolbarSection>

          <PageToolbarSection
            alignContent={align.RIGHT}
            collapseButtons={false}
          >
            {view === 'table' ? (
              <TableOptionsModalWrapper
                columns={columns}
                optionsComponent={MovieIndexTableOptions}
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
                isDisabled={hasNoMovie}
                onPress={handleOptionsPress}
              />
            )}

            <PageToolbarSeparator />

            <MovieIndexViewMenu
              view={view}
              isDisabled={hasNoMovie}
              onViewSelect={handleViewSelect}
            />

            <MovieIndexSortMenu
              sortKey={sortKey}
              sortDirection={sortDirection}
              isDisabled={false}
              onSortSelect={handleSortPress}
            />

            <MovieIndexFilterMenu
              selectedFilterKey={selectedFilterKey}
              filters={filters}
              customFilters={customFilters}
              isDisabled={false}
              onFilterSelect={handleFilterSelect}
            />
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody
          ref={scrollerRef}
          className={styles.contentBody}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          innerClassName={styles[`${view}InnerContentBody`]}
        >
          {isLoading ? <LoadingIndicator /> : null}

          {!isLoading && isError ? (
            <Alert kind={kinds.DANGER}>{translate('UnableToLoadMovies')}</Alert>
          ) : null}

          {!isLoading && !isError && items.length > 0 ? (
            <div className={styles.contentBodyContainer}>
              {view === 'table' ? (
                <>
                  <MovieIndexTable
                    items={items}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    isSelectMode={isSelectMode}
                    isSmallScreen={isSmallScreen}
                  />
                  {pager}
                </>
              ) : null}

              {view === 'posters' ? (
                <>
                  <MovieIndexPosters
                    items={items}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    scrollerRef={scrollerRef}
                    isSelectMode={isSelectMode}
                    isSmallScreen={isSmallScreen}
                  />
                  {pager}
                </>
              ) : null}

              {view === 'overview' ? (
                <>
                  <MovieIndexOverviews
                    items={items}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    scrollerRef={scrollerRef}
                    isSelectMode={isSelectMode}
                    isSmallScreen={isSmallScreen}
                  />
                  {pager}
                </>
              ) : null}

              <MovieIndexFooter />
            </div>
          ) : null}

          {!isLoading && !isError && items.length === 0 ? (
            <NoMovie totalItems={totalItems} />
          ) : null}
        </PageContentBody>

        {isSelectMode ? <MovieIndexSelectFooter /> : null}

        <InteractiveImportModal
          isOpen={isInteractiveImportModalOpen}
          onModalClose={handleInteractiveImportModalClose}
        />

        {view === 'posters' ? (
          <MovieIndexPosterOptionsModal
            isOpen={isOptionsModalOpen}
            onModalClose={handleOptionsModalClose}
          />
        ) : null}

        {view === 'overview' ? (
          <MovieIndexOverviewOptionsModal
            isOpen={isOptionsModalOpen}
            onModalClose={handleOptionsModalClose}
          />
        ) : null}
      </PageContent>
    </SelectProvider>
  );
}

export default MovieIndex;
