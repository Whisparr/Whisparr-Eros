import React from 'react';
import Scroller from 'Components/Scroller/Scroller';
import { HORIZONTAL } from 'Helpers/Props/scrollDirections';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import { useMovieIndexOption } from '../movieIndexOptionsStore';
import MovieIndexRow from './MovieIndexRow';
import MovieIndexTableHeader from './MovieIndexTableHeader';
import styles from './MovieIndexTable.css';

interface MovieIndexTableProps {
  items: Movie[];
  sortKey: string;
  sortDirection?: SortDirection;
  isSelectMode: boolean;
  isSmallScreen: boolean;
}

function MovieIndexTable(props: MovieIndexTableProps) {
  const { items, sortKey, sortDirection, isSelectMode } = props;
  const columns = useMovieIndexOption('columns');

  return (
    <Scroller className={styles.tableScroller} scrollDirection={HORIZONTAL}>
      <MovieIndexTableHeader
        columns={columns}
        sortKey={sortKey}
        sortDirection={sortDirection}
        isSelectMode={isSelectMode}
      />
      {items.map((movie) => (
        <div key={movie.id} className={styles.row}>
          <MovieIndexRow
            movie={movie}
            sortKey={sortKey}
            columns={columns}
            isSelectMode={isSelectMode}
          />
        </div>
      ))}
    </Scroller>
  );
}

export default MovieIndexTable;
