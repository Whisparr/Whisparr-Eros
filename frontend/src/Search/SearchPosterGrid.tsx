import React from 'react';
import { useAppDimension } from 'App/appStore';
import MovieIndexPoster from 'Movie/Index/Posters/MovieIndexPoster';
import Movie from 'Movie/Movie';
import PerformerIndexPoster from 'Performer/Index/Posters/PerformerIndexPoster';
import Performer from 'Performer/Performer';
import SceneIndexPoster from 'Scene/Index/Posters/SceneIndexPoster';
import StudioIndexPoster from 'Studio/Index/Posters/StudioIndexPoster';
import Studio from 'Studio/Studio';
import dimensions from 'Styles/Variables/dimensions';
import { LibrarySearchType } from './useLibrarySearch';
import styles from './SearchPosterGrid.css';

// The index grids are virtualised against their page's scroller and assume
// they are the only thing in it, so they can't be stacked on one page. A page
// of search results is small enough to render in a plain wrapping grid.
const COLUMN_WIDTH: Record<LibrarySearchType, [number, number]> = {
  scene: [310, 300],
  movie: [182, 172],
  performer: [182, 172],
  studio: [262, 252],
};

const ASPECT_RATIO: Record<LibrarySearchType, number> = {
  scene: 170 / 300,
  movie: 250 / 170,
  performer: 250 / 170,
  studio: 170 / 250,
};

const COLUMN_PADDING = Number.parseInt(dimensions.movieIndexColumnPadding, 10);
const COLUMN_PADDING_SMALL_SCREEN = Number.parseInt(
  dimensions.movieIndexColumnPaddingSmallScreen,
  10
);

type SearchPosterGridProps =
  | { type: 'scene' | 'movie'; items: readonly Movie[] }
  | { type: 'performer'; items: readonly Performer[] }
  | { type: 'studio'; items: readonly Studio[] };

function SearchPosterGrid(props: Readonly<SearchPosterGridProps>) {
  const isSmallScreen = useAppDimension('isSmallScreen');
  const { type } = props;

  const padding = isSmallScreen ? COLUMN_PADDING_SMALL_SCREEN : COLUMN_PADDING;
  const columnWidth = COLUMN_WIDTH[type][isSmallScreen ? 1 : 0];
  const posterWidth = columnWidth - padding * 2;
  const posterHeight = Math.ceil(ASPECT_RATIO[type] * posterWidth);
  const cellStyle = { width: columnWidth, padding };

  const common = {
    sortKey: 'title',
    isSelectMode: false,
    posterWidth,
    posterHeight,
  };

  return (
    <div className={styles.grid}>
      {props.type === 'scene' &&
        props.items.map((scene) => (
          <div key={scene.id} style={cellStyle}>
            <SceneIndexPoster scene={scene} {...common} />
          </div>
        ))}

      {props.type === 'movie' &&
        props.items.map((movie) => (
          <div key={movie.id} style={cellStyle}>
            <MovieIndexPoster movie={movie} {...common} />
          </div>
        ))}

      {props.type === 'performer' &&
        props.items.map((performer) => (
          <div key={performer.id} style={cellStyle}>
            <PerformerIndexPoster performer={performer} {...common} />
          </div>
        ))}

      {props.type === 'studio' &&
        props.items.map((studio) => (
          <div key={studio.id} style={cellStyle}>
            <StudioIndexPoster studio={studio} {...common} />
          </div>
        ))}
    </div>
  );
}

export default SearchPosterGrid;
