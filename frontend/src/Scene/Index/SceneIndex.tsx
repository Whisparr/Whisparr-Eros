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
import MovieIndexSelectAllButton from 'Movie/Index/Select/MovieIndexSelectAllButton';
import MovieIndexSelectAllMenuItem from 'Movie/Index/Select/MovieIndexSelectAllMenuItem';
import MovieIndexSelectModeButton from 'Movie/Index/Select/MovieIndexSelectModeButton';
import MovieIndexSelectModeMenuItem from 'Movie/Index/Select/MovieIndexSelectModeMenuItem';
import ParseToolbarButton from 'Parse/ParseToolbarButton';
import NoScene from 'Scene/NoScene';
import { executeCommand } from 'Store/Actions/commandActions';
import { fetchQueueDetails } from 'Store/Actions/queueActions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import translate from 'Utilities/String/translate';
import SceneIndexFilterMenu from './Menus/SceneIndexFilterMenu';
import SceneIndexSortMenu from './Menus/SceneIndexSortMenu';
import SceneIndexViewMenu from './Menus/SceneIndexViewMenu';
import SceneIndexOverviewOptionsModal from './Overview/Options/SceneIndexOverviewOptionsModal';
import SceneIndexOverviews from './Overview/SceneIndexOverviews';
import SceneIndexPosterOptionsModal from './Posters/Options/SceneIndexPosterOptionsModal';
import SceneIndexPosters from './Posters/SceneIndexPosters';
import SceneIndexFooter from './SceneIndexFooter';
import SceneIndexRefreshSceneButton from './SceneIndexRefreshSceneButton';
import SceneIndexSearchButton from './SceneIndexSearchButton';
import SceneIndexSelectFooter from './Select/SceneIndexSelectFooter';
import SceneIndexTable from './Table/SceneIndexTable';
import SceneIndexTableOptions from './Table/SceneIndexTableOptions';
import { useSceneIndex } from './useSceneIndex';
import styles from './SceneIndex.css';

function SceneIndex() {
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
  } = useSceneIndex();

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

  const hasNoScene = totalItems === 0 && !isLoading;

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
            <SceneIndexRefreshSceneButton
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

            <SceneIndexSearchButton
              isSelectMode={isSelectMode}
              selectedFilterKey={selectedFilterKey}
              items={items}
            />

            <PageToolbarButton
              label={translate('ManualImport')}
              iconName={icons.INTERACTIVE}
              onPress={handleInteractiveImportPress}
            />

            <PageToolbarSeparator />
            <ParseToolbarButton />
            <PageToolbarSeparator />

            <MovieIndexSelectModeButton
              label={
                isSelectMode
                  ? translate('StopSelecting')
                  : translate('EditScenes')
              }
              iconName={isSelectMode ? icons.SERIES_ENDED : icons.EDIT}
              isSelectMode={isSelectMode}
              overflowComponent={MovieIndexSelectModeMenuItem}
              isDisabled={hasNoScene}
              onPress={handleSelectModePress}
            />

            <MovieIndexSelectAllButton
              label="SelectAll"
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
                optionsComponent={SceneIndexTableOptions}
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
                isDisabled={false}
                onPress={handleOptionsPress}
              />
            )}

            <PageToolbarSeparator />

            <SceneIndexViewMenu
              view={view}
              isDisabled={false}
              onViewSelect={handleViewSelect}
            />

            <SceneIndexSortMenu
              sortKey={sortKey}
              sortDirection={sortDirection}
              isDisabled={false}
              onSortSelect={handleSortPress}
            />

            <SceneIndexFilterMenu
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
            <Alert kind={kinds.DANGER}>{translate('UnableToLoadScenes')}</Alert>
          ) : null}

          {!isLoading && !isError && items.length > 0 ? (
            <div className={styles.contentBodyContainer}>
              {view === 'table' ? (
                <>
                  <SceneIndexTable
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
                  <SceneIndexPosters
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
                  <SceneIndexOverviews
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

              <SceneIndexFooter />
            </div>
          ) : null}

          {!isLoading && !isError && items.length === 0 ? (
            <NoScene totalItems={totalItems} />
          ) : null}
        </PageContentBody>

        {isSelectMode ? <SceneIndexSelectFooter /> : null}

        <InteractiveImportModal
          isOpen={isInteractiveImportModalOpen}
          onModalClose={handleInteractiveImportModalClose}
        />

        {view === 'posters' ? (
          <SceneIndexPosterOptionsModal
            isOpen={isOptionsModalOpen}
            onModalClose={handleOptionsModalClose}
          />
        ) : null}

        {view === 'overview' ? (
          <SceneIndexOverviewOptionsModal
            isOpen={isOptionsModalOpen}
            onModalClose={handleOptionsModalClose}
          />
        ) : null}
      </PageContent>
    </SelectProvider>
  );
}

export default SceneIndex;
