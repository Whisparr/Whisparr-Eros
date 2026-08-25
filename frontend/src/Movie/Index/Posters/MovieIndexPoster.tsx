import React, { SyntheticEvent, useCallback, useState } from 'react';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import { useSelect } from 'App/SelectContext';
import Command from 'Commands/Command';
import { MOVIE_SEARCH, REFRESH_MOVIE } from 'Commands/commandNames';
import { useExecuteCommand, useExecutingCommands } from 'Commands/useCommands';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import MovieTagList from 'Components/MovieTagList';
import { CommonPosterOptions } from 'Components/PosterOptionsForm';
import TmdbRating from 'Components/TmdbRating';
import Popover from 'Components/Tooltip/Popover';
import { icons } from 'Helpers/Props';
import DeleteMovieModal from 'Movie/Delete/DeleteMovieModal';
import MovieDetailsLinks from 'Movie/Details/MovieDetailsLinks';
import EditMovieModal from 'Movie/Edit/EditMovieModal';
import MovieIndexProgressBar from 'Movie/Index/ProgressBar/MovieIndexProgressBar';
import MovieIndexPosterSelect from 'Movie/Index/Select/MovieIndexPosterSelect';
import Movie, { Statistics } from 'Movie/Movie';
import MoviePoster from 'Movie/MoviePoster';
import { useQualityProfile } from 'Settings/Profiles/Quality/useQualityProfiles';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import formatDate from 'Utilities/Date/formatDate';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import translate from 'Utilities/String/translate';
import { useMovieIndexOption } from '../movieIndexOptionsStore';
import MovieIndexPosterInfo from './MovieIndexPosterInfo';
import styles from './MovieIndexPoster.css';

interface MovieIndexPosterProps {
  movie: Movie;
  sortKey: string;
  isSelectMode: boolean;
  posterWidth: number;
  posterHeight: number;
  posterOptions?: CommonPosterOptions;
}

function MovieIndexPoster(props: Readonly<MovieIndexPosterProps>) {
  const {
    movie,
    sortKey,
    isSelectMode,
    posterWidth,
    posterHeight,
    posterOptions,
  } = props;
  const movieId = movie.id;

  const qualityProfile = useQualityProfile(movie.qualityProfileId);

  const executingCommands = useExecutingCommands();

  const isRefreshingMovie = executingCommands.some(
    (command: Command) =>
      command.name === REFRESH_MOVIE && command.body.movieId === movieId
  );

  const isSearchingMovie = executingCommands.some(
    (command: Command) =>
      command.name === MOVIE_SEARCH && command.body.movieId === movieId
  );

  const safeForWorkMode = useSafeForWorkMode();

  const indexPosterOptions = useMovieIndexOption('posterOptions');
  const {
    detailedProgressBar,
    showTitle,
    showMonitored,
    showQualityProfile,
    showReleaseDate,
    showSearchAction,
  } = posterOptions ?? indexPosterOptions;
  const showTmdbRating = posterOptions
    ? false
    : indexPosterOptions.showTmdbRating;
  const showTags = posterOptions ? false : indexPosterOptions.showTags;

  const { showRelativeDates, shortDateFormat, longDateFormat, timeFormat } =
    useUiSettingsValues();

  const {
    title,
    titleSlug,
    monitored,
    status,
    images,
    foreignId,
    tmdbId,
    tpdbId,
    website,
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
    tags = [],
  } = movie;

  const { sizeOnDisk = 0 } = statistics;

  const executeCommand = useExecuteCommand();
  const [hasPosterError, setHasPosterError] = useState(false);
  const [isEditMovieModalOpen, setIsEditMovieModalOpen] = useState(false);
  const [isDeleteMovieModalOpen, setIsDeleteMovieModalOpen] = useState(false);

  const onRefreshPress = useCallback(() => {
    executeCommand({
      name: REFRESH_MOVIE,
      movieIds: [movieId],
    });
  }, [movieId, executeCommand]);

  const onSearchPress = useCallback(() => {
    executeCommand({
      name: MOVIE_SEARCH,
      movieIds: [movieId],
    });
  }, [movieId, executeCommand]);

  const onPosterLoadError = useCallback(() => {
    setHasPosterError(true);
  }, [setHasPosterError]);

  const onPosterLoad = useCallback(() => {
    setHasPosterError(false);
  }, [setHasPosterError]);

  const onEditMoviePress = useCallback(() => {
    setIsEditMovieModalOpen(true);
  }, [setIsEditMovieModalOpen]);

  const onEditMovieModalClose = useCallback(() => {
    setIsEditMovieModalOpen(false);
  }, [setIsEditMovieModalOpen]);

  const onDeleteMoviePress = useCallback(() => {
    setIsEditMovieModalOpen(false);
    setIsDeleteMovieModalOpen(true);
  }, [setIsDeleteMovieModalOpen]);

  const onDeleteMovieModalClose = useCallback(() => {
    setIsDeleteMovieModalOpen(false);
  }, [setIsDeleteMovieModalOpen]);

  const [selectState, selectDispatch] = useSelect();

  const onSelectPress = useCallback(
    (event: SyntheticEvent<HTMLElement, MouseEvent>) => {
      if (event.nativeEvent.ctrlKey || event.nativeEvent.metaKey) {
        window.open(`/movie/${foreignId}`, '_blank');
        return;
      }

      const shiftKey = event.nativeEvent.shiftKey;

      selectDispatch({
        type: 'toggleSelected',
        id: movieId,
        isSelected: !selectState.selectedState[movieId],
        shiftKey,
      });
    },
    [movieId, selectState.selectedState, selectDispatch, foreignId]
  );

  const link = `/movie/${titleSlug}`;

  const linkProps = isSelectMode ? { onPress: onSelectPress } : { to: link };

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
  };

  return (
    <div className={styles.content}>
      <div className={styles.posterContainer} title={title}>
        {isSelectMode ? <MovieIndexPosterSelect movieId={movieId} /> : null}

        <Label className={styles.controls}>
          <SpinnerIconButton
            name={icons.REFRESH}
            title={translate('RefreshMovie')}
            isSpinning={isRefreshingMovie}
            onPress={onRefreshPress}
          />

          {showSearchAction ? (
            <SpinnerIconButton
              className={styles.action}
              name={icons.SEARCH}
              title={translate('SearchForMovie')}
              isSpinning={isSearchingMovie}
              onPress={onSearchPress}
            />
          ) : null}

          <IconButton
            name={icons.EDIT}
            title={translate('EditMovie')}
            onPress={onEditMoviePress}
          />

          <span className={styles.externalLinks}>
            <Popover
              anchor={<Icon name={icons.EXTERNAL_LINK} size={12} />}
              title={translate('Links')}
              body={
                <MovieDetailsLinks
                  stashId={foreignId}
                  tmdbId={tmdbId}
                  tpdbId={tpdbId}
                  website={website}
                />
              }
            />
          </span>
        </Label>

        {status === 'deleted' ? (
          <div className={styles.deleted} title={translate('Deleted')} />
        ) : null}

        <Link className={styles.link} style={elementStyle} {...linkProps}>
          <MoviePoster
            safeForWorkMode={safeForWorkMode}
            style={elementStyle}
            images={images}
            size={250}
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

      <MovieIndexProgressBar
        movieId={movieId}
        movieFile={movieFile}
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
        <div
          className={styles.title}
          title={`${translate('ReleaseDate')}: ${formatDate(
            releaseDate,
            longDateFormat
          )}`}
        >
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

      {showTmdbRating && !!ratings.tmdb ? (
        <div className={styles.title}>
          <TmdbRating ratings={ratings} iconSize={12} />
        </div>
      ) : null}

      {showTags && tags.length ? (
        <div className={styles.tags}>
          <div className={styles.tagsList}>
            <MovieTagList tags={tags} />
          </div>
        </div>
      ) : null}

      <MovieIndexPosterInfo
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
        tags={tags}
        showTmdbRating={showTmdbRating}
        showTags={showTags}
      />

      <EditMovieModal
        isOpen={isEditMovieModalOpen}
        movie={movie}
        onModalClose={onEditMovieModalClose}
        onDeleteMoviePress={onDeleteMoviePress}
      />

      <DeleteMovieModal
        isOpen={isDeleteMovieModalOpen}
        movie={movie}
        onModalClose={onDeleteMovieModalClose}
      />
    </div>
  );
}

export default MovieIndexPoster;
