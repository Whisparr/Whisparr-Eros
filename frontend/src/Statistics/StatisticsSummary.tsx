import React from 'react';
import styles from './StatisticsSummary.css';

export interface SummaryTile {
  label: string;
  value: string;
}

interface StatisticsSummaryProps {
  tiles: SummaryTile[];
}

export default function StatisticsSummary({
  tiles,
}: Readonly<StatisticsSummaryProps>) {
  return (
    <div className={styles.summary}>
      {tiles.map((tile) => (
        <div key={tile.label} className={styles.tile}>
          <div className={styles.value}>{tile.value}</div>
          <div className={styles.label}>{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
