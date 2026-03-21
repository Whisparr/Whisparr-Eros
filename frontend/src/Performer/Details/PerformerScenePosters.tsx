import React from 'react';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import PerformerScenePoster from './PerformerScenePoster';
import styles from './PerformerScenePosters.css';

type PosterSize = 'small' | 'medium' | 'large';

interface PerformerScenePostersProps {
  movies: Movie[];
  sortKey: string;
  sortDirection: SortDirection;
  posterSize?: PosterSize;
}

const POSTER_DIMENSIONS: Record<
  PosterSize,
  { width: number; height: number; minmax: number }
> = {
  small: { width: 130, height: 73, minmax: 130 },
  medium: { width: 167, height: 94, minmax: 167 },
  large: { width: 240, height: 135, minmax: 240 },
};

function getSortValue(movie: Movie, sortKey: string) {
  switch (sortKey) {
    case 'releaseDate':
      return movie.releaseDate ?? '';
    case 'title':
    case 'sortTitle':
      return movie.sortTitle ?? movie.title ?? '';
    case 'studioTitle':
      return movie.studioTitle ?? '';
    default:
      return movie.releaseDate ?? '';
  }
}

function PerformerScenePosters(props: PerformerScenePostersProps) {
  const { movies, sortKey, sortDirection, posterSize = 'medium' } = props;

  const { width, height, minmax } = POSTER_DIMENSIONS[posterSize];

  const sorted = [...movies].sort((a, b) => {
    const aVal = getSortValue(a, sortKey);
    const bVal = getSortValue(b, sortKey);

    let cmp = 0;

    if (aVal < bVal) {
      cmp = -1;
    } else if (aVal > bVal) {
      cmp = 1;
    }

    return sortDirection === 'ascending' ? cmp : -cmp;
  });

  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${minmax}px, 1fr))`,
  };

  return (
    <div className={styles.grid} style={gridStyle}>
      {sorted.map((movie) => (
        <PerformerScenePoster
          key={movie.id}
          movie={movie}
          posterWidth={width}
          posterHeight={height}
        />
      ))}
    </div>
  );
}

export default PerformerScenePosters;
