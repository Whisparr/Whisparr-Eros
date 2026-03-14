import React, { RefObject, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import useMeasure from 'Helpers/Hooks/useMeasure';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import dimensions from 'Styles/Variables/dimensions';
import SceneIndexPoster from './SceneIndexPoster';

const columnPadding = parseInt(dimensions.movieIndexColumnPadding);
const columnPaddingSmallScreen = parseInt(
  dimensions.movieIndexColumnPaddingSmallScreen
);

const ADDITIONAL_COLUMN_COUNT: Record<string, number> = {
  small: 3,
  medium: 2,
  large: 1,
};

interface SceneIndexPostersProps {
  items: Movie[];
  sortKey: string;
  sortDirection?: SortDirection;
  scrollerRef: RefObject<HTMLElement | null>;
  isSelectMode: boolean;
  isSmallScreen: boolean;
}

const sceneIndexSelector = createSelector(
  (state: AppState) => state.sceneIndex.posterOptions,
  (posterOptions) => ({ posterOptions })
);

export default function SceneIndexPosters(props: SceneIndexPostersProps) {
  const { items, sortKey, isSelectMode, isSmallScreen } = props;
  const { posterOptions } = useSelector(sceneIndexSelector);
  const [measureRef, bounds] = useMeasure();

  const columnWidth = useMemo(() => {
    const width = bounds.width || 0;
    if (!width) return 310;
    const maximumColumnWidth = isSmallScreen ? 300 : 310;
    const columns = Math.floor(width / maximumColumnWidth);
    const remainder = width % maximumColumnWidth;
    return remainder === 0
      ? maximumColumnWidth
      : Math.floor(
          width / (columns + ADDITIONAL_COLUMN_COUNT[posterOptions.size])
        );
  }, [isSmallScreen, posterOptions, bounds]);

  const padding = isSmallScreen ? columnPaddingSmallScreen : columnPadding;
  const posterWidth = columnWidth - padding * 2;
  const posterHeight = Math.ceil((170 / 300) * posterWidth);

  return (
    <div ref={measureRef}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {items.map((scene) => (
          <div
            key={scene.id}
            style={{ width: columnWidth, padding, boxSizing: 'border-box' }}
          >
            <SceneIndexPoster
              scene={scene}
              sortKey={sortKey}
              isSelectMode={isSelectMode}
              posterWidth={posterWidth}
              posterHeight={posterHeight}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
