import React, { useCallback, useState } from 'react';
import AddNewMovieCollectionMovieModal from 'Collection/AddNewMovieCollectionMovieModal';
import MovieCollection, {
  MovieCollectionMovie,
} from 'Collection/MovieCollection';
import Link from 'Components/Link/Link';
import MonitorToggleButton, {
  getToggledMonitored,
  MonitorTogglePressValue,
} from 'Components/MonitorToggleButton';
import MovieIndexProgressBar from 'Movie/Index/ProgressBar/MovieIndexProgressBar';
import Movie from 'Movie/Movie';
import MoviePoster from 'Movie/MoviePoster';
import { useToggleMovieMonitored } from 'Movie/useMovie';
import translate from 'Utilities/String/translate';
import styles from './CollectionMovie.css';

interface CollectionMovieProps {
  movie: MovieCollectionMovie;
  existingMovie?: Movie;
  collection: MovieCollection;
  posterWidth: number;
  posterHeight: number;
  detailedProgressBar: boolean;
}

function CollectionMovie({
  movie,
  existingMovie,
  collection,
  posterWidth,
  posterHeight,
  detailedProgressBar,
}: CollectionMovieProps) {
  const { title, year, tmdbId, images, isExcluded } = movie;

  const [hasPosterError, setHasPosterError] = useState(false);
  const [isNewAddMovieModalOpen, setIsNewAddMovieModalOpen] = useState(false);

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

  const handleAddMoviePress = useCallback(() => {
    setIsNewAddMovieModalOpen(true);
  }, []);

  const handleAddMovieModalClose = useCallback(() => {
    setIsNewAddMovieModalOpen(false);
  }, []);

  const handlePosterLoad = useCallback(() => {
    setHasPosterError(false);
  }, []);

  const handlePosterLoadError = useCallback(() => {
    setHasPosterError(true);
  }, []);

  // Currently only TMDB collections so this can change when required.
  const linkProps = existingMovie
    ? { to: `/movie/${tmdbId}` }
    : { onPress: handleAddMoviePress };

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
    borderRadius: '5px',
  };

  return (
    <div className={styles.content}>
      <div className={styles.posterContainer}>
        {existingMovie ? (
          <div className={styles.editorSelect}>
            <MonitorToggleButton
              className={styles.monitorToggleButton}
              monitored={existingMovie.monitored}
              isSaving={toggleMonitored.isPending}
              size={20}
              onPress={handleMonitorTogglePress}
            />
          </div>
        ) : null}

        {isExcluded ? (
          <div className={styles.excluded} title={translate('Excluded')} />
        ) : null}

        <Link className={styles.link} style={elementStyle} {...linkProps}>
          <MoviePoster
            className={styles.poster}
            style={elementStyle}
            images={images}
            size={250}
            lazy={false}
            overflow={true}
            onError={handlePosterLoadError}
            onLoad={handlePosterLoad}
          />

          {hasPosterError ? (
            <div className={styles.overlayTitle}>{title}</div>
          ) : null}

          <div className={styles.overlayHover}>
            <div className={styles.overlayHoverTitle}>
              {title} {year > 0 ? `(${year})` : ''}
            </div>

            {existingMovie ? (
              <MovieIndexProgressBar
                movieId={existingMovie.id}
                movieFile={existingMovie.movieFile}
                monitored={existingMovie.monitored}
                hasFile={existingMovie.hasFile}
                status={existingMovie.status}
                bottomRadius={true}
                width={posterWidth}
                detailedProgressBar={detailedProgressBar}
                isAvailable={existingMovie.isAvailable}
              />
            ) : null}
          </div>
        </Link>
      </div>

      <AddNewMovieCollectionMovieModal
        isOpen={isNewAddMovieModalOpen && !existingMovie}
        movie={movie}
        collection={collection}
        onModalClose={handleAddMovieModalClose}
      />
    </div>
  );
}

export default CollectionMovie;
