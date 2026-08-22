import _ from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  type ListRowProps,
  WindowScroller,
} from 'react-virtualized';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Measure from 'Components/Measure';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import posterPlaceholder from 'Components/posterPlaceholder';
import Tooltip from 'Components/Tooltip/Tooltip';
import { useShowMovieMonitorToggleButton } from 'Helpers/Hooks/useShowMovieMonitorToggleButton';
import { icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import QualityProfileName from 'Settings/Profiles/Quality/QualityProfileName';
import DeleteStudioModal from 'Studio/Delete/DeleteStudioModal';
import EditStudioModal from 'Studio/Edit/EditStudioModal';
import { type Image } from 'Studio/Studio';
import StudioLogo from 'Studio/StudioLogo';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import StudioDetailsLinks from './StudioDetailsLinks';
import StudioDetailsYear from './StudioDetailsYear';
import { setStudioScenesExpanded } from './studioScenesOptionsStore';
import StudioTags from './StudioTags';
import {
  buildStudioWorksData,
  ensureImageType,
  useStudioDetails,
  useStudioDetailsWorks,
  useStudioTags,
} from './useStudioDetails';
import styles from './StudioDetails.css';

function getFanartUrl(images: Image[]): string | undefined {
  return _.find(images, { coverType: 'fanart' })?.url;
}

function StudioDetails() {
  const { studioForeignId } = useParams() as { studioForeignId: string };

  const { data: allWorks = [], isFetching: isWorksFetching } =
    useStudioDetailsWorks(studioForeignId as string);

  const [scrollContainer, setScrollContainer] = useState<Element | null>(null);
  const contentBodyRef = useCallback((el: HTMLDivElement | null) => {
    setScrollContainer(el);
  }, []);

  const listRef = useRef<List>(null);
  const cacheRef = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 70,
      minHeight: 60,
    })
  );

  const {
    studio,
    safeForWorkMode,
    expandedState,
    isDeleteMovieModalOpen,
    isEditMovieModalOpen,
    isManualRefresh,
    isStudioDetailsFetching,
    isStudioRefreshing,
    studioDetailsError,
    handleDeleteMovieModalClose,
    handleDeleteMoviePress,
    handleEditMovieModalClose,
    handleEditMoviePress,
    handleExpandPress,
    handleTitleMeasure,
    onMonitorTogglePress,
    onRefreshPress,
    onSearchPress,
    onYearRefreshPress,
  } = useStudioDetails(studioForeignId);

  const showMovieMonitorToggle = useShowMovieMonitorToggleButton(
    studio?.tmdbId,
    studio?.tpdbId
  );

  const studioTags = useStudioTags(studio?.tags || []);
  const studioId = studio?.id;

  const isSaving = false;
  const isRefreshing = isStudioRefreshing || isManualRefresh;
  const isSearching = false;
  const {
    allExpanded,
    expandIcon,
    initialExpandedState,
    runningYears,
    worksByYear,
    years,
  } = useMemo(
    () => buildStudioWorksData(allWorks, expandedState),
    [allWorks, expandedState]
  );

  const isPopulated = worksByYear.length > 0;
  const moviesError = studioDetailsError;

  useEffect(() => {
    if (!allWorks.length) {
      return;
    }

    if (
      JSON.stringify(initialExpandedState) !== JSON.stringify(expandedState)
    ) {
      setStudioScenesExpanded(initialExpandedState);
    }
  }, [allWorks.length, expandedState, initialExpandedState]);

  const yearIndexMap = useMemo(() => {
    return new Map(worksByYear.map((entry, index) => [entry.year, index]));
  }, [worksByYear]);

  const handleExpandAllPress = useCallback(() => {
    const newExpandedState: Record<number, boolean> = {};
    years.forEach((year) => {
      newExpandedState[year] = !allExpanded;
    });
    setStudioScenesExpanded(newExpandedState);
  }, [allExpanded, years]);

  const handleVirtualizedExpandPress = useCallback(
    (year: number, expand: boolean) => {
      const isExpanded = !!expandedState[year];
      if (expand !== isExpanded) {
        handleExpandPress(year);
      }

      const index = yearIndexMap.get(year);
      if (index == null) {
        return;
      }

      cacheRef.current.clear(index, 0);
      listRef.current?.recomputeRowHeights(index);
    },
    [expandedState, handleExpandPress, yearIndexMap]
  );

  useEffect(() => {
    cacheRef.current.clearAll();
    listRef.current?.recomputeRowHeights();
  }, [expandedState, worksByYear.length]);

  const rowRenderer = useCallback(
    ({ index, key, parent, style }: ListRowProps) => {
      if (!studioId) {
        return null;
      }

      const entry = worksByYear[index];

      if (!entry) {
        return null;
      }

      const isExpanded = !!expandedState[entry.year];
      const rowClassName = isExpanded
        ? `${styles.yearRow} ${styles.yearRowExpanded}`
        : `${styles.yearRow} ${styles.yearRowCollapsed}`;

      return (
        <CellMeasurer
          key={key}
          cache={cacheRef.current}
          columnIndex={0}
          rowIndex={index}
          parent={parent}
        >
          <div className={rowClassName} style={style}>
            <StudioDetailsYear
              studioId={studioId}
              year={entry.year}
              works={entry.works}
              isExpanded={isExpanded}
              onExpandPress={handleVirtualizedExpandPress}
              onYearRefreshPress={onYearRefreshPress}
            />
          </div>
        </CellMeasurer>
      );
    },
    [
      expandedState,
      studioId,
      worksByYear,
      handleVirtualizedExpandPress,
      onYearRefreshPress,
    ]
  );

  if (!studio) {
    if (isStudioDetailsFetching) {
      return (
        <PageContent>
          <LoadingIndicator />
        </PageContent>
      );
    }
    if (studioDetailsError || !studioForeignId) {
      return (
        <Alert kind={kinds.DANGER}>{translate('LoadingStudioFailed')}</Alert>
      );
    }
    return null;
  }

  const imageList: Image[] = ensureImageType(studio.images || []);
  const fanartUrl = getFanartUrl(imageList);

  return (
    <PageContent title={studio.title}>
      {/* HEADER TOOLBAR */}
      <PageToolbar>
        <PageToolbarSection>
          <PageToolbarButton
            label={translate('RefreshAndScan')}
            iconName={icons.REFRESH}
            spinningName={icons.REFRESH}
            title={translate('RefreshInformationAndScanDisk')}
            isSpinning={isRefreshing}
            onPress={onRefreshPress}
          />

          <PageToolbarButton
            label={translate('SearchStudio')}
            iconName={icons.SEARCH}
            isSpinning={isSearching}
            title={undefined}
            onPress={onSearchPress}
          />

          <PageToolbarSeparator />

          <PageToolbarButton
            label={translate('Edit')}
            iconName={icons.EDIT}
            onPress={handleEditMoviePress}
          />

          <PageToolbarButton
            label={translate('Delete')}
            iconName={icons.DELETE}
            onPress={handleDeleteMoviePress}
          />
        </PageToolbarSection>

        <PageToolbarSection alignContent="right">
          <PageToolbarButton
            label={allExpanded ? 'Collapse All' : 'Expand All'}
            iconName={expandIcon}
            onPress={handleExpandAllPress}
          />
        </PageToolbarSection>
      </PageToolbar>

      {/* MAIN PAGE CONTENT */}
      <PageContentBody
        ref={contentBodyRef}
        innerClassName={styles.innerContentBody}
      >
        <div className={styles.header}>
          <div
            className={styles.backdrop}
            style={
              fanartUrl ? { backgroundImage: `url(${fanartUrl})` } : undefined
            }
          >
            <div className={styles.backdropOverlay} />
          </div>

          <div className={styles.headerContent}>
            <StudioLogo
              safeForWorkMode={safeForWorkMode}
              className={styles.poster}
              placeholder={posterPlaceholder}
              images={imageList}
              size={250}
              lazy={false}
            />
            <div className={styles.info}>
              <Measure onMeasure={handleTitleMeasure}>
                <div className={styles.titleRow}>
                  <div className={styles.titleContainer}>
                    <div className={styles.monitorToggleButtonsContainer}>
                      <div className={styles.toggleMonitoredContainer}>
                        <MonitorToggleButton
                          className={
                            studio.monitored
                              ? styles.monitorToggleButton
                              : `${styles.monitorToggleButton} ${styles.unmonitored}`
                          }
                          monitored={studio.monitored}
                          moviesMonitored={studio.moviesMonitored}
                          type="sceneMonitor"
                          isSaving={isSaving}
                          size={30}
                          onPress={onMonitorTogglePress}
                        />
                      </div>

                      {showMovieMonitorToggle ? (
                        <div className={styles.toggleMoviesMonitoredContainer}>
                          <MonitorToggleButton
                            className={
                              studio.moviesMonitored
                                ? styles.monitorToggleButton
                                : `${styles.monitorToggleButton} ${styles.unmonitored}`
                            }
                            monitored={studio.monitored}
                            moviesMonitored={studio.moviesMonitored}
                            type="movieMonitor"
                            isSaving={isSaving}
                            size={30}
                            onPress={onMonitorTogglePress}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className={styles.title}>{studio.title}</div>
                  </div>
                </div>
              </Measure>

              <div className={styles.details}>
                <div>
                  <span className={styles.years}>{runningYears}</span>

                  <span className={styles.network}>{studio.network}</span>
                </div>
              </div>

              <div>
                {!!studio.rootFolderPath && (
                  <Label
                    className={styles.detailsLabel}
                    size={sizes.LARGE}
                    title={translate('RootFolderPath')}
                  >
                    <Icon name={icons.FOLDER} size={17} />
                    <span
                      className={
                        safeForWorkMode
                          ? `${styles.path} ${styles.blurred}`
                          : styles.path
                      }
                    >
                      {studio.rootFolderPath}
                    </span>
                  </Label>
                )}

                {studio.qualityProfileId ? (
                  <Label
                    className={styles.detailsLabel}
                    title={translate('QualityProfile')}
                    size={sizes.LARGE}
                  >
                    <Icon name={icons.PROFILE} size={17} />

                    <span className={styles.qualityProfileName}>
                      <QualityProfileName
                        qualityProfileId={studio.qualityProfileId}
                      />
                    </span>
                  </Label>
                ) : null}

                {studio.hasMovies ? (
                  <Label className={styles.detailsLabel} size={sizes.LARGE}>
                    <Icon name={icons.FILM} size={17} />

                    <span
                      title={translate('Movies')}
                      className={styles.movieCount}
                    >
                      {`${translate('Movies')}:
                    ${studio.movieCount} / ${studio.totalMovieCount}`}
                    </span>
                  </Label>
                ) : null}

                {studio.hasScenes ? (
                  <Label className={styles.detailsLabel} size={sizes.LARGE}>
                    <Icon name={icons.SCENE} size={17} />

                    <span
                      title={translate('Scenes')}
                      className={styles.sceneCount}
                    >
                      {`${translate('Scenes')}:
                    ${studio.sceneCount} / ${studio.totalSceneCount}`}
                    </span>
                  </Label>
                ) : null}

                {studio.sizeOnDisk >= 0 ? (
                  <Label
                    title={translate('SizeOnDisk')}
                    className={styles.detailsLabel}
                    size={sizes.LARGE}
                  >
                    <Icon name={icons.DRIVE} size={17} />
                    <span className={styles.sizeOnDisk}>
                      {formatBytes(studio.sizeOnDisk)}
                    </span>
                  </Label>
                ) : null}

                {!!studio.tags && studio.tags.length ? (
                  <Tooltip
                    anchor={
                      <Label className={styles.detailsLabel} size={sizes.LARGE}>
                        <Icon name={icons.TAGS} size={17} />

                        <span className={styles.tags}>{translate('Tags')}</span>
                      </Label>
                    }
                    tooltip={<StudioTags tags={studioTags} />}
                    kind={kinds.INVERSE}
                    position={tooltipPositions.BOTTOM}
                  />
                ) : null}

                <Tooltip
                  anchor={
                    <Label className={styles.detailsLabel} size={sizes.LARGE}>
                      <div>
                        <Icon name={icons.EXTERNAL_LINK} size={17} />
                        <span className={styles.links}>
                          {translate('Links')}
                        </span>
                      </div>
                    </Label>
                  }
                  tooltip={
                    <StudioDetailsLinks
                      tpdbId={studio.tpdbId}
                      tmdbId={studio.tmdbId}
                      foreignId={studio.foreignId}
                    />
                  }
                  kind={kinds.INVERSE}
                  position={tooltipPositions.BOTTOM}
                />

                {!!studio.aliases && !!studio.aliases.length && (
                  <Label
                    className={styles.detailsLabel}
                    title={translate('Aliases')}
                    size={sizes.LARGE}
                  >
                    <Icon name={icons.TAGS} size={17} />

                    <span className={styles.aliases}>
                      {studio.aliases.join(', ')}
                    </span>
                  </Label>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentContainer}>
          {!isWorksFetching && moviesError && (
            <Alert kind={kinds.DANGER}>
              {translate('LoadingMoviesFailed')}
            </Alert>
          )}

          {isWorksFetching && !isPopulated ? <LoadingIndicator /> : null}

          {/* WORKS BY YEAR */}
          {isPopulated && (studio.hasMovies || studio.hasScenes) && (
            <FieldSet legend={translate('Works')}>
              <WindowScroller scrollElement={scrollContainer ?? undefined}>
                {({
                  height,
                  isScrolling,
                  onChildScroll,
                  scrollTop,
                  registerChild,
                }) => {
                  if (!height) {
                    return null;
                  }

                  return (
                    <div
                      ref={(element) => {
                        (
                          registerChild as unknown as (
                            el: Element | null
                          ) => void
                        )(element);
                      }}
                    >
                      <AutoSizer disableHeight={true}>
                        {({ width }) => (
                          <List
                            ref={listRef}
                            autoHeight={true}
                            height={height}
                            width={width}
                            rowCount={worksByYear.length}
                            rowHeight={cacheRef.current.rowHeight}
                            estimatedRowSize={80}
                            deferredMeasurementCache={cacheRef.current}
                            overscanRowCount={6}
                            scrollTop={scrollTop}
                            isScrolling={isScrolling}
                            rowRenderer={rowRenderer}
                            onScroll={onChildScroll}
                          />
                        )}
                      </AutoSizer>
                    </div>
                  );
                }}
              </WindowScroller>
            </FieldSet>
          )}
        </div>

        {/* MODALS */}
        {studio && (
          <>
            <EditStudioModal
              isOpen={isEditMovieModalOpen}
              studio={studio}
              onModalClose={handleEditMovieModalClose}
            />

            <DeleteStudioModal
              isOpen={isDeleteMovieModalOpen}
              studio={studio}
              onModalClose={handleDeleteMovieModalClose}
            />
          </>
        )}
      </PageContentBody>
    </PageContent>
  );
}

export default StudioDetails;
