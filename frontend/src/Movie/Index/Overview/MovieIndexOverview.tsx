import React, { useCallback, useMemo, useState } from 'react';
import TextTruncate from 'react-text-truncate';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import Command from 'Commands/Command';
import { MOVIE_SEARCH, REFRESH_MOVIE } from 'Commands/commandNames';
import { useExecuteCommand, useExecutingCommands } from 'Commands/useCommands';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import MovieTagList from 'Components/MovieTagList';
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
import dimensions from 'Styles/Variables/dimensions';
import fonts from 'Styles/Variables/fonts';
import translate from 'Utilities/String/translate';
import { useMovieIndexOption } from '../movieIndexOptionsStore';
import MovieIndexOverviewInfo from './MovieIndexOverviewInfo';
import styles from './MovieIndexOverview.css';

const columnPadding = Number.parseInt(dimensions.movieIndexColumnPadding, 10);
const columnPaddingSmallScreen = Number.parseInt(
  dimensions.movieIndexColumnPaddingSmallScreen,
  10
);
const defaultFontSize = Number.parseInt(fonts.defaultFontSize, 10);
const lineHeight = Number.parseFloat(fonts.lineHeight);

// Hardcoded height beased on line-height of 32 + bottom margin of 10.
// Less side-effecty than using react-measure.
const titleRowHeight = 42;

interface MovieIndexOverviewProps {
  movie: Movie;
  sortKey: string;
  posterWidth: number;
  posterHeight: number;
  rowHeight: number;
  isSelectMode: boolean;
  isSmallScreen: boolean;
}

function MovieIndexOverview(props: Readonly<MovieIndexOverviewProps>) {
  const {
    movie,
    sortKey,
    posterWidth,
    posterHeight,
    rowHeight,
    isSelectMode,
    isSmallScreen,
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

  const overviewOptions = useMovieIndexOption('overviewOptions');

  const {
    title,
    titleSlug,
    monitored,
    status,
    path,
    overview,
    website,
    statistics = {} as Statistics,
    images,
    tags,
    hasFile,
    isAvailable,
    tmdbId,
    tpdbId,
    studioTitle,
    added,
  } = movie;

  const { sizeOnDisk = 0 } = statistics;

  const executeCommand = useExecuteCommand();
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

  const link = `/movie/${titleSlug}`;

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
  };

  const contentHeight = useMemo(() => {
    const padding = isSmallScreen ? columnPaddingSmallScreen : columnPadding;

    return rowHeight - padding;
  }, [rowHeight, isSmallScreen]);

  const overviewHeight = contentHeight - titleRowHeight;

  return (
    <div>
      <div className={styles.content}>
        <div className={styles.poster}>
          <div className={styles.posterContainer}>
            {isSelectMode ? <MovieIndexPosterSelect movieId={movieId} /> : null}

            {status === 'deleted' ? (
              <div className={styles.deleted} title={translate('Deleted')} />
            ) : null}

            <Link className={styles.link} style={elementStyle} to={link}>
              <MoviePoster
                safeForWorkMode={safeForWorkMode}
                className={styles.poster}
                style={elementStyle}
                images={images}
                size={250}
                lazy={true}
                overflow={true}
                title={title}
              />
            </Link>
          </div>

          <MovieIndexProgressBar
            movieId={movieId}
            movieFile={movie.movieFile}
            monitored={monitored}
            hasFile={hasFile}
            isAvailable={isAvailable}
            status={status}
            width={posterWidth}
            detailedProgressBar={overviewOptions.detailedProgressBar}
            bottomRadius={false}
          />
        </div>

        <div className={styles.info} style={{ maxHeight: contentHeight }}>
          <div className={styles.titleRow}>
            <Link className={styles.title} to={link}>
              {title}
            </Link>

            <div className={styles.actions}>
              <span className={styles.externalLinks}>
                <Popover
                  anchor={<Icon name={icons.EXTERNAL_LINK} size={12} />}
                  title={translate('Links')}
                  body={
                    <MovieDetailsLinks
                      website={website}
                      tmdbId={tmdbId}
                      tpdbId={tpdbId}
                    />
                  }
                />
              </span>

              <SpinnerIconButton
                name={icons.REFRESH}
                title={translate('RefreshMovie')}
                isSpinning={isRefreshingMovie}
                onPress={onRefreshPress}
              />

              {overviewOptions.showSearchAction ? (
                <SpinnerIconButton
                  className={styles.actions}
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
            </div>
          </div>

          <div className={styles.details}>
            <div className={styles.overviewContainer}>
              <Link className={styles.overview} to={link}>
                <TextTruncate
                  line={Math.floor(
                    overviewHeight / (defaultFontSize * lineHeight)
                  )}
                  text={overview}
                />
              </Link>

              {overviewOptions.showTags ? (
                <div className={styles.tags}>
                  <MovieTagList tags={tags} />
                </div>
              ) : null}
            </div>
            <MovieIndexOverviewInfo
              height={overviewHeight}
              monitored={monitored}
              qualityProfile={qualityProfile}
              studio={studioTitle}
              sizeOnDisk={sizeOnDisk}
              added={added}
              path={path}
              sortKey={sortKey}
              {...overviewOptions}
            />
          </div>
        </div>
      </div>

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

export default MovieIndexOverview;
