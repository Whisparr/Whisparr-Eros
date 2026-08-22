import classNames from 'classnames';
import React, { useCallback } from 'react';
import { MovieCollectionMovie } from 'Collection/MovieCollection';
import MonitorToggleButton, {
  getToggledMonitored,
  MonitorTogglePressValue,
} from 'Components/MonitorToggleButton';
import Movie from 'Movie/Movie';
import { useToggleMovieMonitored } from 'Movie/useMovie';
import getProgressBarKind from 'Utilities/Movie/getProgressBarKind';
import translate from 'Utilities/String/translate';
import styles from './CollectionMovieLabel.css';

interface CollectionMovieLabelProps {
  movie: MovieCollectionMovie;
  existingMovie?: Movie;
}

function CollectionMovieLabel({
  movie,
  existingMovie,
}: CollectionMovieLabelProps) {
  const { title, year } = movie;

  const toggleMonitored = useToggleMovieMonitored();

  const handleMonitorTogglePress = useCallback(
    (value: MonitorTogglePressValue) => {
      if (existingMovie) {
        toggleMonitored.mutate({
          id: existingMovie.id,
          monitored: getToggledMonitored(value),
        });
      }
    },
    [existingMovie, toggleMonitored]
  );

  return (
    <div className={styles.movie}>
      <div className={styles.movieTitle}>
        {existingMovie ? (
          <MonitorToggleButton
            monitored={existingMovie.monitored}
            isSaving={toggleMonitored.isPending}
            onPress={handleMonitorTogglePress}
          />
        ) : null}

        <span>
          {title} {year > 0 ? `(${year})` : ''}
        </span>
      </div>

      {existingMovie ? (
        <div
          className={classNames(
            styles.movieStatus,
            (styles as unknown as Record<string, string>)[
              getProgressBarKind(
                existingMovie.status,
                existingMovie.monitored,
                existingMovie.hasFile,
                existingMovie.isAvailable
              )
            ]
          )}
        >
          {existingMovie.hasFile
            ? translate('Downloaded')
            : translate('Missing')}
        </div>
      ) : null}
    </div>
  );
}

export default CollectionMovieLabel;
