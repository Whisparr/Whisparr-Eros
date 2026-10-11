import React from 'react';
import ExtraFileTableContentConnector from './ExtraFileTableContentConnector';
import styles from './ExtraFileTable.module.css';

interface ExtraFileTableProps {
  movieId: number;
}

function ExtraFileTable({ movieId }: ExtraFileTableProps) {
  return (
    <div className={styles.container}>
      <ExtraFileTableContentConnector movieId={movieId} />
    </div>
  );
}

export default ExtraFileTable;
