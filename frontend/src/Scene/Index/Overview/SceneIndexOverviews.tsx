import React, { RefObject, useMemo } from 'react';
import Movie from 'Movie/Movie';
import dimensions from 'Styles/Variables/dimensions';
import { useSceneIndexOption } from '../sceneIndexOptionsStore';
import SceneIndexOverview, { TITLE_ROW_HEIGHT } from './SceneIndexOverview';
import {
  getVisibleInfoRowCount,
  INFO_ROW_HEIGHT,
} from './SceneIndexOverviewInfo';

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

interface SceneIndexOverviewsProps {
  items: Movie[];
  sortKey: string;
  sortDirection?: string;
  scrollerRef: RefObject<HTMLElement | null>;
  isSelectMode: boolean;
  isSmallScreen: boolean;
}

function SceneIndexOverviews(props: SceneIndexOverviewsProps) {
  const { items, sortKey, isSelectMode, isSmallScreen } = props;
  const overviewOptions = useSceneIndexOption('overviewOptions');
  const { size: posterSize, detailedProgressBar } = overviewOptions;

  const posterWidth = useMemo(() => {
    const maximumPosterWidth = isSmallScreen ? 250 : 260;

    if (posterSize === 'large') {
      return maximumPosterWidth;
    }

    if (posterSize === 'medium') {
      return Math.floor(maximumPosterWidth * 0.75);
    }

    return Math.floor(maximumPosterWidth * 0.5);
  }, [posterSize, isSmallScreen]);

  const posterHeight = useMemo(
    () => Math.ceil((170 / 300) * posterWidth),
    [posterWidth]
  );

  const rowHeight = useMemo(() => {
    // Scene posters are landscape, so the poster alone is shorter than the
    // title plus the info rows the options ask for -- at the default size it
    // left room for one row and the rest were clipped, which is what made the
    // show-* toggles look like they did nothing (Whisparr/Whisparr#1134).
    // Movie's posters are portrait and tall enough to hide the same fault.
    const infoHeight =
      TITLE_ROW_HEIGHT +
      getVisibleInfoRowCount(overviewOptions, sortKey) * INFO_ROW_HEIGHT;

    const heights = [
      Math.max(posterHeight, infoHeight),
      detailedProgressBar ? detailedProgressBarHeight : progressBarHeight,
      isSmallScreen ? columnPaddingSmallScreen : columnPadding,
    ];

    return heights.reduce((acc, height) => acc + height, 0);
  }, [
    detailedProgressBar,
    posterHeight,
    isSmallScreen,
    overviewOptions,
    sortKey,
  ]);

  return (
    <div>
      {items.map((scene) => (
        <SceneIndexOverview
          key={scene.id}
          scene={scene}
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

export default SceneIndexOverviews;
