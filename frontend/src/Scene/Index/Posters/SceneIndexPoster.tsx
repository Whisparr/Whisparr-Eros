import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import AppState from 'App/State/AppState';
import Command from 'Commands/Command';
import { MOVIE_SEARCH, REFRESH_MOVIE } from 'Commands/commandNames';
import { useExecuteCommand, useExecutingCommands } from 'Commands/useCommands';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import Popover from 'Components/Tooltip/Popover';
import { icons } from 'Helpers/Props';
import EditMovieModal from 'Movie/Edit/EditMovieModal';
import MovieIndexPosterSelect from 'Movie/Index/Select/MovieIndexPosterSelect';
import Movie, { Statistics } from 'Movie/Movie';
import DeleteSceneModal from 'Scene/Delete/DeleteSceneModal';
import SceneDetailsLinks from 'Scene/Details/SceneDetailsLinks';
import SceneIndexProgressBar from 'Scene/Index/ProgressBar/SceneIndexProgressBar';
import ScenePoster from 'Scene/ScenePoster';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import translate from 'Utilities/String/translate';
import { useSceneIndexOption } from '../sceneIndexOptionsStore';
import SceneIndexPosterInfo from './SceneIndexPosterInfo';
import styles from './SceneIndexPoster.css';

interface SceneIndexPosterProps {
  scene: Movie;
  sortKey: string;
  isSelectMode: boolean;
  posterWidth: number;
  posterHeight: number;
}

function SceneIndexPoster(props: Readonly<SceneIndexPosterProps>) {
  const { scene, sortKey, isSelectMode, posterWidth, posterHeight } = props;
  const sceneId = scene.id;

  const qualityProfile = useSelector((state: AppState) =>
    state.settings.qualityProfiles.items.find(
      (p) => p.id === scene.qualityProfileId
    )
  );

  const executingCommands = useExecutingCommands();

  const isRefreshingScene = executingCommands.some(
    (command: Command) =>
      command.name === REFRESH_MOVIE && command.body.movieId === sceneId
  );

  const isSearchingScene = executingCommands.some(
    (command: Command) =>
      command.name === MOVIE_SEARCH && command.body.movieId === sceneId
  );

  const safeForWorkMode = useSafeForWorkMode();

  const {
    detailedProgressBar,
    showTitle,
    showMonitored,
    showQualityProfile,
    showReleaseDate,
    showSearchAction,
  } = useSceneIndexOption('posterOptions');

  const { showRelativeDates, shortDateFormat, longDateFormat, timeFormat } =
    useSelector(createUISettingsSelector());

  const {
    title,
    monitored,
    status,
    images,
    foreignId,
    hasFile,
    isAvailable,
    studioTitle,
    added,
    year,
    releaseDate,
    path,
    movieFile,
    ratings,
    statistics = {} as Statistics,
    originalLanguage,
  } = scene;

  const { sizeOnDisk = 0 } = statistics;

  const executeCommand = useExecuteCommand();
  const [hasPosterError, setHasPosterError] = useState(false);
  const [isEditSceneModalOpen, setIsEditSceneModalOpen] = useState(false);
  const [isDeleteSceneModalOpen, setIsDeleteSceneModalOpen] = useState(false);

  const onRefreshPress = useCallback(() => {
    executeCommand({
      name: REFRESH_MOVIE,
      movieIds: [sceneId],
    });
  }, [sceneId, executeCommand]);

  const onSearchPress = useCallback(() => {
    executeCommand({
      name: MOVIE_SEARCH,
      movieIds: [sceneId],
    });
  }, [sceneId, executeCommand]);

  const onPosterLoadError = useCallback(() => {
    setHasPosterError(true);
  }, [setHasPosterError]);

  const onPosterLoad = useCallback(() => {
    setHasPosterError(false);
  }, [setHasPosterError]);

  const onEditScenePress = useCallback(() => {
    setIsEditSceneModalOpen(true);
  }, [setIsEditSceneModalOpen]);

  const onEditSceneModalClose = useCallback(() => {
    setIsEditSceneModalOpen(false);
  }, [setIsEditSceneModalOpen]);

  const onDeleteScenePress = useCallback(() => {
    setIsEditSceneModalOpen(false);
    setIsDeleteSceneModalOpen(true);
  }, [setIsDeleteSceneModalOpen]);

  const onDeleteSceneModalClose = useCallback(() => {
    setIsDeleteSceneModalOpen(false);
  }, [setIsDeleteSceneModalOpen]);

  const link = `/movie/${foreignId}`;

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
  };

  return (
    <div className={styles.content}>
      <div className={styles.posterContainer} title={title}>
        {isSelectMode ? <MovieIndexPosterSelect movieId={sceneId} /> : null}

        <Label className={styles.controls}>
          <SpinnerIconButton
            name={icons.REFRESH}
            title={translate('RefreshScene')}
            isSpinning={isRefreshingScene}
            onPress={onRefreshPress}
          />

          {showSearchAction ? (
            <SpinnerIconButton
              className={styles.action}
              name={icons.SEARCH}
              title={translate('SearchForScene')}
              isSpinning={isSearchingScene}
              onPress={onSearchPress}
            />
          ) : null}

          <IconButton
            name={icons.EDIT}
            title={translate('EditScene')}
            onPress={onEditScenePress}
          />

          <span className={styles.externalLinks}>
            <Popover
              anchor={<Icon name={icons.EXTERNAL_LINK} size={12} />}
              title={translate('Links')}
              body={<SceneDetailsLinks foreignId={foreignId} />}
            />
          </span>
        </Label>

        <Link className={styles.link} style={elementStyle} to={link}>
          <ScenePoster
            className={styles.poster}
            safeForWorkMode={safeForWorkMode}
            style={elementStyle}
            images={images}
            size={180}
            lazy={true}
            overflow={true}
            onError={onPosterLoadError}
            onLoad={onPosterLoad}
          />

          {hasPosterError ? (
            <div className={styles.overlayTitle}>{title}</div>
          ) : null}
        </Link>
      </div>

      <SceneIndexProgressBar
        sceneId={sceneId}
        sceneFile={movieFile}
        monitored={monitored}
        hasFile={hasFile}
        isAvailable={isAvailable}
        status={status}
        width={posterWidth}
        detailedProgressBar={detailedProgressBar}
        bottomRadius={false}
      />

      {showTitle ? (
        <div className={styles.title} title={title}>
          {title}
        </div>
      ) : null}

      {showMonitored ? (
        <div className={styles.title}>
          {monitored ? translate('Monitored') : translate('Unmonitored')}
        </div>
      ) : null}

      {showQualityProfile && !!qualityProfile?.name ? (
        <div className={styles.title} title={translate('QualityProfile')}>
          {qualityProfile.name}
        </div>
      ) : null}

      {showReleaseDate && releaseDate ? (
        <div className={styles.title} title={translate('ReleaseDate')}>
          <Icon name={icons.CALENDAR} />{' '}
          {getRelativeDate({
            date: releaseDate,
            shortDateFormat,
            showRelativeDates,
            timeFormat,
            timeForToday: false,
          })}
        </div>
      ) : null}

      <SceneIndexPosterInfo
        studio={studioTitle}
        qualityProfile={qualityProfile}
        added={added}
        year={year}
        showQualityProfile={showQualityProfile}
        showReleaseDate={showReleaseDate}
        showRelativeDates={showRelativeDates}
        shortDateFormat={shortDateFormat}
        longDateFormat={longDateFormat}
        timeFormat={timeFormat}
        releaseDate={releaseDate}
        ratings={ratings}
        sizeOnDisk={sizeOnDisk}
        sortKey={sortKey}
        path={path}
        originalLanguage={originalLanguage}
      />

      <EditMovieModal
        isOpen={isEditSceneModalOpen}
        movie={scene}
        onModalClose={onEditSceneModalClose}
        onDeleteMoviePress={onDeleteScenePress}
      />

      <DeleteSceneModal
        isOpen={isDeleteSceneModalOpen}
        scene={scene}
        onModalClose={onDeleteSceneModalClose}
      />
    </div>
  );
}

export default SceneIndexPoster;
