import React, { RefObject, useEffect, useMemo, useState } from 'react';
import useMeasure from 'Helpers/Hooks/useMeasure';
import Movie from 'Movie/Movie';
import dimensions from 'Styles/Variables/dimensions';
import { useSceneIndexOption } from '../sceneIndexOptionsStore';
import SceneIndexPoster from './SceneIndexPoster';

const bodyPadding = Number.parseInt(dimensions.pageContentBodyPadding, 10);
const bodyPaddingSmallScreen = Number.parseInt(
  dimensions.pageContentBodyPaddingSmallScreen,
  10
);
const columnPadding = Number.parseInt(dimensions.movieIndexColumnPadding, 10);
const columnPaddingSmallScreen = Number.parseInt(
  dimensions.movieIndexColumnPaddingSmallScreen,
  10
);

const ADDITIONAL_COLUMN_COUNT: Record<string, number> = {
  small: 3,
  medium: 2,
  large: 1,
};

interface SceneIndexPostersProps {
  items: Movie[];
  sortKey: string;
  scrollerRef: RefObject<HTMLElement | null>;
  isSelectMode: boolean;
  isSmallScreen: boolean;
}

export default function SceneIndexPosters(
  props: Readonly<SceneIndexPostersProps>
) {
  const { items, sortKey, scrollerRef, isSelectMode, isSmallScreen } = props;
  const posterOptions = useSceneIndexOption('posterOptions');
  const [measureRef, bounds] = useMeasure();
  const [width, setWidth] = useState(0);

  const columnWidth = useMemo(() => {
    if (!width) return 310;
    const maximumColumnWidth = isSmallScreen ? 300 : 310;
    const columns = Math.floor(width / maximumColumnWidth);
    const remainder = width % maximumColumnWidth;
    return remainder === 0
      ? maximumColumnWidth
      : Math.floor(
          width / (columns + ADDITIONAL_COLUMN_COUNT[posterOptions.size])
        );
  }, [isSmallScreen, posterOptions, width]);

  const padding = isSmallScreen ? columnPaddingSmallScreen : columnPadding;
  const posterWidth = columnWidth - padding * 2;
  const posterHeight = Math.ceil((170 / 300) * posterWidth);

  useEffect(() => {
    const current = scrollerRef.current;

    if (isSmallScreen) {
      const bodyInset = bodyPaddingSmallScreen - 5;

      setWidth(window.innerWidth - bodyInset * 2);

      return;
    }

    if (current) {
      const bodyInset = bodyPadding - 5;
      const finalWidth = current.clientWidth - bodyInset * 2;

      // Ignore small changes, such as the scrollbar appearing or disappearing,
      // otherwise resizing the posters can toggle the scrollbar in a loop.
      if (Math.abs(width - finalWidth) < 20) {
        return;
      }

      setWidth(finalWidth);
    }
  }, [isSmallScreen, width, scrollerRef, bounds]);

  return (
    <div ref={measureRef}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: width || undefined,
        }}
      >
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
