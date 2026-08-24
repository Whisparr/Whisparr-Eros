import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  type ListRowProps,
  WindowScroller,
} from 'react-virtualized';
import { SelectProvider } from 'App/SelectContext';
import MovieIndexPoster from 'Movie/Index/Posters/MovieIndexPoster';
import Movie from 'Movie/Movie';
import SceneIndexPoster from 'Scene/Index/Posters/SceneIndexPoster';
import styles from './PerformerDetailsPosters.css';

const MOVIE_COLUMN_WIDTH = 182;
const MOVIE_POSTER_WIDTH = MOVIE_COLUMN_WIDTH - 20;
const MOVIE_POSTER_HEIGHT = Math.ceil((250 / 170) * MOVIE_POSTER_WIDTH);
const SCENE_COLUMN_WIDTH = 310;
const SCENE_POSTER_WIDTH = SCENE_COLUMN_WIDTH - 20;
const SCENE_POSTER_HEIGHT = Math.ceil((170 / 300) * SCENE_POSTER_WIDTH);
const COLUMN_PADDING = 10;

interface PerformerDetailsPostersProps {
  movies: readonly Movie[];
  scrollContainer: Element | null;
}

interface PerformerDetailsPosterListProps {
  movies: readonly Movie[];
  width: number;
  height: number;
  isScrolling: boolean;
  scrollTop: number;
  onChildScroll: (params: { scrollTop: number }) => void;
}

function getColumnWidth(movie: Movie) {
  return movie.itemType === 'scene' ? SCENE_COLUMN_WIDTH : MOVIE_COLUMN_WIDTH;
}

function PerformerDetailsPosterList({
  movies,
  width,
  height,
  isScrolling,
  scrollTop,
  onChildScroll,
}: PerformerDetailsPosterListProps) {
  const listRef = useRef<List>(null);
  const cacheRef = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: MOVIE_POSTER_HEIGHT + 80,
      minHeight: SCENE_POSTER_HEIGHT + 40,
    })
  );

  const rows = useMemo(() => {
    const result: Movie[][] = [];
    let row: Movie[] = [];
    let rowWidth = 0;

    movies.forEach((movie) => {
      const columnWidth = getColumnWidth(movie);

      if (row.length && rowWidth + columnWidth > width) {
        result.push(row);
        row = [];
        rowWidth = 0;
      }

      row.push(movie);
      rowWidth += columnWidth;
    });

    if (row.length) {
      result.push(row);
    }

    return result;
  }, [movies, width]);

  useEffect(() => {
    cacheRef.current.clearAll();
    listRef.current?.recomputeRowHeights();
  }, [rows]);

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
            {row.map((movie) => {
              const isScene = movie.itemType === 'scene';

              return (
                <div
                  key={movie.id}
                  style={{
                    width: isScene ? SCENE_COLUMN_WIDTH : MOVIE_COLUMN_WIDTH,
                    padding: COLUMN_PADDING,
                    boxSizing: 'border-box',
                  }}
                >
                  {isScene ? (
                    <SceneIndexPoster
                      scene={movie}
                      sortKey="sortTitle"
                      isSelectMode={false}
                      posterWidth={SCENE_POSTER_WIDTH}
                      posterHeight={SCENE_POSTER_HEIGHT}
                    />
                  ) : (
                    <MovieIndexPoster
                      movie={movie}
                      sortKey="cleanTitle"
                      isSelectMode={false}
                      posterWidth={MOVIE_POSTER_WIDTH}
                      posterHeight={MOVIE_POSTER_HEIGHT}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CellMeasurer>
      );
    },
    [rows]
  );

  return (
    <List
      ref={listRef}
      autoHeight={true}
      height={height}
      width={width}
      rowCount={rows.length}
      rowHeight={cacheRef.current.rowHeight}
      estimatedRowSize={MOVIE_POSTER_HEIGHT + 80}
      deferredMeasurementCache={cacheRef.current}
      overscanRowCount={4}
      scrollTop={scrollTop}
      isScrolling={isScrolling}
      rowRenderer={rowRenderer}
      onScroll={onChildScroll}
    />
  );
}

function PerformerDetailsPosters({
  movies,
  scrollContainer,
}: PerformerDetailsPostersProps) {
  return (
    <SelectProvider items={movies as Movie[]}>
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
                  <PerformerDetailsPosterList
                    movies={movies}
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

export default PerformerDetailsPosters;
