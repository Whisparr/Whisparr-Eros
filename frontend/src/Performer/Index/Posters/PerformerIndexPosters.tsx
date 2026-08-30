import { throttle } from 'lodash';
import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import useMeasure from 'Helpers/Hooks/useMeasure';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { usePerformerIndexOption } from 'Performer/Index/performerIndexOptionsStore';
import PerformerIndexPoster from 'Performer/Index/Posters/PerformerIndexPoster';
import Performer from 'Performer/Performer';
import dimensions from 'Styles/Variables/dimensions';
import getIndexOfFirstCharacter from 'Utilities/Array/getIndexOfFirstCharacter';

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
const progressBarHeight = Number.parseInt(
  dimensions.progressBarSmallHeight,
  10
);
const detailedProgressBarHeight = Number.parseInt(
  dimensions.progressBarMediumHeight,
  10
);

const ADDITIONAL_COLUMN_COUNT: Record<string, number> = {
  small: 3,
  medium: 2,
  large: 1,
};

interface CellItemData {
  layout: {
    columnCount: number;
    padding: number;
    posterWidth: number;
    posterHeight: number;
  };
  items: Performer[];
  sortKey: string;
  isSelectMode: boolean;
}

interface PerformerIndexPostersProps {
  items: Performer[];
  sortKey: string;
  sortDirection?: SortDirection;
  jumpToCharacter?: string;
  scrollTop?: number;
  scrollerRef: RefObject<HTMLElement | null>;
  isSelectMode: boolean;
  isSmallScreen: boolean;
}

function Cell({
  columnIndex,
  rowIndex,
  style,
  data,
}: GridChildComponentProps<CellItemData> & {}): React.JSX.Element | null {
  const { layout, items, sortKey, isSelectMode } = data;

  const { columnCount, padding, posterWidth, posterHeight } = layout;

  const index = rowIndex * columnCount + columnIndex;

  if (index >= items.length) {
    return null;
  }

  const performer = items[index];

  return (
    <div
      style={{
        padding,
        ...style,
      }}
    >
      <PerformerIndexPoster
        performer={performer}
        sortKey={sortKey}
        isSelectMode={isSelectMode}
        posterWidth={posterWidth}
        posterHeight={posterHeight}
      />
    </div>
  );
}

function getWindowScrollTopPosition() {
  return document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function PerformerIndexPosters({
  scrollerRef,
  items,
  sortKey,
  jumpToCharacter,
  isSelectMode,
  isSmallScreen,
}: PerformerIndexPostersProps) {
  const posterOptions = usePerformerIndexOption('posterOptions');
  const ref = useRef<Grid>(null);
  const [measureRef, bounds] = useMeasure();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const columnWidth = useMemo(() => {
    const { width } = size;
    const maximumColumnWidth = isSmallScreen ? 172 : 182;
    const columns = Math.floor(width / maximumColumnWidth);
    const remainder = width % maximumColumnWidth;
    return remainder === 0
      ? maximumColumnWidth
      : Math.floor(
          width / (columns + ADDITIONAL_COLUMN_COUNT[posterOptions.size])
        );
  }, [isSmallScreen, posterOptions, size]);

  const columnCount = useMemo(
    () => Math.max(Math.floor(size.width / columnWidth), 1),
    [size, columnWidth]
  );
  const padding = isSmallScreen ? columnPaddingSmallScreen : columnPadding;
  const posterWidth = columnWidth - padding * 2;
  const posterHeight = Math.ceil((250 / 170) * posterWidth);

  const rowHeight = useMemo(() => {
    const { detailedProgressBar, showName } = posterOptions;

    const nextAiringHeight = 19;

    const heights = [
      posterHeight,
      detailedProgressBar ? detailedProgressBarHeight : progressBarHeight,
      nextAiringHeight,
      isSmallScreen ? columnPaddingSmallScreen : columnPadding,
    ];

    if (showName) {
      heights.push(19);
    }

    switch (sortKey) {
      case 'studio':
      case 'added':
      case 'year':
      case 'path':
      case 'sizeOnDisk':
      case 'originalLanguage':
        heights.push(19);
        break;
      default:
      // No need to add a height of 0
    }

    return heights.reduce((acc, height) => acc + height, 0);
  }, [isSmallScreen, posterOptions, sortKey, posterHeight]);

  useEffect(() => {
    const current = scrollerRef.current;

    if (isSmallScreen) {
      const padding = bodyPaddingSmallScreen - 5;

      setSize({
        width: window.innerWidth - padding * 2,
        height: window.innerHeight,
      });

      return;
    }

    if (current) {
      const width = current.clientWidth;
      const padding = bodyPadding - 5;
      const finalWidth = width - padding * 2;

      if (Math.abs(size.width - finalWidth) < 20 || size.width === finalWidth) {
        return;
      }

      setSize({
        width: finalWidth,
        height: window.innerHeight,
      });
    }
  }, [isSmallScreen, size, scrollerRef, bounds]);

  useEffect(() => {
    const currentScrollerRef = scrollerRef.current as HTMLElement;
    const currentScrollListener = isSmallScreen ? window : currentScrollerRef;

    const handleScroll = throttle(() => {
      const { offsetTop = 0 } = currentScrollerRef;
      const scrollTop =
        (isSmallScreen
          ? getWindowScrollTopPosition()
          : currentScrollerRef.scrollTop) - offsetTop;

      ref.current?.scrollTo({ scrollLeft: 0, scrollTop });
    }, 10);

    currentScrollListener.addEventListener('scroll', handleScroll);

    return () => {
      handleScroll.cancel();

      if (currentScrollListener) {
        currentScrollListener.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isSmallScreen, ref, scrollerRef]);

  useEffect(() => {
    if (jumpToCharacter) {
      const index = getIndexOfFirstCharacter(items, jumpToCharacter);

      if (index != null) {
        const rowIndex = Math.floor(index / columnCount);

        const scrollTop = rowIndex * rowHeight + padding;

        ref.current?.scrollTo({ scrollLeft: 0, scrollTop });
        scrollerRef.current?.scrollTo(0, scrollTop);
      }
    }
  }, [
    jumpToCharacter,
    rowHeight,
    columnCount,
    padding,
    items,
    scrollerRef,
    ref,
  ]);

  return (
    <div ref={measureRef}>
      <Grid<CellItemData>
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'none',
        }}
        width={size.width}
        height={size.height}
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowCount={Math.ceil(items.length / columnCount)}
        rowHeight={rowHeight}
        itemData={{
          layout: {
            columnCount,
            padding,
            posterWidth,
            posterHeight,
          },
          items,
          sortKey,
          isSelectMode,
        }}
      >
        {Cell}
      </Grid>
    </div>
  );
}

export default PerformerIndexPosters;
