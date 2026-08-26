import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  type ListRowProps,
  WindowScroller,
} from 'react-virtualized';
import { useAppDimension } from 'App/appStore';
import { SelectProvider } from 'App/SelectContext';
import { CommonPosterOptions } from 'Components/PosterOptionsForm';
import MovieIndexPoster from 'Movie/Index/Posters/MovieIndexPoster';
import Movie from 'Movie/Movie';
import SceneIndexPoster from 'Scene/Index/Posters/SceneIndexPoster';
import dimensions from 'Styles/Variables/dimensions';
import styles from './DetailsPosters.css';

const MOVIE_MAX_COLUMN_WIDTH = 182;
const SCENE_MAX_COLUMN_WIDTH = 310;
const COLUMN_PADDING = Number.parseInt(dimensions.movieIndexColumnPadding, 10);
const COLUMN_PADDING_SMALL_SCREEN = Number.parseInt(
  dimensions.movieIndexColumnPaddingSmallScreen,
  10
);

const ADDITIONAL_COLUMN_COUNT: Record<string, number> = {
  small: 3,
  medium: 2,
  large: 1,
};

interface DetailsPostersProps {
  items: readonly Movie[];
  posterOptions: CommonPosterOptions;
  scrollContainer: Element | null;
  sortKey: string;
}

interface PosterCell {
  item: Movie;
  columnWidth: number;
  posterWidth: number;
  posterHeight: number;
}

interface DetailsPosterListProps extends DetailsPostersProps {
  width: number;
  height: number;
  isScrolling: boolean;
  scrollTop: number;
  onChildScroll: (params: { scrollTop: number }) => void;
}

function getColumnWidth(
  width: number,
  maximumColumnWidth: number,
  size: string
) {
  if (!width) {
    return maximumColumnWidth;
  }

  const columns = Math.floor(width / maximumColumnWidth);
  const remainder = width % maximumColumnWidth;
  const additionalColumns = ADDITIONAL_COLUMN_COUNT[size] ?? 1;

  return remainder === 0
    ? maximumColumnWidth
    : Math.floor(width / (columns + additionalColumns));
}

function getPosterCell(
  item: Movie,
  width: number,
  isSmallScreen: boolean,
  size: string
): PosterCell {
  const isScene = item.itemType === 'scene';
  let maximumColumnWidth = isSmallScreen ? 172 : MOVIE_MAX_COLUMN_WIDTH;

  if (isScene) {
    maximumColumnWidth = isSmallScreen ? 300 : SCENE_MAX_COLUMN_WIDTH;
  }

  const padding = isSmallScreen ? COLUMN_PADDING_SMALL_SCREEN : COLUMN_PADDING;
  const columnWidth = getColumnWidth(width, maximumColumnWidth, size);
  const posterWidth = Math.max(columnWidth - padding * 2, 1);
  const posterHeight = Math.ceil(
    (isScene ? 170 / 300 : 250 / 170) * posterWidth
  );

  return { item, columnWidth, posterWidth, posterHeight };
}

function DetailsPosterList({
  items,
  posterOptions,
  sortKey,
  width,
  height,
  isScrolling,
  scrollTop,
  onChildScroll,
}: Readonly<DetailsPosterListProps>) {
  const isSmallScreen = useAppDimension('isSmallScreen');
  const listRef = useRef<List>(null);
  const cacheRef = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight:
        Math.ceil((250 / 170) * (MOVIE_MAX_COLUMN_WIDTH - 20)) + 80,
      minHeight: Math.ceil((170 / 300) * (SCENE_MAX_COLUMN_WIDTH - 20)) + 40,
    })
  );

  const rows = useMemo(() => {
    const result: PosterCell[][] = [];
    let row: PosterCell[] = [];
    let rowWidth = 0;

    items.forEach((item) => {
      const cell = getPosterCell(
        item,
        width,
        isSmallScreen,
        posterOptions.size
      );

      if (row.length && rowWidth + cell.columnWidth > width) {
        result.push(row);
        row = [];
        rowWidth = 0;
      }

      row.push(cell);
      rowWidth += cell.columnWidth;
    });

    if (row.length) {
      result.push(row);
    }

    return result;
  }, [items, width, isSmallScreen, posterOptions.size]);

  useEffect(() => {
    cacheRef.current.clearAll();
    listRef.current?.recomputeRowHeights();
  }, [rows, posterOptions]);

  const rowRenderer = useCallback(
    ({ index, key, parent, style }: ListRowProps) => {
      const row = rows[index];

      if (!row) {
        return null;
      }

      return (
        <CellMeasurer
          key={key}
          cache={cacheRef.current}
          columnIndex={0}
          rowIndex={index}
          parent={parent}
        >
          <div className={styles.row} style={style}>
            {row.map((cell) => {
              const isScene = cell.item.itemType === 'scene';
              const padding = isSmallScreen
                ? COLUMN_PADDING_SMALL_SCREEN
                : COLUMN_PADDING;

              return (
                <div
                  key={cell.item.id}
                  style={{
                    width: cell.columnWidth,
                    padding,
                    boxSizing: 'border-box',
                  }}
                >
                  {isScene ? (
                    <SceneIndexPoster
                      scene={cell.item}
                      sortKey={sortKey}
                      isSelectMode={false}
                      posterOptions={posterOptions}
                      posterWidth={cell.posterWidth}
                      posterHeight={cell.posterHeight}
                    />
                  ) : (
                    <MovieIndexPoster
                      movie={cell.item}
                      sortKey={sortKey}
                      isSelectMode={false}
                      posterOptions={posterOptions}
                      posterWidth={cell.posterWidth}
                      posterHeight={cell.posterHeight}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CellMeasurer>
      );
    },
    [isSmallScreen, posterOptions, rows, sortKey]
  );

  return (
    <List
      ref={listRef}
      autoHeight={true}
      height={height}
      width={width}
      rowCount={rows.length}
      rowHeight={cacheRef.current.rowHeight}
      estimatedRowSize={
        Math.ceil((250 / 170) * (MOVIE_MAX_COLUMN_WIDTH - 20)) + 80
      }
      deferredMeasurementCache={cacheRef.current}
      overscanRowCount={4}
      scrollTop={scrollTop}
      isScrolling={isScrolling}
      rowRenderer={rowRenderer}
      onScroll={onChildScroll}
    />
  );
}

function DetailsPosters({
  items,
  posterOptions,
  scrollContainer,
  sortKey,
}: Readonly<DetailsPostersProps>) {
  return (
    <SelectProvider items={items as Movie[]}>
      <WindowScroller scrollElement={scrollContainer ?? undefined}>
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
                {({ width }) => (
                  <DetailsPosterList
                    items={items}
                    posterOptions={posterOptions}
                    scrollContainer={scrollContainer}
                    sortKey={sortKey}
                    width={width}
                    height={height}
                    isScrolling={isScrolling}
                    scrollTop={scrollTop}
                    onChildScroll={onChildScroll}
                  />
                )}
              </AutoSizer>
            </div>
          );
        }}
      </WindowScroller>
    </SelectProvider>
  );
}

export default DetailsPosters;
