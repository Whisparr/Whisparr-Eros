import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  type ListRowProps,
  WindowScroller,
} from 'react-virtualized';
import Link from 'Components/Link/Link';
import Movie from 'Movie/Movie';
import MoviePoster from 'Movie/MoviePoster';
import ScenePoster from 'Scene/ScenePoster';
import styles from './PerformerDetailsPosters.css';

const MOVIE_POSTER_WIDTH = 170;
const MOVIE_POSTER_HEIGHT = 250;
const SCENE_POSTER_WIDTH = 300;
const SCENE_POSTER_HEIGHT = 170;
const CARD_GUTTER = 20;

interface PerformerDetailsPostersProps {
  movies: readonly Movie[];
  safeForWorkMode: boolean;
  scrollContainer: Element | null;
}

interface PerformerDetailsPosterProps {
  movie: Movie;
  safeForWorkMode: boolean;
}

interface PerformerDetailsPosterListProps {
  movies: readonly Movie[];
  safeForWorkMode: boolean;
  width: number;
  height: number;
  isScrolling: boolean;
  scrollTop: number;
  onChildScroll: (params: { scrollTop: number }) => void;
}

function getCardWidth(movie: Movie) {
  return movie.itemType === 'scene'
    ? SCENE_POSTER_WIDTH + CARD_GUTTER
    : MOVIE_POSTER_WIDTH + CARD_GUTTER;
}

function PerformerDetailsPoster({
  movie,
  safeForWorkMode,
}: PerformerDetailsPosterProps) {
  const isScene = movie.itemType === 'scene';
  const width = isScene ? SCENE_POSTER_WIDTH : MOVIE_POSTER_WIDTH;
  const height = isScene ? SCENE_POSTER_HEIGHT : MOVIE_POSTER_HEIGHT;
  const [hasPosterError, setHasPosterError] = React.useState(false);
  const elementStyle = { width: `${width}px`, height: `${height}px` };
  const link = isScene
    ? `/movie/${movie.foreignId}`
    : `/movie/${movie.titleSlug}`;

  const onPosterLoadError = useCallback(() => {
    setHasPosterError(true);
  }, []);

  const onPosterLoad = useCallback(() => {
    setHasPosterError(false);
  }, []);

  return (
    <div className={isScene ? styles.sceneCard : styles.movieCard}>
      <div className={styles.posterContainer} title={movie.title}>
        <Link className={styles.link} style={elementStyle} to={link}>
          {isScene ? (
            <ScenePoster
              className={styles.poster}
              safeForWorkMode={safeForWorkMode}
              style={elementStyle}
              images={movie.images}
              size={180}
              lazy={true}
              overflow={true}
              onError={onPosterLoadError}
              onLoad={onPosterLoad}
            />
          ) : (
            <MoviePoster
              className={styles.poster}
              safeForWorkMode={safeForWorkMode}
              style={elementStyle}
              images={movie.images}
              size={250}
              lazy={true}
              overflow={true}
              onError={onPosterLoadError}
              onLoad={onPosterLoad}
            />
          )}
          {hasPosterError ? (
            <div className={styles.overlayTitle}>{movie.title}</div>
          ) : null}
        </Link>
      </div>
      <div className={styles.title} title={movie.title}>
        {movie.title}
        {movie.year ? ` (${movie.year})` : ''}
      </div>
    </div>
  );
}

function PerformerDetailsPosterList({
  movies,
  safeForWorkMode,
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
      defaultHeight: MOVIE_POSTER_HEIGHT + 40,
      minHeight: SCENE_POSTER_HEIGHT + 40,
    })
  );

  const rows = useMemo(() => {
    const result: Movie[][] = [];
    let row: Movie[] = [];
    let rowWidth = 0;

    movies.forEach((movie) => {
      const cardWidth = getCardWidth(movie);

      if (row.length && rowWidth + cardWidth > width) {
        result.push(row);
        row = [];
        rowWidth = 0;
      }

      row.push(movie);
      rowWidth += cardWidth;
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
            {row.map((movie) => (
              <PerformerDetailsPoster
                key={movie.id}
                movie={movie}
                safeForWorkMode={safeForWorkMode}
              />
            ))}
          </div>
        </CellMeasurer>
      );
    },
    [rows, safeForWorkMode]
  );

  return (
    <List
      ref={listRef}
      autoHeight={true}
      height={height}
      width={width}
      rowCount={rows.length}
      rowHeight={cacheRef.current.rowHeight}
      estimatedRowSize={MOVIE_POSTER_HEIGHT + 40}
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
  safeForWorkMode,
  scrollContainer,
}: PerformerDetailsPostersProps) {
  return (
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
                  safeForWorkMode={safeForWorkMode}
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
  );
}

export default PerformerDetailsPosters;
