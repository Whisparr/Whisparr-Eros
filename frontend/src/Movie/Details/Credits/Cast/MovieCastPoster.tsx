import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import Link from 'Components/Link/Link';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import MovieHeadshot from 'Movie/MovieHeadshot';
import MovieCredit from 'typings/MovieCredit';
import styles from '../MovieCreditPoster.css';

interface Props {
  credit: MovieCredit;
  posterWidth: number;
  posterHeight: number;
  safeForWorkMode: boolean;
  onTogglePerformerMonitored: (args: {
    monitored: boolean;
    moviesMonitored: boolean;
  }) => void;
}

function MovieCastPoster({
  credit,
  posterWidth,
  posterHeight,
  safeForWorkMode,
  onTogglePerformerMonitored,
}: Props) {
  // Adapter for MonitorToggleButton signature
  const handleMonitorTogglePress = useCallback(
    (
      value: boolean | { monitored: boolean; moviesMonitored: boolean },
      _options: { shiftKey: boolean }
    ) => {
      const { monitored, moviesMonitored } =
        typeof value === 'object' &&
        value !== null &&
        'monitored' in value &&
        'moviesMonitored' in value
          ? value
          : {
              monitored: value as boolean,
              moviesMonitored: credit.moviesMonitored,
            };
      onTogglePerformerMonitored({ monitored, moviesMonitored });
    },
    [onTogglePerformerMonitored, credit.moviesMonitored]
  );
  const [hasPosterError, setHasPosterError] = useState(false);
  const {
    foreignId,
    personName,
    images,
    character,
    canMonitor,
    monitored,
    canMovieMonitor,
    moviesMonitored,
  } = credit;

  const onPosterLoad = useCallback(() => {
    setHasPosterError(false);
  }, []);

  const onPosterLoadError = useCallback(() => {
    setHasPosterError(true);
  }, []);

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
    borderRadius: '5px',
  } as React.CSSProperties;

  const contentStyle = { width: `${posterWidth}px` } as React.CSSProperties;
  const isPerformer = !!foreignId;
  const link = isPerformer ? `/performer/${foreignId}` : '';
  const title = isPerformer
    ? `${personName}`
    : 'Create a Link on StashDB to Link this Performer';

  return (
    <div className={styles.content} style={contentStyle}>
      <div className={styles.posterContainer}>
        <div className={styles.controls}>
          {canMonitor && (
            <MonitorToggleButton
              className={styles.action}
              monitored={monitored}
              moviesMonitored={moviesMonitored}
              type="sceneMonitor"
              size={20}
              onPress={handleMonitorTogglePress}
            />
          )}
          {canMovieMonitor && (
            <MonitorToggleButton
              className={styles.movieAction}
              monitored={monitored}
              moviesMonitored={moviesMonitored}
              type="movieMonitor"
              size={20}
              onPress={handleMonitorTogglePress}
            />
          )}
        </div>

        <div style={elementStyle}>
          <Link title={title} className={styles.link} to={link}>
            <MovieHeadshot
              safeForWorkMode={safeForWorkMode}
              className={styles.poster}
              style={elementStyle}
              images={images}
              size={250}
              lazy={false}
              overflow={true}
              onError={onPosterLoadError}
              onLoad={onPosterLoad}
            />

            {hasPosterError && (
              <div className={styles.overlayTitle}>{personName}</div>
            )}
          </Link>
        </div>
      </div>

      <div className={classNames(styles.title, 'swiper-no-swiping')}>
        {personName}
      </div>
      <div className={classNames(styles.title, 'swiper-no-swiping')}>
        {character}
      </div>
    </div>
  );
}

export default MovieCastPoster;
