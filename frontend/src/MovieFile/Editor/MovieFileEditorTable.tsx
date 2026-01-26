import React from 'react';
import MovieFileEditorTableContentConnector from './MovieFileEditorTableContentConnector';
import styles from './MovieFileEditorTable.css';

export interface MovieFileEditorTableProps {
  movieId: number;
}
function MovieFileEditorTable({ movieId }: MovieFileEditorTableProps) {
  return (
    <div className={styles.container}>
      <MovieFileEditorTableContentConnector movieId={movieId} />
    </div>
  );
}

export default MovieFileEditorTable;
