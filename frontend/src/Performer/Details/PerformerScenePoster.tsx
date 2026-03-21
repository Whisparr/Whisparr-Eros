import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import SceneIndexProgressBar from 'Scene/Index/ProgressBar/SceneIndexProgressBar';
import ScenePoster from 'Scene/ScenePoster';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import styles from './PerformerScenePoster.css';

interface PerformerScenePosterProps {
  movie: Movie;
  posterWidth: number;
  posterHeight: number;
}

function PerformerScenePoster(props: PerformerScenePosterProps) {
  const { movie, posterWidth, posterHeight } = props;

  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const { showRelativeDates, shortDateFormat, timeFormat } = useSelector(
    createUISettingsSelector()
  );

  const [hasPosterError, setHasPosterError] = useState(false);

  const onPosterLoadError = useCallback(() => {
    setHasPosterError(true);
  }, []);

  const onPosterLoad = useCallback(() => {
    setHasPosterError(false);
  }, []);

  const {
    title,
    foreignId,
    images,
    releaseDate,
    studioTitle,
    monitored,
    status,
    hasFile,
    isAvailable,
    movieFile,
  } = movie;

  const link = `/movie/${foreignId}`;

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
  };

  return (
    <div className={styles.content}>
      <div className={styles.posterContainer} title={title}>
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
        sceneId={movie.id}
        sceneFile={movieFile}
        monitored={monitored}
        hasFile={hasFile}
        isAvailable={isAvailable}
        status={status}
        width={posterWidth}
        detailedProgressBar={false}
        bottomRadius={false}
      />

      <div className={styles.title} title={title}>
        {title}
      </div>

      {releaseDate ? (
        <div className={styles.info} title={releaseDate}>
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

      {studioTitle ? (
        <div className={styles.info} title={studioTitle}>
          {studioTitle}
        </div>
      ) : null}
    </div>
  );
}

export default PerformerScenePoster;
