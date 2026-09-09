import React, { useCallback } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import { MovieLookupResult } from '../../ImportMovieTypes';
import ImportMovieTitle from './ImportMovieTitle';
import styles from './ImportMovieSearchResult.css';

interface ImportMovieSearchResultProps {
  item: MovieLookupResult;
  onPress: (foreignId: string) => void;
}

function ImportMovieSearchResult({
  item,
  onPress,
}: Readonly<ImportMovieSearchResultProps>) {
  const {
    foreignId,
    tmdbId,
    tpdbId,
    itemType,
    title,
    year,
    releaseDate,
    studioTitle,
    performerNames,
    searchCredits,
    isExisting,
  } = item;

  const stashId = foreignId && tmdbId === 0 && !tpdbId ? foreignId : '';

  const handlePress = useCallback(() => {
    onPress(foreignId);
  }, [foreignId, onPress]);

  return (
    <div className={styles.container}>
      <Link className={styles.movie} component="div" onPress={handlePress}>
        <ImportMovieTitle
          itemType={itemType}
          title={title}
          year={year}
          releaseDate={releaseDate}
          studioTitle={studioTitle}
          performerNames={performerNames}
          searchCredits={searchCredits}
          isExistingMovie={isExisting}
        />
      </Link>

      {!!tmdbId && (
        <Link
          className={styles.tmdbLink}
          to={`https://www.themoviedb.org/movie/${tmdbId}`}
        >
          <Icon
            className={styles.tmdbLinkIcon}
            name={icons.EXTERNAL_LINK}
            size={16}
          />
        </Link>
      )}

      {!!tpdbId && (
        <Link
          className={styles.tpdbLink}
          to={`https://theporndb.net/movies/${tpdbId}`}
        >
          <Icon
            className={styles.tpdbLinkIcon}
            name={icons.EXTERNAL_LINK}
            size={16}
          />
        </Link>
      )}

      {!!stashId && stashId !== tmdbId?.toString() && (
        <Link
          className={styles.stashdbLink}
          to={`https://stashdb.org/scenes/${stashId}/`}
        >
          <Icon
            className={styles.stashdbLinkIcon}
            name={icons.EXTERNAL_LINK}
            size={16}
          />
        </Link>
      )}
    </div>
  );
}

export default ImportMovieSearchResult;
