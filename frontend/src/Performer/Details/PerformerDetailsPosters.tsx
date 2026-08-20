import React, { useCallback, useMemo } from 'react';
import {
  AutoSizer,
  Grid,
  type GridCellProps,
  WindowScroller,
} from 'react-virtualized';
import WorkPosterCard from 'Movie/Details/WorkPosterCard';
import Movie from 'Movie/Movie';
import dimensions from 'Styles/Variables/dimensions';
import styles from './PerformerDetailsPosters.css';

const columnPadding = Number.parseInt(dimensions.movieIndexColumnPadding, 10);
const columnPaddingSmallScreen = Number.parseInt(
  dimensions.movieIndexColumnPaddingSmallScreen,
  10
);

// Matches the 'medium' poster size used by SceneIndexPosters
const ADDITIONAL_COLUMN_COUNT = 2;

const TITLE_HEIGHT = 19;
const YEAR_HEIGHT = 17;

interface PerformerDetailsPostersProps {
  works: readonly Movie[];
  scrollElement: Element | null;
  safeForWorkMode: boolean;
  isSmallScreen: boolean;
}

interface PostersGridProps {
  items: Movie[];
  width: number;
  height: number;
  scrollTop: number;
  isScrolling: boolean;
  safeForWorkMode: boolean;
  isSmallScreen: boolean;
  onChildScroll: (params: { scrollTop: number }) => void;
}

function getColumnWidth(width: number, isSmallScreen: boolean): number {
  const maximumColumnWidth = isSmallScreen ? 300 : 310;
  const columns = Math.floor(width / maximumColumnWidth);
  const remainder = width % maximumColumnWidth;

  return remainder === 0
    ? maximumColumnWidth
    : Math.floor(width / (columns + ADDITIONAL_COLUMN_COUNT));
}

function PostersGrid(props: PostersGridProps) {
  const {
    items,
    width,
    height,
    scrollTop,
    isScrolling,
    safeForWorkMode,
    isSmallScreen,
    onChildScroll,
  } = props;

  const columnWidth = getColumnWidth(width, isSmallScreen);
  const columnCount = Math.max(Math.floor(width / columnWidth), 1);
  const padding = isSmallScreen ? columnPaddingSmallScreen : columnPadding;
  const posterWidth = columnWidth - padding * 2;
  const posterHeight = Math.ceil((170 / 300) * posterWidth);
  const rowHeight = posterHeight + TITLE_HEIGHT + YEAR_HEIGHT + padding * 2;

  const cellRenderer = useCallback(
    ({ columnIndex, rowIndex, key, style }: GridCellProps) => {
      const index = rowIndex * columnCount + columnIndex;
      const work = items[index];

      if (!work) {
        return null;
      }

      return (
        <div key={key} className={styles.cell} style={{ ...style, padding }}>
          <WorkPosterCard
            work={work}
            posterWidth={posterWidth}
            posterHeight={posterHeight}
            safeForWorkMode={safeForWorkMode}
          />
        </div>
      );
    },
    [items, columnCount, padding, posterWidth, posterHeight, safeForWorkMode]
  );

  return (
    <Grid
      autoHeight={true}
      height={height}
      width={width}
      columnCount={columnCount}
      columnWidth={columnWidth}
      rowCount={Math.ceil(items.length / columnCount)}
      rowHeight={rowHeight}
      overscanRowCount={2}
      cellRenderer={cellRenderer}
      scrollTop={scrollTop}
      isScrolling={isScrolling}
      onScroll={onChildScroll}
    />
  );
}

function PerformerDetailsPosters(props: PerformerDetailsPostersProps) {
  const { works, scrollElement, safeForWorkMode, isSmallScreen } = props;

  const items = useMemo(() => {
    return [...works].sort((a, b) => {
      const aDate = a.releaseDate ? Date.parse(a.releaseDate) : 0;
      const bDate = b.releaseDate ? Date.parse(b.releaseDate) : 0;

      if (aDate !== bDate) {
        return bDate - aDate;
      }

      return a.title.localeCompare(b.title);
    });
  }, [works]);

  return (
    <WindowScroller scrollElement={scrollElement ?? undefined}>
      {({ height, isScrolling, onChildScroll, scrollTop, registerChild }) => {
        if (!height) {
          return null;
        }

        return (
          <div
            ref={(element) => {
              (registerChild as unknown as (el: Element | null) => void)(
                element
              );
            }}
          >
            <AutoSizer disableHeight={true}>
              {({ width }) => {
                if (!width) {
                  return null;
                }

                return (
                  <PostersGrid
                    items={items}
                    width={width}
                    height={height}
                    scrollTop={scrollTop}
                    isScrolling={isScrolling}
                    safeForWorkMode={safeForWorkMode}
                    isSmallScreen={isSmallScreen}
                    onChildScroll={onChildScroll}
                  />
                );
              }}
            </AutoSizer>
          </div>
        );
      }}
    </WindowScroller>
  );
}

export default PerformerDetailsPosters;
