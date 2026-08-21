import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextTruncate from 'react-text-truncate';
import { useQueueItemForMovie } from 'Activity/Queue/Details/useQueueDetails';
import { useAppDimension } from 'App/appStore';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import { MOVIE_SEARCH, REFRESH_MOVIE } from 'Commands/commandNames';
import { useExecuteCommand } from 'Commands/useCommands';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import InfoLabel from 'Components/InfoLabel';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Marquee from 'Components/Marquee';
import Measure from 'Components/Measure';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import posterPlaceholder from 'Components/posterPlaceholder';
import TmdbRating from 'Components/TmdbRating';
import Tooltip from 'Components/Tooltip/Tooltip';
import {
  icons,
  kinds,
  sizes,
  sortDirections,
  tooltipPositions,
} from 'Helpers/Props';
import InteractiveImportModal from 'InteractiveImport/InteractiveImportModal';
import DeleteMovieModal from 'Movie/Delete/DeleteMovieModal';
import EditMovieModal from 'Movie/Edit/EditMovieModal';
import getMovieStatusDetails from 'Movie/getMovieStatusDetails';
import MovieHistoryModal from 'Movie/History/MovieHistoryModal';
import {
  Image as MovieImageType,
  Statistics as MovieStatistics,
} from 'Movie/Movie';
import MovieCollectionLabel from 'Movie/MovieCollectionLabel';
import MovieGenres from 'Movie/MovieGenres';
import MovieImage from 'Movie/MovieImage';
import MovieInteractiveSearchModal from 'Movie/Search/MovieInteractiveSearchModal';
import { useMovie, useToggleMovieMonitored } from 'Movie/useMovie';
import MovieFileEditorTable from 'MovieFile/Editor/MovieFileEditorTable';
import ExtraFileTable from 'MovieFile/Extras/ExtraFileTable';
import OrganizePreviewModal from 'Organize/OrganizePreviewModal';
import QualityProfileName from 'Settings/Profiles/Quality/QualityProfileName';
import fonts from 'Styles/Variables/fonts';
import formatRuntime from 'Utilities/Date/formatRuntime';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import MovieCastPostersConnector from './Credits/Cast/MovieCastPostersConnector';
import MovieDetailsLinks from './MovieDetailsLinks';
import MovieStatusLabel from './MovieStatusLabel';
import MovieStudioLink from './MovieStudioLink';
import MovieTags from './MovieTags';
import ReleaseDateDisplay from './ReleaseDateDisplay';
import MovieTitlesTable from './Titles/MovieTitlesTable';
import useMovieDetailsModals from './useMovieDetailsModals';
import styles from './MovieDetails.css';

interface Props {
  isSaving: boolean;
  isRefreshing: boolean;
  isSearching: boolean;
  isFetching: boolean;
  isPopulated: boolean;
  isSmallScreen: boolean;
  isSidebarVisible: boolean;
  movieFilesError?: unknown;
  extraFilesError?: unknown;
  movieCreditsError?: unknown;
  onRefreshPress: () => void;
  onSearchPress: () => void;
  onGoToMovie: () => void;
  movieRuntimeFormat: string;
}

const defaultFontSize = Number(fonts.defaultFontSize);
const lineHeight = Number.parseFloat(fonts.lineHeight);

function getFanartUrl(images: MovieImageType[]) {
  const image = images.find((img) => img.coverType === 'fanart');
  return image?.url ?? image?.remoteUrl;
}

function MovieDetails(props: Readonly<Partial<Props>>) {
  // Get id from route params and fetch movie data
  const { id } = useParams();
  const executeCommand = useExecuteCommand();
  const safeForWorkMode = useContext(SafeForWorkModeContext);

  const { data: movie, isLoading, isError, error } = useMovie(id);
  const statusDetails = getMovieStatusDetails(movie?.status);
  const queueItem = useQueueItemForMovie(movie?.id ?? 0);

  // State for modals and measurements
  const isSmallScreen = useAppDimension('isSmallScreen');
  const [overviewHeight, setOverviewHeight] = useState(0);
  const [titleWidth, setTitleWidth] = useState(0);
  const { mutate: toggleMonitored } = useToggleMovieMonitored();

  const {
    isOrganizeModalOpen,
    isMovieHistoryModalOpen,
    isInteractiveSearchModalOpen,
    isInteractiveImportModalOpen,
    isEditMovieModalOpen,
    isDeleteMovieModalOpen,
    handleOrganizePress,
    handleOrganizeModalClose,
    handleMovieHistoryPress,
    handleMovieHistoryModalClose,
    handleInteractiveSearchPress,
    handleInteractiveSearchModalClose,
    handleInteractiveImportPress,
    handleInteractiveImportModalClose,
    handleEditMoviePress,
    handleEditMovieModalClose,
    handleDeleteMoviePress,
    handleDeleteMovieModalClose,
  } = useMovieDetailsModals();

  // Error handling for movie fetch
  if (isError) {
    return (
      <PageContentBody>
        <Alert kind={kinds.DANGER}>{`${translate('LoadingMovieFailed')}: ${
          error?.message || 'Not found'
        }`}</Alert>
      </PageContentBody>
    );
  }

  // Null check
  if (!movie) {
    if (isLoading) {
      return (
        <PageContentBody>
          <LoadingIndicator />
        </PageContentBody>
      );
    }
    return null;
  }

  const {
    tmdbId,
    tpdbId,
    stashId,
    title,
    code,
    year,
    releaseDate,
    runtime,
    certification,
    ratings,
    path,
    statistics = {},
    qualityProfileId,
    monitored,
    studioTitle,
    genres = [],
    collection,
    overview,
    website,
    isAvailable,
    images,
    tags = [],
    itemType,
    movieRuntimeFormat,
    isSaving,
    isRefreshing,
    isSearching,
  } = { ...props, ...movie };

  const movieId = movie.id;
  const { sizeOnDisk } = statistics as MovieStatistics;
  const hasFile = !!movie.movieFileId || sizeOnDisk > 0;
  const fanartUrl = getFanartUrl(images);
  const marqueeWidth = isSmallScreen ? titleWidth : titleWidth - 150;
  const titleWithYear = year > 0 ? `${title} (${year})` : title;

  function handleTitleMeasure({ width }: { width: number }) {
    setTitleWidth(width);
  }
  function handleOverviewMeasure({ height }: { height: number }) {
    setOverviewHeight(height);
  }

  function handleRefreshPress() {
    executeCommand({
      name: REFRESH_MOVIE,
      movieIds: [movieId],
    });
  }
  function handleSearchPress() {
    executeCommand({
      name: MOVIE_SEARCH,
      movieIds: [movieId],
    });
  }

  function handleMonitoredPress() {
    if (!movie) return;
    toggleMonitored({ id: movie.id, monitored: !monitored });
  }

  return (
    <PageContent title={titleWithYear}>
      <PageToolbar>
        <PageToolbarSection>
          <PageToolbarButton
            label={translate('RefreshAndScan')}
            iconName={icons.REFRESH}
            spinningName={icons.REFRESH}
            title={translate('RefreshInformationAndScanDisk')}
            isSpinning={isRefreshing}
            onPress={handleRefreshPress}
          />
          <PageToolbarButton
            label={translate('SearchMovie')}
            iconName={icons.SEARCH}
            isSpinning={isSearching}
            onPress={handleSearchPress}
          />
          <PageToolbarButton
            label={translate('InteractiveSearch')}
            iconName={icons.INTERACTIVE}
            isSpinning={isSearching}
            onPress={handleInteractiveSearchPress}
          />
          <PageToolbarSeparator />
          <PageToolbarButton
            label={translate('PreviewRename')}
            iconName={icons.ORGANIZE}
            isDisabled={!hasFile}
            onPress={handleOrganizePress}
          />
          <PageToolbarButton
            label={translate('ManageFiles')}
            iconName={icons.MOVIE_FILE}
            onPress={handleInteractiveImportPress}
          />
          <PageToolbarButton
            label={translate('History')}
            iconName={icons.HISTORY}
            onPress={handleMovieHistoryPress}
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
      </PageToolbar>
      <PageContentBody innerClassName={styles.innerContentBody}>
        <div
          className={itemType === 'movie' ? styles.header : styles.sceneHeader}
        >
          <div
            className={styles.backdrop}
            style={
              fanartUrl && !safeForWorkMode
                ? { backgroundImage: `url(${fanartUrl})` }
                : undefined
            }
          >
            <div className={styles.backdropOverlay} />
          </div>
          <div className={styles.headerContent}>
            <MovieImage
              safeForWorkMode={safeForWorkMode}
              className={
                itemType === 'movie' ? styles.poster : styles.screenshot
              }
              coverType={itemType === 'movie' ? 'poster' : 'screenshot'}
              images={images}
              size={500}
              lazy={true}
              placeholder={posterPlaceholder}
            />
            <div className={styles.info}>
              <Measure onMeasure={handleTitleMeasure}>
                <div className={styles.titleRow}>
                  <div className={styles.titleContainer}>
                    <div className={styles.toggleMonitoredContainer}>
                      <MonitorToggleButton
                        className={styles.monitorToggleButton}
                        isDisabled={false}
                        monitored={monitored}
                        moviesMonitored={monitored}
                        type={
                          movie.itemType === 'movie'
                            ? 'movieMonitor'
                            : 'sceneMonitor'
                        }
                        isSaving={isSaving}
                        size={40}
                        onPress={handleMonitoredPress}
                      />
                    </div>
                    <div
                      className={styles.title}
                      style={{ width: marqueeWidth }}
                    >
                      <Marquee className="marquee" text={title} />
                    </div>
                  </div>
                </div>
              </Measure>
              <div className={styles.details}>
                <div>
                  {certification ? (
                    <span
                      className={styles.certification}
                      title={translate('Certification')}
                    >
                      {certification}
                    </span>
                  ) : null}
                  {releaseDate ? (
                    <ReleaseDateDisplay releaseDate={releaseDate} />
                  ) : null}
                  {movie ? (
                    <span className={styles.studio}>
                      <MovieStudioLink movie={movie} />
                    </span>
                  ) : null}
                  {runtime ? (
                    <span
                      className={styles.runtime}
                      title={translate('Runtime')}
                    >
                      {formatRuntime(runtime, movieRuntimeFormat)}
                    </span>
                  ) : null}

                  <span className={styles.links}>
                    <Tooltip
                      anchor={<Icon name={icons.EXTERNAL_LINK} size={20} />}
                      tooltip={
                        <MovieDetailsLinks
                          tmdbId={tmdbId}
                          tpdbId={tpdbId}
                          stashId={stashId ?? undefined}
                          website={website}
                        />
                      }
                      position={tooltipPositions.BOTTOM}
                    />
                  </span>
                  {!!tags.length && (
                    <span>
                      <Tooltip
                        anchor={<Icon name={icons.TAGS} size={20} />}
                        tooltip={<MovieTags key={movieId} movie={movie} />}
                        position={tooltipPositions.BOTTOM}
                      />
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.details}>
                {!!ratings?.tmdb && (
                  <span className={styles.rating}>
                    <TmdbRating ratings={ratings} iconSize={20} />
                  </span>
                )}
              </div>
              <div className={styles.detailsInfoLabelContainer}>
                <InfoLabel
                  className={styles.detailsInfoLabel}
                  name={translate('Path')}
                  size={sizes.LARGE}
                >
                  <span className={styles.path}>{path}</span>
                </InfoLabel>
                <InfoLabel
                  className={styles.detailsInfoLabel}
                  name={translate('Status')}
                  title={statusDetails.message}
                  kind={kinds.DELETE}
                  size={sizes.LARGE}
                >
                  <span className={styles.statusName}>
                    <MovieStatusLabel
                      status={statusDetails.title}
                      hasMovieFiles={hasFile ?? false}
                      monitored={monitored}
                      isAvailable={isAvailable}
                      queueItem={queueItem ?? false}
                    />
                  </span>
                </InfoLabel>
                <InfoLabel
                  className={styles.detailsInfoLabel}
                  name={translate('QualityProfile')}
                  size={sizes.LARGE}
                >
                  <span className={styles.qualityProfileName}>
                    <QualityProfileName qualityProfileId={qualityProfileId} />
                  </span>
                </InfoLabel>
                <InfoLabel
                  className={styles.detailsInfoLabel}
                  name={translate('Size')}
                  size={sizes.LARGE}
                >
                  <span className={styles.sizeOnDisk}>
                    {formatBytes(sizeOnDisk)}
                  </span>
                </InfoLabel>
                {collection ? (
                  <InfoLabel
                    className={styles.detailsInfoLabel}
                    name={translate('Collection')}
                    size={sizes.LARGE}
                  >
                    <div className={styles.collection}>
                      <MovieCollectionLabel tmdbId={collection.tmdbId} />
                    </div>
                  </InfoLabel>
                ) : null}
                {!!code && !!code.length && (
                  <InfoLabel
                    className={styles.detailsInfoLabel}
                    name={translate('Code')}
                    title={translate('Code')}
                    size={sizes.LARGE}
                  >
                    <span className={styles.code}>{code}</span>
                  </InfoLabel>
                )}
                {studioTitle && !isSmallScreen ? (
                  <InfoLabel
                    className={styles.detailsInfoLabel}
                    name={translate('Studio')}
                    size={sizes.LARGE}
                  >
                    <span className={styles.studio}>{studioTitle}</span>
                  </InfoLabel>
                ) : null}
                {genres.length && !isSmallScreen ? (
                  <InfoLabel
                    className={styles.detailsInfoLabel}
                    name={translate('Genres')}
                    size={sizes.LARGE}
                  >
                    <MovieGenres className={styles.genres} genres={genres} />
                  </InfoLabel>
                ) : null}
              </div>
              <Measure onMeasure={handleOverviewMeasure}>
                <div className={styles.overview}>
                  <TextTruncate
                    line={Math.floor(
                      overviewHeight / (defaultFontSize * lineHeight)
                    )}
                    text={overview}
                  />
                </div>
              </Measure>
            </div>
          </div>
        </div>

        {/* FILES, CAST, TITLES */}
        <div className={styles.contentContainer}>
          <FieldSet legend={translate('Files')}>
            <MovieFileEditorTable movieId={movieId} />
            <ExtraFileTable movieId={movieId} />
          </FieldSet>

          <FieldSet legend={translate('Cast')}>
            <MovieCastPostersConnector
              movieId={Number(movieId)}
              isSmallScreen={isSmallScreen}
            />
          </FieldSet>

          <FieldSet legend={translate('Titles')}>
            <MovieTitlesTable
              alternateTitles={movie?.alternateTitles ?? []}
              isLoading={isLoading}
              error={error}
            />
          </FieldSet>
        </div>

        {/* MODALS */}
        <OrganizePreviewModal
          isOpen={isOrganizeModalOpen}
          movieId={Number(movieId)}
          onModalClose={handleOrganizeModalClose}
        />
        <EditMovieModal
          isOpen={isEditMovieModalOpen}
          movie={movie}
          onModalClose={handleEditMovieModalClose}
          onDeleteMoviePress={handleDeleteMoviePress}
        />
        <MovieHistoryModal
          isOpen={isMovieHistoryModalOpen}
          movieId={movieId}
          onModalClose={handleMovieHistoryModalClose}
        />
        <DeleteMovieModal
          isOpen={isDeleteMovieModalOpen}
          movie={movie}
          onModalClose={handleDeleteMovieModalClose}
        />
        <InteractiveImportModal
          isOpen={isInteractiveImportModalOpen}
          movie={movie}
          movieId={movieId}
          title={title}
          folder={path}
          initialSortKey="relativePath"
          initialSortDirection={sortDirections.ASCENDING}
          showMovie={false}
          allowMovieChange={false}
          showDelete={true}
          showImportMode={false}
          modalTitle={translate('ManageFiles')}
          onModalClose={handleInteractiveImportModalClose}
        />
        <MovieInteractiveSearchModal
          isOpen={isInteractiveSearchModalOpen}
          movieId={movieId}
          onModalClose={handleInteractiveSearchModalClose}
        />
      </PageContentBody>
    </PageContent>
  );
}

export default MovieDetails;
