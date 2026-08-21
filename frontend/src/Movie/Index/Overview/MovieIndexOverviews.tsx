import React, { RefObject, useMemo } from 'react';
import Movie from 'Movie/Movie';
import dimensions from 'Styles/Variables/dimensions';
import { useMovieIndexOption } from '../movieIndexOptionsStore';
import MovieIndexOverview from './MovieIndexOverview';

const columnPadding = Number.parseInt(dimensions.movieIndexColumnPadding, 10);
const columnPaddingSmallScreen = Number.parseInt(
  dimensions.movieIndexColumnPaddingSmallScreen,
  10
);
const progressBarHeight = Number.parseInt(
  dimensions.progressBarSmallHeight,
  10
);
const detailedProgressBarHeight = Number.parseInt(
  dimensions.progressBarMediumHeight,
  10
);

interface MovieIndexOverviewsProps {
  items: Movie[];
  sortKey: string;
  sortDirection?: string;
  scrollerRef: RefObject<HTMLElement | null>;
  isSelectMode: boolean;
  isSmallScreen: boolean;
}

function MovieIndexOverviews(props: MovieIndexOverviewsProps) {
  const { items, sortKey, isSelectMode, isSmallScreen } = props;
  const { size: posterSize, detailedProgressBar } =
    useMovieIndexOption('overviewOptions');

  const posterWidth = useMemo(() => {
    const maximumPosterWidth = isSmallScreen ? 152 : 162;

    if (posterSize === 'large') {
      return maximumPosterWidth;
    }

    if (posterSize === 'medium') {
      return Math.floor(maximumPosterWidth * 0.75);
    }

    return Math.floor(maximumPosterWidth * 0.5);
  }, [posterSize, isSmallScreen]);

  const posterHeight = useMemo(
    () => Math.ceil((250 / 170) * posterWidth),
    [posterWidth]
  );

  const rowHeight = useMemo(() => {
    const heights = [
      posterHeight,
      detailedProgressBar ? detailedProgressBarHeight : progressBarHeight,
      isSmallScreen ? columnPaddingSmallScreen : columnPadding,
    ];

    return heights.reduce((acc, height) => acc + height, 0);
  }, [detailedProgressBar, posterHeight, isSmallScreen]);

  return (
    <div>
      {items.map((movie) => (
        <MovieIndexOverview
          key={movie.id}
          movie={movie}
          sortKey={sortKey}
          posterWidth={posterWidth}
          posterHeight={posterHeight}
          rowHeight={rowHeight}
          isSelectMode={isSelectMode}
          isSmallScreen={isSmallScreen}
        />
      ))}
    </div>
  );
}

export default MovieIndexOverviews;
