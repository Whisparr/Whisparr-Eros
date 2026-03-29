import React, { useMemo } from 'react';
import { SelectProvider } from 'App/SelectContext';
import useMeasure from 'Helpers/Hooks/useMeasure';
import { SortDirection } from 'Helpers/Props/sortDirections';
import MovieIndexPoster from 'Movie/Index/Posters/MovieIndexPoster';
import Movie from 'Movie/Movie';
import SceneIndexPoster from 'Scene/Index/Posters/SceneIndexPoster';
import dimensions from 'Styles/Variables/dimensions';

type PosterSize = 'small' | 'medium' | 'large';

interface PerformerDetailsPostersProps {
  items: Movie[];
  itemType: 'scene' | 'movie';
  sortKey: string;
  sortDirection: SortDirection;
  posterSize?: PosterSize;
}

const columnPadding = Number.parseInt(dimensions.movieIndexColumnPadding);

const ADDITIONAL_COLUMN_COUNT: Record<PosterSize, number> = {
  small: 3,
  medium: 2,
  large: 1,
};

const CONFIG = {
  scene: {
    maximumColumnWidth: 310,
    aspectRatio: 170 / 300,
  },
  movie: {
    maximumColumnWidth: 182,
    aspectRatio: 250 / 170,
  },
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

function PerformerDetailsPosters(props: PerformerDetailsPostersProps) {
  const {
    items,
    itemType,
    sortKey,
    sortDirection,
    posterSize = 'large',
  } = props;
  const [measureRef, bounds] = useMeasure();

  const { maximumColumnWidth, aspectRatio } = CONFIG[itemType];

  const columnWidth = useMemo(() => {
    const width = bounds.width || 0;
    if (!width) return maximumColumnWidth;
    const columns = Math.floor(width / maximumColumnWidth);
    const remainder = width % maximumColumnWidth;
    return remainder === 0
      ? maximumColumnWidth
      : Math.floor(width / (columns + ADDITIONAL_COLUMN_COUNT[posterSize]));
  }, [maximumColumnWidth, posterSize, bounds]);

  const posterWidth = columnWidth - columnPadding * 2;
  const posterHeight = Math.ceil(aspectRatio * posterWidth);

  const sorted = [...items].sort((a, b) => {
    const aVal = getSortValue(a, sortKey);
    const bVal = getSortValue(b, sortKey);

    let cmp = 0;
    if (aVal < bVal) cmp = -1;
    else if (aVal > bVal) cmp = 1;

    return sortDirection === 'ascending' ? cmp : -cmp;
  });

  const grid = (
    <div ref={measureRef}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {sorted.map((item) => (
          <div
            key={item.id}
            style={{
              width: columnWidth,
              padding: columnPadding,
              boxSizing: 'border-box',
            }}
          >
            {itemType === 'scene' ? (
              <SceneIndexPoster
                scene={item}
                sortKey={sortKey}
                isSelectMode={false}
                posterWidth={posterWidth}
                posterHeight={posterHeight}
              />
            ) : (
              <MovieIndexPoster
                movie={item}
                sortKey={sortKey}
                isSelectMode={false}
                posterWidth={posterWidth}
                posterHeight={posterHeight}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return itemType === 'movie' ? (
    <SelectProvider items={sorted}>{grid}</SelectProvider>
  ) : (
    grid
  );
}

export default PerformerDetailsPosters;
