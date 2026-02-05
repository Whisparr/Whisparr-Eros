import _ from 'lodash';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import AppState from 'App/State/AppState';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import {
  ASCENDING,
  DESCENDING,
  SortDirection,
} from 'Helpers/Props/sortDirections';
import MovieHeadshot from 'Movie/MovieHeadshot';
import DeletePerformerModal from 'Performer/Delete/DeletePerformerModal';
import PerformerGenderIcon from 'Performer/PerformerGenderIcon';
import { getPerformerStatusDetails } from 'Performer/PerformerStatus';
import QualityProfileName from 'Settings/Profiles/Quality/QualityProfileName';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import formatDate from 'Utilities/Date/formatDate';
import formatBytes from 'Utilities/Number/formatBytes';
import firstCharToUpper from 'Utilities/String/firstCharToUpper';
import translate from 'Utilities/String/translate';
import EditPerformerModal from '../Edit/EditPerformerModal';
import PerformerDetailsLinks from './PerformerDetailsLinks';
import PerformerDetailsYear from './PerformerDetailsYear';
import PerformerTags from './PerformerTags';
import {
  useGeneralSettings,
  usePerformerDetails,
  usePerformerDetailsMovies,
  usePerformerScenesColumns,
} from './usePerformerDetails';
import { usePerformerTags } from './usePerformerTags';
import styles from './PerformerDetails.css';

function getFanartUrl(
  images: Array<{ coverType: string; url: string }>
): string | undefined {
  return _.find(images, { coverType: 'fanart' })?.url;
}

function PerformerDetails() {
  const { performerForeignId } = useParams<{ performerForeignId: string }>();

  const { shortDateFormat } = useSelector(createUISettingsSelector());

  const generalSettings = useGeneralSettings();
  const {
    performer,
    isPerformerDetailsFetching,
    performerDetailsError,
    onRefreshPress,
    onSearchPress,
    onMonitorTogglePress,
    onYearRefreshPress,
  } = usePerformerDetails(performerForeignId);

  const { data: movies = [] } = usePerformerDetailsMovies(performerForeignId);
  const years = Array.from(
    new Set(movies.map((m) => m.year).filter((y) => !!y))
  ).sort((a, b) => b - a);
  const currentYear = new Date().getFullYear();

  const [isEditMovieModalOpen, setIsEditMovieModalOpen] = useState(false);
  const [isDeleteMovieModalOpen, setIsDeleteMovieModalOpen] = useState(false);
  const [allExpandedYears, setAllExpandedYears] = useState<boolean>(false);

  // Initialize expandedYears so current year is expanded by default
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>(
    () => {
      const initial: Record<number, boolean> = {};
      years.forEach((year) => {
        if (year === currentYear) {
          initial[year] = true;
        }
      });
      return initial;
    }
  );

  // Ensure current year is expanded by default when years change
  React.useEffect(() => {
    if (
      years.includes(currentYear) &&
      Object.keys(expandedYears).length === 0
    ) {
      setExpandedYears((prev) => ({ ...prev, [currentYear]: true }));
    }
  }, [years, currentYear, expandedYears]);

  function handleExpandYearPress(year: number, expand: boolean) {
    setExpandedYears((prev) => ({ ...prev, [year]: expand }));
  }

  function handleExpandAllPress() {
    if (years.length === 0) return;
    const nextAllExpanded = !allExpandedYears;
    setAllExpandedYears(nextAllExpanded);
    // Set all years to expanded/collapsed
    const newExpanded: Record<number, boolean> = {};
    years.forEach((year) => {
      newExpanded[year] = nextAllExpanded;
    });
    setExpandedYears(newExpanded);
  }

  // Table columns for studios (from Redux, matches legacy connector)
  const { columns } = usePerformerScenesColumns();
  // Sorting state for all studios
  const [sortKey, setSortKey] = useState('releaseDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>(DESCENDING);
  function handleSortPress(name: string, direction: SortDirection) {
    if (sortKey === name) {
      // Toggle direction if same column
      setSortDirection((prev: SortDirection) =>
        prev === ASCENDING ? DESCENDING : ASCENDING
      );
    } else {
      setSortKey(name);
      // Use provided direction if available, otherwise default
      if (direction !== undefined) {
        setSortDirection(direction);
      } else if (name === 'releaseDate') {
        setSortDirection(DESCENDING);
      } else {
        setSortDirection(ASCENDING);
      }
    }
  }

  // SafeForWork mode from Redux global state
  const safeForWorkMode =
    useSelector((state: AppState) => state.settings.safeForWorkMode) ?? false;

  // Always call hooks unconditionally
  const performerTags = usePerformerTags(performer?.tags ?? []);

  // Null check
  if (!performer) {
    if (isPerformerDetailsFetching) {
      return (
        <PageContent>
          <LoadingIndicator />
        </PageContent>
      );
    }
    if (performerDetailsError) {
      return (
        <Alert kind={kinds.DANGER}>{translate('LoadingPerformerFailed')}</Alert>
      );
    }
    return null;
  }

  // Performer properties
  const foreignId = performer.foreignId;
  const tmdbId = performer.tmdbId;
  const tpdbId = performer.tpdbId;
  const fullName = performer.fullName;
  const rootFolderPath = performer.rootFolderPath;
  const gender = performer.gender;
  const age = performer.age;
  const birthDate =
    performer.birthDate === undefined
      ? ''
      : formatDate(performer.birthDate, shortDateFormat);
  const ethnicity = performer.ethnicity;
  const country = performer.country;
  const careerStart = performer.careerStart;
  const careerEnd = performer.careerEnd;
  const qualityProfileId = performer.qualityProfileId;
  const monitored = performer.monitored;
  const moviesMonitored = performer.moviesMonitored;
  const status = performer.status;
  const images = performer.images;
  const movieCount = performer.movieCount ?? 0;
  const totalMovieCount = performer.totalMovieCount ?? 0;
  const totalSceneCount = performer.totalSceneCount ?? 0;
  const sceneCount = performer.sceneCount ?? 0;
  const sizeOnDisk = performer.sizeOnDisk ?? 0;
  // Computed variables
  const isSaving = false;
  const isRefreshing = false;
  const isSearching = false;
  const isFetching = isPerformerDetailsFetching;
  const moviesError = performerDetailsError;
  const expandIcon = allExpandedYears ? icons.COLLAPSE : icons.EXPAND;
  const statusDetails = getPerformerStatusDetails(status);
  const startYear = Number.isFinite(careerStart) ? careerStart : '';
  const endYear =
    typeof careerEnd === 'number' && Number.isFinite(careerEnd) && careerEnd > 0
      ? careerEnd
      : '';
  const runningYears = `${startYear}-${endYear}`;
  const fanartUrl = getFanartUrl(Array.isArray(images) ? images : []);
  const formatedAge = birthDate === '' ? age : `${birthDate} | ${age}`;

  const moviesByYear = years.map((year) => ({
    year,
    movies: movies.filter((m) => m.year === year),
  }));
  const showMovieMonitorToggle = () => {
    const source = generalSettings.whisparrMovieMetadataSource;
    return (
      (source?.toLowerCase() === 'tmdb' && tmdbId && tmdbId > 0) ||
      (source?.toLowerCase() === 'tpdb' && tpdbId && tpdbId.length > 0)
    );
  };

  // Handlers
  function handleDeleteMovieModalClose() {
    setIsDeleteMovieModalOpen(false);
  }
  function handleEditMovieModalClose() {
    setIsEditMovieModalOpen(false);
  }
  function handleEditMoviePress() {
    setIsEditMovieModalOpen(true);
  }
  function handleDeleteMoviePress() {
    setIsDeleteMovieModalOpen(true);
  }
  function handleRefreshPress() {
    onRefreshPress();
  }
  function handleSearchPress() {
    onSearchPress();
  }
  function handleMonitorTogglePress(
    value: boolean | { monitored: boolean; moviesMonitored: boolean },
    _options: { shiftKey: boolean }
  ) {
    if (typeof value === 'boolean') {
      onMonitorTogglePress({ monitored: value, moviesMonitored: false });
    } else {
      onMonitorTogglePress(value);
    }
  }

  // Render
  return (
    <PageContent>
      <PageToolbar>
        <PageToolbarButton
          label={translate('RefreshAndScan')}
          iconName={icons.REFRESH}
          spinningName={icons.REFRESH}
          title={translate('RefreshInformationAndScanDisk')}
          isSpinning={isRefreshing}
          onPress={handleRefreshPress}
        />
        <PageToolbarButton
          label={translate('SearchPerformer')}
          iconName={icons.SEARCH}
          isSpinning={isSearching}
          title={undefined}
          onPress={handleSearchPress}
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
        <PageToolbarSection alignContent="right">
          <PageToolbarButton
            label="Expand All"
            iconName={expandIcon}
            onPress={handleExpandAllPress}
          />
        </PageToolbarSection>
      </PageToolbar>
      <PageContentBody innerClassName={styles.innerContentBody}>
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
            <MovieHeadshot
              safeForWorkMode={safeForWorkMode}
              className={styles.poster}
              images={images}
              size={250}
              lazy={false}
            />
            <div className={styles.info}>
              <div className={styles.titleRow}>
                <div className={styles.titleContainer}>
                  <div className={styles.monitorToggleButtonsContainer}>
                    <div className={styles.toggleMonitoredContainer}>
                      <MonitorToggleButton
                        className={
                          monitored
                            ? styles.monitorToggleButton
                            : `${styles.monitorToggleButton} ${styles.unmonitored}`
                        }
                        monitored={monitored}
                        moviesMonitored={moviesMonitored}
                        type="sceneMonitor"
                        isSaving={isSaving}
                        size={30}
                        onPress={handleMonitorTogglePress}
                      />
                    </div>

                    <div className={styles.toggleMonitoredContainer}>
                      {showMovieMonitorToggle() ? (
                        <MonitorToggleButton
                          className={
                            moviesMonitored
                              ? styles.monitorToggleButton
                              : `${styles.monitorToggleButton} ${styles.unmonitored}`
                          }
                          monitored={monitored}
                          moviesMonitored={moviesMonitored}
                          type="movieMonitor"
                          isSaving={isSaving}
                          size={30}
                          onPress={handleMonitorTogglePress}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.title}>
                    <span className={styles.performerName}>{fullName}</span>
                    <PerformerGenderIcon
                      className={styles.gender}
                      gender={gender}
                      size={34}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.metadata}>
                <div>
                  {!!runningYears && (
                    <Label
                      className={styles.metadataLabel}
                      title={translate('Career')}
                      size={sizes.LARGE}
                    >
                      <Icon name={icons.CALENDAR} size={17} />
                      <span className={styles.years}>{runningYears}</span>
                    </Label>
                  )}
                  {!!formatedAge && (
                    <Label
                      className={styles.metadataLabel}
                      title={translate('DateOfBirth')}
                      size={sizes.LARGE}
                    >
                      <Icon name={icons.CAKE} size={17} />
                      <span className={styles.birthDate}>{formatedAge}</span>
                    </Label>
                  )}
                  {!!country && (
                    <Label
                      className={styles.metadataLabel}
                      title={translate('Nationality')}
                      size={sizes.LARGE}
                    >
                      <Icon name={icons.FLAG} size={17} />
                      <span className={styles.country}>{country}</span>
                    </Label>
                  )}
                  {!!ethnicity && (
                    <Label
                      className={styles.metadataLabel}
                      title={translate('Ethnicity')}
                      size={sizes.LARGE}
                    >
                      <Icon name={icons.GLOBE} size={17} />
                      <span className={styles.ethnicity}>
                        {firstCharToUpper(ethnicity)}
                      </span>
                    </Label>
                  )}
                </div>
              </div>

              <div className={styles.details}>
                {!!rootFolderPath && (
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
                      {rootFolderPath}
                    </span>
                  </Label>
                )}

                {!!qualityProfileId && (
                  <Label
                    className={styles.detailsLabel}
                    title={translate('QualityProfile')}
                    size={sizes.LARGE}
                  >
                    <Icon name={icons.PROFILE} size={17} />
                    <span className={styles.qualityProfileName}>
                      <QualityProfileName qualityProfileId={qualityProfileId} />
                    </span>
                  </Label>
                )}

                {!!statusDetails && (
                  <Label
                    className={styles.detailsLabel}
                    title={statusDetails.message}
                    size={sizes.LARGE}
                  >
                    <Icon name={statusDetails.icon} size={17} />
                    <span
                      title={statusDetails.message}
                      className={styles.statusName}
                    >
                      {statusDetails.title}
                    </span>
                  </Label>
                )}

                {(movieCount > 0 || totalMovieCount > 0) && (
                  <Label
                    className={styles.detailsLabel}
                    title={translate('MovieCount')}
                    size={sizes.LARGE}
                  >
                    <Icon name={icons.FILM} size={17} />
                    <span className={styles.movieCount}>
                      {translate('Movies')}: {movieCount} / {totalMovieCount}
                    </span>
                  </Label>
                )}

                {(sceneCount > 0 || totalSceneCount > 0) && (
                  <Label
                    className={styles.detailsLabel}
                    title={translate('SceneCount')}
                    size={sizes.LARGE}
                  >
                    <Icon name={icons.SCENE} size={17} />
                    <span className={styles.sceneCount}>
                      {translate('Scenes')}: {sceneCount} / {totalSceneCount}
                    </span>
                  </Label>
                )}

                {sizeOnDisk >= 0 ? (
                  <Label
                    className={styles.detailsLabel}
                    title={translate('SizeOnDisk')}
                    size={sizes.LARGE}
                  >
                    <Icon name={icons.DRIVE} size={17} />
                    <span className={styles.sceneCount}>
                      {formatBytes(sizeOnDisk)}
                    </span>
                  </Label>
                ) : null}

                {performerTags.length ? (
                  <Tooltip
                    anchor={
                      <Label className={styles.detailsLabel} size={sizes.LARGE}>
                        <Icon name={icons.TAGS} size={17} />

                        <span className={styles.tags}>{translate('Tags')}</span>
                      </Label>
                    }
                    tooltip={<PerformerTags tags={performerTags} />}
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
                    <PerformerDetailsLinks
                      tpdbId={tpdbId}
                      tmdbId={tmdbId}
                      foreignId={foreignId}
                    />
                  }
                  kind={kinds.INVERSE}
                  position={tooltipPositions.BOTTOM}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.contentContainer}>
          {!isFetching && moviesError ? (
            <Alert kind={kinds.DANGER}>
              {translate('LoadingMoviesFailed')}
            </Alert>
          ) : null}
          {/* Studios section (delayed render for each studio) */}
          {movies.length > 0 && (
            <FieldSet legend={translate('Works')}>
              {moviesByYear.map(({ year, movies: yearMovies }) => (
                <PerformerDetailsYear
                  key={year}
                  year={year}
                  performerId={performer.id}
                  columns={columns}
                  movies={yearMovies}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  isExpanded={!!expandedYears[year]}
                  isSmallScreen={false} // or use your actual logic for small screen
                  safeForWorkMode={safeForWorkMode}
                  onSortPress={handleSortPress}
                  onExpandPress={handleExpandYearPress}
                  onYearRefreshPress={onYearRefreshPress}
                />
              ))}
            </FieldSet>
          )}
        </div>
        <DeletePerformerModal
          isOpen={isDeleteMovieModalOpen}
          performer={performer}
          onModalClose={handleDeleteMovieModalClose}
        />
        <EditPerformerModal
          isOpen={isEditMovieModalOpen}
          performer={performer}
          onModalClose={handleEditMovieModalClose}
        />
      </PageContentBody>
    </PageContent>
  );
}

export default PerformerDetails;
